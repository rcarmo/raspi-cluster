#
# Test listener for multicast stats
#
# Rui Carmo, 2014, MIT Licensed
#

from json import loads
from struct import pack
from socket import inet_aton, socket, AF_INET, SOCK_DGRAM, IP_ADD_MEMBERSHIP, INADDR_ANY, IPPROTO_IP, IPPROTO_UDP, SOL_IP, SOL_SOCKET, SO_REUSEADDR
from time import time
from blinkt import set_clear_on_exit, set_brightness, set_pixel, show
from colorsys import hsv_to_rgb
from gradient import poly_gradient

BIND_ADDR = '10.0.0.1'
MCAST_GRP = '224.0.0.251'
MCAST_PORT = 6000
HUE_RANGE = 120
HUE_START = 0
MAX_BRIGHTNESS = 0.2
PIXEL_TABLE = {
    "master": 7,
    "node1": 6,
    "node2": 5,
    "node3": 4,
    "node4": 3
}
CPU_GRADIENT = list(poly_gradient([(0.0, 0.3, 0.0), (6.0, 0.0, 0.0), (1.0, 1.0, 0.0)], 100))

class Struct(object):
  def __init__(self, adict):
    self.__dict__.update(adict)


def get_socket(mcast_addr = MCAST_GRP, port = MCAST_PORT, addr = BIND_ADDR):
    sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP)
    sock.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
    # bind this to the master node's IP address
    sock.setsockopt(SOL_IP, IP_ADD_MEMBERSHIP, inet_aton(mcast_addr) + inet_aton(addr))
    sock.bind((mcast_addr, port))
    mreq = pack("4sl", inet_aton(mcast_addr), INADDR_ANY)
    sock.setsockopt(IPPROTO_IP, IP_ADD_MEMBERSHIP, mreq)
    return sock


def update_pixel(data):
    pixel = PIXEL_TABLE[data.hostname]
    temp_ratio = data.cputemp / 80.0
    #hue = HUE_START + (data.cpuusage * HUE_RANGE)
    brightness = min(MAX_BRIGHTNESS, MAX_BRIGHTNESS * temp_ratio + data.cpuusage/4)
    #r, g, b = [int(c * 255) for c in hsv_to_rgb(hue,1.0,1.0)]
    r, g, b = map(lambda x: min(255, x * 255), CPU_GRADIENT[int(data.cpuusage * 100)-1])
    print data.hostname, r, g, b, data.cpuusage, temp_ratio, brightness
    set_pixel(pixel, r, g, b, brightness)
    show()


def main(sock):
    set_clear_on_exit()
    set_brightness(0.1)

    while True:
        data, srv_sock = sock.recvfrom(8192)
        srv_addr, srv_srcport = srv_sock[0], srv_sock[1]
        data = Struct(loads(data.replace('\0','')))
        try:
            if data.hostname in PIXEL_TABLE:
                update_pixel(data)
        except AttributeError:
            pass


if __name__ == '__main__':
    main(get_socket())
