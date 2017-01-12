#!/bin/bash
set -e
source check-env.sh

[ ! -d cpuminer-opt ] && git clone https://github.com/kth5/cpuminer-opt.git
cd cpuminer-opt
sh autogen.sh
if [ "${OS}" = "Darwin" ]; then
	CC=gcc-6 CXX=g++-6 \
	CXXFLAGS="${CXXFLAGS} -std=c++11" \
		./configure --with-curl=/usr/local/opt/curl \
			--with-crypto=/usr/local/opt/openssl \
			--disable-assembly
else
	CXXFLAGS="${CXXFLAGS} -std=c++11" \
		./configure --with-curl --with-crypto
fi
make clean
make
[ $? -eq 0 ] && cp -v cpuminer ../../miners/cpuminer-opt
cd ../
