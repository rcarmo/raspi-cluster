# Older (Deprecated) Notes on setting up K8s

Be sure to add the following entries to /boot/cmdline.txt:

```console
cgroup_enable=cpuset cgroup_enable=memory 
```

# Install nodes

```console
$ curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
$ echo "deb http://apt.kubernetes.io/ kubernetes-xenial main" > /etc/apt/sources.list.d/kubernetes.list
$ apt-get update && apt-get install -y kubeadm
```

## Master

```console
$ kubeadm init --pod-network-cidr 10.244.0.0/16
$ curl -sSL https://rawgit.com/coreos/flannel/master/Documentation/kube-flannel.yml | sed "s/amd64/arm/g" | kubectl create -f -
```

## Agents

```console
$ kubeadm join --token <token> <master-ip>
```

## dashboard

```console
$ curl -sSL https://rawgit.com/kubernetes/dashboard/master/src/deploy/kubernetes-dashboard.yaml | sed "s/amd64/arm/g" | kubectl create -f -
```

Getting the port:

```console
$ kubectl -n kube-system get service kubernetes-dashboard -o template --template="{{ (index .spec.ports 0).nodePort }}"
```

##Allowing normal workloads to be run on the master

```console
$ kubectl taint nodes --all dedicated-
```

