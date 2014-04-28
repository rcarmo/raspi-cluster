# Server Setup

The server uses a Wi-Fi dongle as `wlan0` and runs:
* `dnsmasq` to configure the clients via DHCP
* `iptables` to provide them with connectivity to the outside via NAT
* `nfs-kernel-server` and `rpcbind` to provide NFS access to a shared folder
