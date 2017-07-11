#!/bin/bash
set -e
source check-env.sh

[ ! -d cpuminer-opt ] && git clone https://github.com/kth5/cpuminer-opt.git
cd cpuminer-opt
sh autogen.sh
if [ "${OS}" = "Darwin" ]; then
	CC=gcc-7 CXX=g++-7 \
	CXXFLAGS="${CXXFLAGS} -std=c++11" \
		./configure --with-curl=/usr/local/opt/curl \
			--with-crypto=/usr/local/opt/openssl \
			--disable-assembly
	sed -i.bak 's/-lgmp//g' Makefile
else
	[ ! -z "${CC6}" ] && export CC=${CC6}
	[ ! -z "${CXX6}" ] && export CXX=${CXX6}

	CFLAGS="${CFLAGS} -static-libgcc" \
	CXXFLAGS="${CXXFLAGS} -std=c++11 -static-libstdc++" \
		./configure --with-curl --with-crypto
	sed 's/-lgmp//g' -i Makefile
fi

make clean
make
[ $? -eq 0 ] && cp -v cpuminer ../../miners/cpuminer-opt
cd ../
