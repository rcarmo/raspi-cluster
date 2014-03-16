#
# Test listener for multicast stats
#
# Rui Carmo, 2014, MIT Licensed
#

import socket
import struct
import json

MCAST_GRP = '224.0.0.251'
MCAST_PORT = 6000

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

# bind this to the master node's IP address
sock.setsockopt(socket.SOL_IP,socket.IP_ADD_MEMBERSHIP,
                socket.inet_aton(MCAST_GRP)+socket.inet_aton('10.0.0.1'))

sock.bind((MCAST_GRP, MCAST_PORT))
mreq = struct.pack("4sl", socket.inet_aton(MCAST_GRP), socket.INADDR_ANY)

sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

while True:
    data, srv_sock = sock.recvfrom(8192)
    srv_addr, srv_srcport = srv_sock[0], srv_sock[1]
    print srv_addr, json.loads(data.replace('\0',''))
