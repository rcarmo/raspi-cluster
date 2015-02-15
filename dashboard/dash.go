package main

import (
	"fmt"
	"github.com/antage/eventsource"
	"github.com/gorilla/handlers"
	//"github.com/bmizerany/pat"          // Sinatra-like router
	//"github.com/fiorix/go-web/autogzip" // gzip support
	//"github.com/hoisie/mustache"  Mustache-like templating engine
	"log"
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"
	//    "bufio"
	"os"
	"encoding/json"
)

var listenPort int = 8888
var staticPath string = "static"
var multicastAddr string = "224.0.0.251:6000"
var hostCache map[string]string

type Metrics struct {
	CpuFreq   float64    `json:"cpufreq"`
	CpuTemp   float64    `json:"cputemp"`
	CpuUsage  float64    `json:"cpuusage"`
	CoreUsage [4]float64 `json:"coreusage"`
	LoadAvg   [3]float64 `json:"loadavg"`
	// A partial breakdown of the memory information
	MemInfo struct {
		MemTotal   float64
		MemFree    float64
		Buffers    float64
		Cached     float64
		SwapCached float64
		Active     float64
		Inactive   float64
		SwapTotal  float64
		SwapFree   float64
	} `json:"meminfo"`
}

func ClockSource(es eventsource.EventSource) {
	id := 1
	for {
		es.SendEventMessage(fmt.Sprintf("%d", es.ConsumersCount()), "consumer-count", "")
		es.SendEventMessage("tick", "tick-event", strconv.Itoa(id))
		id++
		time.Sleep(5 * time.Second)
	}
}

// reverse lookup an IP address, caching the results
func reverseLookup(ip string) string {
	var hostname = hostCache[ip]
	if hostname == "" {
		result, err := net.LookupAddr(ip)
		if err != nil {
			log.Fatal(err)
		}
		hostname = strings.Split(result[0], ".")[0]
		hostCache[ip] = hostname
	}
	return hostname
}

func parseAndSendMetrics(host string, buffer []byte, es eventsource.EventSource) {
	var m Metrics
	err := json.Unmarshal(buffer, &m)
	if err != nil {
		fmt.Println(err)
		return
	}
	//fmt.Println(host, m)
	es.SendEventMessage(fmt.Sprintf("%f", m.CpuFreq), fmt.Sprintf("%s-%s", host, "cpufreq"), "")
	es.SendEventMessage(fmt.Sprintf("%f", m.CpuTemp), fmt.Sprintf("%s-%s", host, "cputemp"), "")
	usage, _ := json.Marshal(m.CoreUsage)
	es.SendEventMessage(string(usage), fmt.Sprintf("%s-%s", host, "coreusage"), "")
	es.SendEventMessage(fmt.Sprintf("%f", m.CpuUsage), fmt.Sprintf("%s-%s", host, "cpuusage"), "")
}

// listens to UDP data and injects events after parsing them
func doListen(conn *net.UDPConn, es eventsource.EventSource) {
	buffer := make([]byte, 16384)
	for {
		size, from, err := conn.ReadFromUDP(buffer)
		if err != nil {
			log.Fatal(err)
		}
		host := reverseLookup(from.IP.String())
		go parseAndSendMetrics(host, buffer[:size], es)
	}
}

// set up the multicast listener
func MulticastListener(es eventsource.EventSource) {
	// now try to listen to our specific group
	intf, err := net.InterfaceByName("eth0")
	if err != nil {
		log.Fatal(err)
	}
	mcaddr, err := net.ResolveUDPAddr("udp", multicastAddr)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Listening on interface %s\n", intf.HardwareAddr)
	conn, err := net.ListenMulticastUDP("udp", intf, mcaddr)
	if err != nil {
		log.Fatal(err)
	}
	addrs, err := intf.MulticastAddrs()
	if err != nil {
		log.Fatal(err)
	}
	for i := 0; i < len(addrs); i++ {
		fmt.Printf("%s\n", addrs[i])
	}

	go doListen(conn, es)
}

func main() {
	hostCache = make(map[string]string)
	es := eventsource.New(nil, nil)
	defer es.Close()

	http.Handle("/events", es)
	go ClockSource(es)
	go MulticastListener(es)

	// Serve static files
	// http.Handle("/", autogzip.Handle(http.FileServer(http.Dir(staticPath))))
	http.Handle("/", http.FileServer(http.Dir(staticPath)))

	err := http.ListenAndServe(fmt.Sprintf(":%d", listenPort), handlers.CombinedLoggingHandler(os.Stdout, http.DefaultServeMux))
	if err != nil {
		log.Fatal(err)
	}
}
