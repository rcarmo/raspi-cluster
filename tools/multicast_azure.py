#
# Send multicast data to Azure Service Bus
#
# Rui Carmo, 2014, MIT Licensed
#

from socket import socket, inet_aton, AF_INET, SOCK_DGRAM, INADDR_ANY, IPPROTO_IP, IPPROTO_UDP, IP_ADD_MEMBERSHIP, SOL_IP, SOL_SOCKET, SO_REUSEADDR
from struct import pack
from json import loads, dumps
from base64 import b64encode, b64decode
from hashlib import sha256
from time import time
from urllib import quote_plus, urlencode
from hmac import HMAC
from httplib import HTTPConnection
from azure.servicebus import ServiceBusService


MCAST_GRP = '224.0.0.251'
MCAST_PORT = 6000

sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP)
sock.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)

# bind this to the master node's IP address
sock.setsockopt(SOL_IP, IP_ADD_MEMBERSHIP,
                inet_aton(MCAST_GRP)+inet_aton('10.0.0.1'))

sock.bind((MCAST_GRP, MCAST_PORT))
mreq = pack("4sl", inet_aton(MCAST_GRP), INADDR_ANY)
sock.setsockopt(IPPROTO_IP, IP_ADD_MEMBERSHIP, mreq)

sbs = ServiceBusService(service_namespace='knockknockknock',
                        shared_access_key_name='RootManageSharedAccessKey',
                        shared_access_key_value=environ['ACCESS_KEY]')
sbs.create_event_hub('penny')

while True:
    data, srv_sock = sock.recvfrom(8192)
    srv_addr, srv_srcport = srv_sock[0], srv_sock[1]
    data = loads(data.replace('\0',''))
    data['srv_addr'] = srv_addr
    print data
    sbs.send_event('penny', unicode(dumps(data)))
