# k3s on the raspi-cluster

I've started playing around with [k3s][k3s] for [several things][az], and _of course_ I got it running on my Raspberry Pi 2 cluster.

In this instance, I just used Raspbian Stretch and set it up using the downloadable installer.

The `Makefile` in this folder has the correct targets for setting it up, upgrading and rebooting the cluster in an orderly fashion, as well as a `toml` file that enables the cluster to use my private registry.

If you have SSH keys set up already, all you need is to do `make setup`, and you should be golden.

The `scripts` folder contains older deployment files and scripts I used when I set up Kubernetes "the hard way".

[k3s]: http://k3s.io
[az]: https://github.com/rcarmo/azure-k3s-cluster