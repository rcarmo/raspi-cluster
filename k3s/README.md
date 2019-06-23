# k3s on the raspi-cluster

I've started playing around with [k3s][k3s] for [several things][az], and _of course_ I got it running on my Raspberry Pi 2 cluster:

```bash
pi@master:~ $ kubectl get nodes -o wide
NAME     STATUS   ROLES    AGE   VERSION         INTERNAL-IP   EXTERNAL-IP   OS-IMAGE                         KERNEL-VERSION   CONTAINER-RUNTIME
master   Ready    <none>   69d   v1.14.3-k3s.1   10.0.0.1      <none>        Raspbian GNU/Linux 9 (stretch)   4.14.98-v7+      containerd://1.2.5+unknown
node1    Ready    <none>   45d   v1.14.1-k3s.4   10.0.0.2      <none>        Raspbian GNU/Linux 9 (stretch)   4.14.98-v7+      containerd://1.2.5+unknown
node2    Ready    <none>   45d   v1.14.1-k3s.4   10.0.0.6      <none>        Raspbian GNU/Linux 9 (stretch)   4.14.98-v7+      containerd://1.2.5+unknown
node3    Ready    <none>   45d   v1.14.1-k3s.4   10.0.0.3      <none>        Raspbian GNU/Linux 9 (stretch)   4.14.98-v7+      containerd://1.2.5+unknown
node4    Ready    <none>   45d   v1.14.1-k3s.4   10.0.0.9      <none>        Raspbian GNU/Linux 9 (stretch)   4.14.98-v7+      containerd://1.2.5+unknown
```

In this instance, I just used Raspbian Stretch and set it up using the downloadable installer.

The `Makefile` in this folder has the correct targets for setting it up, upgrading and rebooting the cluster in an orderly fashion, as well as a `toml` file that enables the cluster to use my private registry.

If you have SSH keys set up already, all you need is to do `make setup`, and you should be golden.

The `scripts` folder contains older deployment files and scripts I used when I set up Kubernetes "the hard way".

[k3s]: http://k3s.io
[az]: https://github.com/rcarmo/azure-k3s-cluster
