# Get the node token for installs
NODE_TOKEN:=$(shell sudo cat /var/lib/rancher/k3s/server/node-token)
# build a node list
NODES=node1 node2 node3 node4
# Tack on the master at the end
ALL=$(NODES) master 
K3S_VERSION=v1.17.0+k3s.1

# need cgroup_enable=cpuset cgroup_enable=memory cgroup_memory=1 in bootcmd

debug:
	echo ${NODE_TOKEN}

# Upgrade or install
upgrade:
	$(foreach NODE, master, \
		echo "curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--docker" INSTALL_K3S_VERSION=$(K3S_VERSION) sh -" | ssh $(NODE) ;)
	-sudo chmod a+r /etc/rancher/k3s/k3s.yaml

# 1st time setup
setup:
	make upgrade
	$(foreach NODE, $(NODES), \
		make add-$(NODE);)

# Add a node
add-%:
	echo "curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=$(K3S_VERSION) K3S_URL=https://master:6443 K3S_TOKEN=${NODE_TOKEN} sh -" | ssh $*

# Patch our TOML file for insecure registry
deploy-toml:
	$(foreach NODE, $(ALL), cat config.toml.tmpl | ssh $(NODE) sudo tee /var/lib/rancher/k3s/agent/etc/containerd/config.toml.tmpl;) 

remove-toml:
	$(foreach NODE, $(ALL), ssh $(NODE) sudo rm -f /var/lib/rancher/k3s/agent/etc/containerd/config.toml.tmpl;) 

reboot-nodes:
	-$(foreach NODE, $(NODES), ssh $(NODE) sudo reboot;)


reboot-all:
	-$(foreach NODE, $(ALL), ssh $(NODE) sudo reboot;)

uninstall:
	-$(foreach NODE, $(ALL), ssh $(NODE) sudo rm -rf /etc/containerd;)
	-$(foreach NODE, $(ALL), ssh $(NODE) sudo rm -rf /var/lib/docker;)
	-$(foreach NODE, $(ALL), ssh $(NODE) sudo /usr/local/bin/k3s-killall.sh;)
	-$(foreach NODE, $(ALL), ssh $(NODE) sudo /usr/local/bin/k3s-uninstall.sh;)
	-$(foreach NODE, $(ALL), ssh $(NODE) sudo /usr/local/bin/k3s-agent-uninstall.sh;)

registry:
#	sudo sh -c 'REGISTRY=$(kubectl get svc -n kube-system registry -o jsonpath={.spec.clusterIP}); \
cat <<EOT >> /etc/rancher/k3s/registries.yaml
#mirrors:
#  "$REGISTRY":
#    endpoint:
#      - "http://$REGISTRY"
#EOT'
#	sudo service k3s restart


update:
	tmux new-session -d -s Update
	tmux set -g remain-on-exit on
	-$(foreach NODE, $(ALL), \
		tmux new-window -n '$(NODE)' 'ssh $(NODE) sudo apt-get update && sudo apt-get dist-upgrade -y && sudo apt-get autoremove -y && sudo rpi-update';)
	tmux -2 attach-session -t Update
