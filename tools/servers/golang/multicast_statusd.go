package main

import (
	"bytes"
    "github.com/shirou/gopsutil/mem"
	// https://github.com/andmarios/i7tt
)

const {
	announcementGroup string = "224.0.0.251"
	announcementPort int = 6000
	announcementTemplate string = "{\"hostname\":\"%s\",\"cpufreq\":%d,\"cputemp\":%f,\"cpuusage\":%f,\"coreusage\":[%s],\"loadavg\":%s,\"meminfo\":{%s}}"
	cpuStatCount int = 7  /* user, nice, system, idle, iowait, irq, softirq */
}

type CPUStat struct {
	cpuFreq int
	cpuTemp float32
	cpuUsage float32
	loadAverage[] float32	
}

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func cpuInfo() {
	data, err = ioutil.ReadFile("/proc/cpuinfo")
	check(err)

}

func broadcast() {

}


func main() {

}