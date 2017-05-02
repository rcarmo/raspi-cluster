FROM armv7/armhf-debian:jessie
MAINTAINER Rui Carmo https://github.com/rcarmo

# Update the system and set up required dependencies
RUN apt-get update \
 && apt-get dist-upgrade -y \
 && apt-get install \
      wget \
      libx11-6 \
      libxext6 \
      libxtst6 \
      libboost-filesystem1.55.0 \ 
      libboost-program-options1.55.0 \
      libboost-date-time1.55.0 \
      liboauth0 \
      openjdk-7-jre \
      libpango1.0-0 \
      libffi6 \
      libportaudio2 \
      libhunspell-1.3-0 \
      coinor-libipopt1 \
      libopenblas-base \
      libgfortran3 \
      libcurl3 \
      libmp3lame0 \
      libraw10 \
      libboost-regex1.55.0 \
    -y --force-yes 
# Automatically accept the Wolfram EULA
# && apt-get clean && rm -rf /var/lib/apt/lists/*


# get the Raspbian files 
RUN echo wolfram-engine shared/accepted-wolfram-eula select true | debconf-set-selections; cd /tmp \
 && wget http://archive.raspberrypi.org/debian/pool/main/w/wolfram-engine/wolfram-engine_11.0.1+2017022002_armhf.deb \
 && wget http://archive.raspberrypi.org/debian/pool/main/w/wolframscript/wolframscript_1.0.1-19_armhf.deb \
 && wget http://archive.raspberrypi.org/debian/pool/main/r/realvnc-vnc/realvnc-vnc-server_6.0.2.25562_armhf.deb 
 

RUN cd /tmp; dpkg -i *.deb

RUN apt -f install
