# raspi-cluster

![Cabled](https://raw.github.com/rcarmo/raspi-cluster/master/pics/ethernet.jpg)

## What?

A few months back, I decided I'd build a small cluster of [Raspberry Pi][rpi] boards, and this repository will be used for versioning design notes, configuration files and sundry.

## Why?

I wanted something challenging to do in terms of distributed processing, and lacked dedicated hardware to do it.

## How?

The cluster consists of five nodes: a master and four slaves. The master acts as a gateway, DHCP and NFS server and the slave nodes get their IP address and `/mnt/jobs` directory from it.

All slave nodes should be identical -- _completely_ identical, except for the MAC address, and there should be _zero_ need to log in and configure things manually for each node.

Here's a couple more shots of it, with the 5-port PSU and the initial assembly:

![Power cords](https://raw.github.com/rcarmo/raspi-cluster/master/pics/micro_usb.jpg)
![First assembly](https://raw.github.com/rcarmo/raspi-cluster/master/pics/first_assembly.jpg)

In retrospect I probably ought to have gone for longer USB cables and moved all of the cabling to the USB side (since it leaves the SD card slot clear), but I also need to be able to see the activity lights, and the Pi isn't exactly designed for easy stacking.

A larger cluster is certainly feasible, but 5 boards is as much as I can power with the PSU I have.

## Hardware

This is a partial list of the stuff I'm using, and which I'll be updating:

* 5 Raspberry Pi Model B boards (duh!)
* [TP-Link 5-port Ethernet switch](http://www.amazon.co.uk/TP-Link-TL-SF1005D-100Mbps-Unmanaged-Desktop/dp/B000FNFSPY/ref=as_li_tf_tl?ie=UTF8&tag=thtaofma-21&linkCode=as2&camp=1634&creative=6738)
* [6 inch micro USB cables](http://www.amazon.co.uk/gp/product/B003YKX6WM/ref=as_li_tf_tl?ie=UTF8&tag=thtaofma-21&linkCode=as2&camp=1634&creative=6738)
* [5 port USB PSU](http://www.amazon.co.uk/gp/product/B00EKDVGKQ/ref=as_li_tf_tl?ie=UTF8&tag=thtaofma-21&linkCode=as2&camp=1634&creative=6738)
* [Ultra-cheap USB Ethernet adapter](http://www.amazon.co.uk/gp/product/B009UOG3NU/ref=as_li_tf_tl?ie=UTF8&tag=thtaofma-21&linkCode=as2&camp=1634&creative=6738) -- NOTE: the ARM driver for this panics the kernel, so I'm back using a Wi-Fi dongle.
* An ancient Bondie Blue iMac USB keyboard.
* Custom-printed rack mount base -- I'll eventually draft a "normal" case to hold the boards upright, but for now this does the trick.
* Some rubber bands (seriously, how else would I manage the cabling)?

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
