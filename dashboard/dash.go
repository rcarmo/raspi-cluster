package main

import (
	"fmt"
	eventsource "github.com/antage/eventsource/http"
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
	//    "os"
	"encoding/json"
)

var listenPort int = 8080
var staticPath string = "static"
var multicastAddr string = "224.0.0.251:6000"
var hostCache map[string]string

// A partial breakdown of the memory information

type Metrics struct {
    CpuFreq  float64 `json:"cpufreq"`
    CpuTemp  float64 `json:"cputemp"`
    CpuUsage float64 `json:"cpuusage"`
    LoadAvg  [3]float64 `json:"loadavg"`
	MemInfo  struct {
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

func Source(es eventsource.EventSource) {
	id := 1
	for {
		es.SendMessage("tick", "tick-event", strconv.Itoa(id))
		id++
		time.Sleep(5 * time.Second)
	}
}

// reverse lookup an IP address, caching the results
func reverse_lookup(ip string) string {
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

// listens to UDP data and injects events after parsing them
func do_listen(conn *net.UDPConn, es eventsource.EventSource) {
	var m Metrics
	buffer := make([]byte, 16384)
	for {
		size, from, err := conn.ReadFromUDP(buffer)
		if err != nil {
			log.Fatal(err)
		}
        err = json.Unmarshal(buffer[:size], &m)
		if err != nil {
			log.Fatal(err)
		}
        /*
        test, err := json.Marshal(m)
		if err != nil {
            log.Print("here")
			log.Fatal(err)
		}
        */
		fmt.Println(reverse_lookup(from.IP.String()),m)
	}
}

// set up the multicast listener
func MulticastListener(es eventsource.EventSource) {
	// now try to listen to our specific group
	mcaddr, err := net.ResolveUDPAddr("udp", multicastAddr)
	conn, err := net.ListenMulticastUDP("udp", nil, mcaddr)
	if err != nil {
		log.Fatal(err)
	}
	go do_listen(conn, es)
}

func main() {
	hostCache = make(map[string]string)
	es := eventsource.New(nil, nil)
	defer es.Close()

	http.Handle("/event", es)
	go Source(es)
	go MulticastListener(es)

	// Serve static files
	// http.Handle("/", autogzip.Handle(http.FileServer(http.Dir(staticPath))))
	http.Handle("/", http.FileServer(http.Dir(staticPath)))

	err := http.ListenAndServe(fmt.Sprintf(":%d", listenPort), nil)
	if err != nil {
		log.Fatal(err)
	}
}
