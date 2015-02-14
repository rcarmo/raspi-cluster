/*
 * Raspberry Pi/Pi 2 system monitor
 *
 * This quick and dirty program sends out a JSON-formatted UDP multicast packet with system statistics every 2 seconds
 * - which is useful not just for cluster monitoring but also as a visible heartbeat
 *
 * Rui Carmo, 2014/2015, MIT licensed.
 */

#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <time.h>
#include <stdio.h>
#include <stdlib.h>
#include <strings.h>
#include <unistd.h>

// Uncomment this for memory leak checking with mtrace
//#include <mcheck.h>

#define ANNOUNCEMENT_GROUP "224.0.0.251"
#define ANNOUNCEMENT_PORT 6000
#define ANNOUNCEMENT_TEMPLATE "{\"cpufreq\":%d,\"cputemp\":%f,\"cpuusage\":%f,\"coreusage\":[%s],\"loadavg\":%s,\"meminfo\":{%s}}"
#define MAX_LENGTH 1024
#define MAX_CORES 4
#define CPU_STAT_COUNT 7 /* user, nice, system, idle, iowait, irq, softirq */

char loadavg_buffer[MAX_LENGTH];
char meminfo_buffer[MAX_LENGTH];
float core_usage[MAX_CORES+1];

/*
 * Get current CPU frequency
 */
int get_cpufreq(void) {
    int freq = 0;
    FILE *fp;
   
    fp = fopen("/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq", "r");
    if (fp != NULL) {
        freq = 0;
        while (!feof(fp)) {
            if(fscanf(fp, "%d", &freq) == 1)
                break;
        }
    }
    fclose(fp);
    return freq / 1000;
}


/*
 * Get CPU temperature (specific to the Raspberry Pi)
 */
double get_cputemp(void) {
    double temp = 0;
    char line[MAX_LENGTH];
    FILE *fp;
  
    fp = fopen("/sys/class/thermal/thermal_zone0/temp", "r");
    if (fp != NULL) {
        fgets(line, MAX_LENGTH, fp);
        temp = strtod(strtok(line, " \n"), NULL) / 1000;
    }
    fclose(fp);
    return temp;
}


/*
 * Get load average
 */
char *get_loadavg(void) {
    FILE *fp;
    char line[MAX_LENGTH];
    char dummy[16];
    double load[3];
    int i;
   
    fp = fopen("/proc/loadavg", "r");
    if (fp != NULL) {
        fgets(line, MAX_LENGTH, fp);
        load[0] = strtod(strtok(line, " \n"), NULL);
        for(i=1;i<3;i++)
            load[i] = strtod(strtok(NULL, " \n"), NULL);
        sprintf(loadavg_buffer, "[%f,%f,%f]", load[0],load[1],load[2]);
    }
    fclose(fp);
    return loadavg_buffer;
}


/*
 * Get CPU usage by measuring jiffie counters - returns number of cores sampled
 */
int get_cpuusage(int interval) {
    FILE *fp;
    char line[MAX_LENGTH];
    long stat[CPU_STAT_COUNT*(MAX_CORES+1)]  = {0};
    long delta[CPU_STAT_COUNT*(MAX_CORES+1)] = {0};
    int  i, j, c, sum, offset = 0;
    float usage;
   
    /* First, sample current jiffie counters */
    fp = fopen("/proc/stat", "r");
    if (fp != NULL) {
        for(c=0;c<=MAX_CORES;c++) {
            fgets(line, MAX_LENGTH, fp);
            if(strncmp(strtok(line, " \n"), "cpu", 3) == 0) {
                offset = c * CPU_STAT_COUNT;
                for(i=0;i<CPU_STAT_COUNT;i++)
                    stat[i+offset] = strtol(strtok(NULL, " \n"), NULL, 10);
            }
            else break;
        }
    }
    fclose(fp);

    /* Now give the kernel time to update them */
    sleep(interval);

    /* And resample */
    fp = fopen("/proc/stat", "r");
    if (fp != NULL) {
        for(c=0;c<=MAX_CORES;c++) {
            fgets(line, MAX_LENGTH, fp);
            if(strncmp(strtok(line, " \n"), "cpu", 3) == 0) {
                offset = c * CPU_STAT_COUNT;
                for(i=0;i<CPU_STAT_COUNT;i++)
                    delta[i+offset] = strtol(strtok(NULL, " \n"), NULL, 10);
            }
            else break;
        }
    }
    fclose(fp);

    /* Now compute the deltas and total time spent in each state */
    for(j=0;j<c;j++) {
        sum = 0;
        offset = j * CPU_STAT_COUNT;
        for(i=0;i<7;i++) {
            delta[i+offset] -= stat[i+offset];
            sum += delta[i+offset];
        }
        if(sum > 0) { /* function of idle time */
            core_usage[j] = 1.0 - (delta[offset+3] / (1.0 * sum));
        }
	else core_usage[j] = 0.0;
    }
    return c;
}


/*
 * Get ram and swap info
 */
char *get_meminfo(void) {
    FILE *fp;
    char unit[2];
    char label[128];
    char buffer[128];
    char *colon;
    int  value;
   
    bzero(&meminfo_buffer, MAX_LENGTH);
    fp = fopen("/proc/meminfo", "r");
    if (fp != NULL) {
        while (!feof(fp)) {
            // fscanf is ugly, but serves us well here
            if(fscanf(fp, "%s %d %2s", label, &value, unit) != 3)
                break;
            colon = strchr(label,':');
            if(colon != NULL)
                *colon = '\0';
            if(!strncmp(unit, "kB", 2)) {
                sprintf(buffer, "\"%s\":%d,", label, value);
                strcat(meminfo_buffer, buffer);
            }
        }
    }
    fclose(fp);
    value = strlen(meminfo_buffer);
    if(value) {
        meminfo_buffer[value-1] = '\0'; /* strip comma */
    }
    return meminfo_buffer;
}


int main() {
    struct sockaddr_in addr;
    int    i, msg_len, addr_len, sock, count;
    char   msg[MAX_LENGTH], usage[MAX_LENGTH], scratch[MAX_LENGTH];

    //mtrace();

    /* set up socket */
    char *opt;
    opt = "eth0"; 
    sock = socket(AF_INET, SOCK_DGRAM, 0);
    setsockopt(sock, SOL_SOCKET, SO_BINDTODEVICE, opt, strlen(opt));
    if (sock < 0) {
        perror("Could not create socket, exiting");
        exit(2);
    }
    bzero((char *)&addr, sizeof(addr));
    addr.sin_family      = AF_INET;
    addr.sin_addr.s_addr = inet_addr(ANNOUNCEMENT_GROUP);
    addr.sin_port        = htons(ANNOUNCEMENT_PORT);
    addr_len             = sizeof(addr);

    while (1) {
        bzero((char *)&usage, MAX_LENGTH);
        count = get_cpuusage(2);
        for(i=1;i<count;i++) { // skip aggregate count
            sprintf(scratch, "%f,", core_usage[i]);
            strcat(usage, scratch);
        }
        i = strlen(usage);
        if(i) {
            usage[i-1] = '\0'; /* strip comma */
        }
        msg_len = sprintf(msg, ANNOUNCEMENT_TEMPLATE, get_cpufreq(), get_cputemp(), core_usage[0], usage, get_loadavg(), get_meminfo());
        // note that we're not sending msg_len + 1 data to avoid sending the \0.
        count = sendto(sock, msg, msg_len, 0, (struct sockaddr *) &addr, addr_len);
        if (count < 0) {
            perror("Error sending message");
            //exit(1); we shouldn't die due to transient failures
        }
    }
    //muntrace();
}

