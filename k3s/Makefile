# Get the node token for installs
NODE_TOKEN:=$(shell sudo cat /var/lib/rancher/k3s/server/node-token)
# build a node list
NODES=node1 node2 node3 node4
# Tack on the master at the end
ALL=$(NODES) master 

debug:
	echo ${NODE_TOKEN}

# Upgrade or install
upgrade:
	$(foreach NODE, master, \
		echo "curl -sfL https://get.k3s.io | sh -" | ssh $(NODE) ;)
	sudo chmod a+r /etc/rancher/k3s/k3s.yaml

# 1st time setup
setup:
	make upgrade
	$(foreach NODE, $(NODES), \
		make add-$(NODE);)

# Add a node
add-%:
	echo "curl -sfL https://get.k3s.io | K3S_URL=https://master:6443 K3S_TOKEN=${NODE_TOKEN} sh -" | ssh $*

# Patch our TOML file for insecure registry
deploy-toml:
	$(foreach NODE, $(ALL), cat config.toml.tmpl | ssh $(NODE) sudo tee /var/lib/rancher/k3s/agent/etc/containerd/config.toml.tmpl;) 


reboot-nodes:
	-$(foreach NODE, $(NODES), ssh $(NODE) sudo reboot;)


reboot-all:
	-$(foreach NODE, $(ALL), ssh $(NODE) sudo reboot;)

uninstall:
	-$(foreach NODE, $(ALL), ssh $(NODE) sudo rm -rf /etc/containerd;)
	-$(foreach NODE, $(ALL), ssh $(NODE) sudo /usr/local/bin/k3s-uninstall.sh;)
	-$(foreach NODE, $(ALL), ssh $(NODE) sudo /usr/local/bin/k3s-agent-uninstall.sh;)
