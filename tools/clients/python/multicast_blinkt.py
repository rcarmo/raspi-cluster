#
# Test listener for multicast stats
#
# Rui Carmo, 2014, MIT Licensed
#

from json import loads
from struct import pack
from socket import inet_aton, socket, AF_INET, SOCK_DGRAM, IP_ADD_MEMBERSHIP, INADDR_ANY, IPPROTO_IP, IPPROTO_UDP, SOL_IP, SOL_SOCKET, SO_REUSEADDR
from time import time
from blinkt import set_clear_on_exit, set_pixel, show

MCAST_GRP = '224.0.0.251'
MCAST_PORT = 6000

sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP)
sock.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)

# bind this to the master node's IP address
sock.setsockopt(SOL_IP, IP_ADD_MEMBERSHIP,
                inet_aton(MCAST_GRP) + inet_aton('10.0.0.1'))

sock.bind((MCAST_GRP, MCAST_PORT))
mreq = pack("4sl", inet_aton(MCAST_GRP), INADDR_ANY)

sock.setsockopt(IPPROTO_IP, IP_ADD_MEMBERSHIP, mreq)

while True:
    data, srv_sock = sock.recvfrom(8192)
    srv_addr, srv_srcport = srv_sock[0], srv_sock[1]
    print srv_addr, loads(data.replace('\0',''))
