# raspi-cluster

## What?

A few months back, I decided I'd build a small cluster of [Raspberry Pi][rpi] boards, and this repository will be used for versioning design notes, configuration files and sundry.

## Why?

I wanted something challenging to do in terms of distributed processing, and lacked dedicated hardware to do it.

## How?

The cluster consists of five nodes: a master and four slaves. The master acts as a gateway, DHCP and NFS server (using Wi-Fi as an uplink, since that's more convenient for me) and the slave nodes get their IP address and `/mnt/jobs` directory from it.

All slave nodes should be identical -- _completely_ identical, except for the MAC address, and there should be _zero_ need to log in and configure things manually for each node.

A larger cluster is certainly feasible, but 5 boards is as much as I can power with the PSU I have.

## Software

The cluster will run MPI-enabled Linux, but the first jobs will be mostly [Clojure][clj] programs using [Hazelcast][hz] atop JDK 1.8

It's a bit ironic to run an in-memory data grid on what is essentially 2.5GB of aggregated RAM, but I'm interested in the algorithms themselves and don't plan on doing something silly like tackling the next Netflix Prize with this.

Besides, running things on low-end hardware is often the only way to do proper optimization.

## But isn't the [Raspberry Pi][rpi] slow?

Well spotted, young person. It is, even with the early releases of JDK 1.8. But it's also cheap, and beggars can't be choosers.

But I'm open to [sponsoring][d] so that I can upgrade this to be based on 4 or 5 boards like the [ODROID-U3][u3] (I have an [U2][u2] and love it).

[rpi]: http://www.raspberrypi.org
[d]: http://the.taoofmac.com/space/site/Donate
[u2]: http://hardkernel.com/main/products/prdt_info.php?g_code=G135341370451
[u3]: http://hardkernel.com/main/products/prdt_info.php?g_code=G138733896281
[clj]: http://www.clojure.org
[hz]: http://www.hazlecast.org
