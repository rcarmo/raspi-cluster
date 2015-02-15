export GOPATH:=$(shell pwd)/vendor
export PATH:=$(PATH):$(GOPATH)/bin
BINARY=dash

$(BINARY): *.go
	go build -o $(BINARY)

deps:
	mkdir -p vendor
	go get github.com/antage/eventsource
	go get github.com/gorilla/handlers
	find vendor -name .git | xargs rm -rf
	find vendor -name .hg | xargs rm -rf

clean:
	rm -f $(BINARY)
	go fmt *.go

pi2:
	GOOS=linux GOARCH=arm GOARM=7 go build -o $(BINARY)

pi:
	GOOS=linux GOARCH=arm GOARM=6 go build -o $(BINARY)

synology:
	GOOS=linux GOARCH=arm GOARM=5 go build -o $(BINARY)
