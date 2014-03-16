; vim: ai:ts=2:sw=2

(ns cluster-monitor.core
  (:import (java.net InetAddress InetSocketAddress DatagramPacket MulticastSocket))
  (:require [clojure.data.json :as json])
  (:gen-class))

(def max-packet-size 1512)

(defn create-socket
  "Create and bind the multicast socket"
  [address port]
  (let [socket (MulticastSocket. port)]
    ; bind this to the default interface (nil)
    (.joinGroup socket (InetSocketAddress. (InetAddress/getByName address) port) nil)
    socket))

(defn receive-packet
  "Receive data and try parsing it as JSON"
  [^MulticastSocket socket]
  (let [buffer (byte-array max-packet-size)
        packet (DatagramPacket. buffer max-packet-size)]
    (.receive socket packet)
    (try
      (json/read-str
        (String. (.getData packet)
                0 (.getLength packet)))
      (catch Exception e
        (do (println "Error parsing JSON: " (.getMessage e))
          nil)))))

(defn receive-loop
  [socket f]
  (future (while true (f (receive-packet socket)))))

(defn -main
  [& args]
  (receive-loop (create-socket "224.0.0.251" 6000) println)
  (println "Receiving..."))
