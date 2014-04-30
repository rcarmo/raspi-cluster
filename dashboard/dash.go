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
	"time"
    "strings"
	//    "bufio"
	//    "os"
	//    "encoding/json"
)

var listenPort int = 8080
var staticPath string = "static"
var multicastAddr string = "224.0.0.251:6000"
var hostCache map[string]string

func Source(es eventsource.EventSource) {
	id := 1
	for {
		es.SendMessage("tick", "tick-event", strconv.Itoa(id))
		id++
		time.Sleep(5 * time.Second)
	}
}

func lookup(ip string) string {
    var hostname = hostCache[ip]
    if hostname == "" {
        result, err := net.LookupAddr(ip)
        if err != nil {
			log.Fatal(err)
        }
        hostname = strings.Split(result[0],".")[0]
        hostCache[ip] = hostname
    }
    return hostname
}

func do_listen(conn *net.UDPConn, es eventsource.EventSource) {
	// listens to UDP data and injects events after parsing them

	for {
		buffer := make([]byte, 16384)
		_, from, err := conn.ReadFromUDP(buffer)
		if err != nil {
			log.Fatal(err)
		}
        fmt.Println(lookup(from.IP.String()), string(buffer))
	}
}

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
