package main

import (
	"io"
	"log"
	"net"
	"runtime"
	"time"
)

var logger *log.Logger

func dial(addr *string, count chan int) {
	conn, err := net.Dial("tcp", *addr)
	if err != nil {
		log.Panic(err)
	}
	count <- 1
    _, err = conn.Write([]byte("GET /events\nHost: localhost\n\n"))
	if err != nil {
		log.Panic(err)
	}
	for {
		resp := make([]byte, 1024)
		_, err := conn.Read(resp)
		if err != nil && err != io.EOF {
			count <- -1
		}
		time.Sleep(1)
	}
}

func counter(live chan int) {
	seen := 0
	log.Println("Counter running")
	for {
		seen = seen + <-live
		log.Println("Live", seen)
	}
}

func spawn(count int, url *string, bindaddr string) {
	seen := make(chan int, 1)
	for i := 0; i < count; i++ {
		log.Println("Spawning", i)
		go dial(url, seen)
	}
	counter(seen)
}

func main() {
    addr := "localhost:8888"
	runtime.GOMAXPROCS(4)
	spawn(100, &addr, "")
}
