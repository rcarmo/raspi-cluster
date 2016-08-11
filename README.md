[![Stories in Ready](https://badge.waffle.io/rcarmo/raspi-cluster.png?label=ready&title=Ready)](https://waffle.io/rcarmo/raspi-cluster)
# raspi-cluster

![Pi 2](https://raw.github.com/rcarmo/raspi-cluster/master/pics/pi2.jpg)

## What?

A while ago I decided to build a small cluster of [Raspberry Pi][rpi] boards. I've since upgraded to Pi 2 boards, and this repository is used for versioning design notes, configuration files and sundry.

## Why?

I wanted something challenging to do in terms of distributed processing, and lacked dedicated hardware to do it. There's a lot to be learned even from simple, unsophisticated solutions, and virtual machines can only do so much.

## How?

The cluster consists of five nodes: a master and four slaves. The master acts as a gateway, DHCP and NFS server and the slave nodes get their IP address and `/srv/jobs` directory from it.

All slave nodes are identical -- _completely_ identical, except for hostname and MAC address, and there is no need to log in and configure things manually for each node.

Here's a few more shots of the original version, with the 5-port PSU and the old Model B boards:

![Cabled](https://raw.github.com/rcarmo/raspi-cluster/master/pics/ethernet.jpg)
![Power cords](https://raw.github.com/rcarmo/raspi-cluster/master/pics/micro_usb.jpg)
![First assembly](https://raw.github.com/rcarmo/raspi-cluster/master/pics/first_assembly.jpg)

In retrospect I probably ought to have gone for longer USB cables and moved all of the cabling to the USB side (since it leaves the SD card slot clear), but I also need to be able to see the activity lights, and the Pi isn't exactly designed for easy stacking.

A larger cluster is certainly feasible, but 5 boards is as much as I can power with the PSU I have.

## Hardware

This is a partial list of the stuff I'm using (Amazon UK affiliate links):

* 5x Raspberry Pi 2 Model B, which replaced the [Raspberry Pi Model B](http://www.amazon.co.uk/Raspberry-Pi-Model-512MB-RAM/dp/B008PT4GGC/ref=as_li_tf_tl?ie=UTF8&tag=thtaofma-21&linkCode=as2&camp=1634&creative=6738) boards (duh!)
* [7x Class 10 Micro SD Cards](http://www.amazon.co.uk/gp/product/B0036V5DGG/ref=as_li_tf_tl?ie=UTF8&tag=thtaofma-21&linkCode=as2&camp=1634&creative=6738) (2 master cards, 5 for production), which replaced the [Class 10 SD Cards](http://www.amazon.co.uk/gp/product/B003VNKNEG/ref=as_li_tf_tl?ie=UTF8&tag=thtaofma-21&linkCode=as2&camp=1634&creative=6738)
* [1x TP-Link 5-port Ethernet switch](http://www.amazon.co.uk/TP-Link-TL-SF1005D-100Mbps-Unmanaged-Desktop/dp/B000FNFSPY/ref=as_li_tf_tl?ie=UTF8&tag=thtaofma-21&linkCode=as2&camp=1634&creative=6738) and some ancient cables I had lying around (need to build new stripped down ones)
* [5x 6 inch micro USB cables](http://www.amazon.co.uk/gp/product/B003YKX6WM/ref=as_li_tf_tl?ie=UTF8&tag=thtaofma-21&linkCode=as2&camp=1634&creative=6738)
* [1x 5 port USB PSU](http://www.amazon.co.uk/gp/product/B00EKDVGKQ/ref=as_li_tf_tl?ie=UTF8&tag=thtaofma-21&linkCode=as2&camp=1634&creative=6738)
* [I tried this Ultra-cheap USB Ethernet adapter](http://www.amazon.co.uk/gp/product/B009UOG3NU/ref=as_li_tf_tl?ie=UTF8&tag=thtaofma-21&linkCode=as2&camp=1634&creative=6738) but the ARM driver for it panicked the kernel, so I switched to a Wi-Fi dongle instead.
* 1x ancient Bondi Blue iMac USB keyboard.
* 1x Custom-printed rack case (see SCAD files)

## Software

<<<<<<< HEAD
=======
As a base OS, I'm currently using [the Ubuntu 16.04 official image for the Pi 2][ub], which works much better than Raspbian for my purposes (nevertheless, the configuration files in this repo should work in both systems)

>>>>>>> 00b86f8... Update README.md
The cluster is now running mostly [Clojure][clj] programs using [Hazelcast][hz] atop JDK 1.8, as well as [Jupyter][jy], which runs very nicely indeed and provides me with an agnostic, notebook-oriented front-end.

I have also set up [Disco][dp] (and now [Spark][spark]) on it and intend to fiddle with MPI, but so far I have plenty of ways to parallelize things.

It's a bit ironic to do some kinds of processing on merely 5GB of aggregated RAM, but I'm interested in the algorithms themselves and don't plan on doing something silly like tackling the next Netflix Prize with this -- besides, running things on low-end hardware is often the only way to do proper optimization.

### List of packages involved so far:

* [etcd][etcd], which I'm now using to store (and distribute) configurations across nodes
* [Docker][do], which ships with Ubuntu 14.04 and makes it a lot easier to build and tear down environments. Currently trying to get 1.7 to build so I can use `swarm` and other niceties.
* [OpenVSwitch][ovs], which I'm using for playing around with network topologies
* [Jupyter][jy], which provides me with a nice web front-end and basic Python parallel computing.
* [Spark][spark], which has mostly replaced [Disco][dp] for map/reduce jobs.
* [Dash](https://github.com/rcarmo/dash), a real-time status dashboard (rewritten in [Go][golang], available under the `dashboard` folder here, and still being worked on)
* A custom daemon that sends out a JSON-formatted multicast packet with system load, CPU usage and RAM statistics (written in raw C, available in `tools`)
* [ElasticSearch](http://www.elasticsearch.org), which I'm using for storing metrics.
* Oracle [JDK 8](https://jdk8.java.net/download.html)
* [leiningen][lein] (which fetches [Hazelcast][hz] and other dependencies for me, via [this library][clj-hz])
* [Nightcode][nc] as a development environment ([LightTable][lt] doesn't run on ARM, and a lot of my hobby coding these days is actually done on an [ODROID][u2])
* `distcc` for building binaries slightly faster
* `dnsmasq` for DHCP and DNS service

Here's what the cluster dashboard looks like:

![Updated dashboard](https://raw.github.com/rcarmo/raspi-cluster/master/pics/dash.jpg)

## But isn't the [Raspberry Pi][rpi] slow?

Well spotted, young person. It was, and the Pi 2, despite being a marked improvement, isn't exactly a supercomputer. But it's also cheap, and beggars can't be choosers.

Nevertheless, the current configuration provides me with 20 ARMv7 cores clocked at 1GHz, and that's nothing to sneeze at.

But I'm open to [sponsoring][d] so that I can upgrade this to have at least twice as many boards...

[etcd]: https://github.com/coreos/etcd
[hz]: http://www.hazelcast.org
[rpi]: http://www.raspberrypi.org
[d]: http://the.taoofmac.com/space/site/Donate
[u2]: http://hardkernel.com/main/products/prdt_info.php?g_code=G135341370451
[u3]: http://hardkernel.com/main/products/prdt_info.php?g_code=G138733896281
[clj]: http://www.clojure.org
[hz]: http://www.hazlecast.org
[nc]: https://github.com/oakes/Nightcode
[lt]: http://lighttable.com
[moebius]: http://moebiuslinux.sourceforge.net
[lein]: http://leiningen.org
[clj-hz]: https://github.com/rcarmo/clj-hazelcast
[dp]: http://discoproject.org
[golang]: http://www.golang.org
[spark]: http://spark.apache.org
[jy]: http://jupyter.org
[ub]: https://wiki.ubuntu.com/ARM/RaspberryPi
[do]: http://docker.io
[ovs]: http://openvswitch.org/
