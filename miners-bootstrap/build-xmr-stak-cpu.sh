#!/bin/bash
set -e
source check-env.sh

[ ! -d xmr-stak-cpu ] && git clone https://github.com/fireice-uk/xmr-stak-cpu
cd xmr-stak-cpu
if [ "${OS}" = "Darwin" ]; then
	CC=gcc-7 CXX=g++-7 \
        CXXFLAGS="${CXXFLAGS} -std=c++11 -I/usr/local/opt/libmicrohttpd/include" \
	cmake . \
	-DOPENSSL_ROOT_DIR=/usr/local/opt/openssl
	# no need to link gmp
	sed -i.bak 's/-lgmp//g' Makefile
else
	[ ! -z "${CC6}" ] && export CC=${CC6}
	[ ! -z "${CXX6}" ] && export CXX=${CXX6}
	rm -rf CMakeFiles CMakeCache Makefile
	cmake -DCMAKE_BUILD_TYPE=STATIC .
	# no need to link gmp
	sed 's/-lgmp//g' -i Makefile
fi

make clean
make
[ $? -eq 0 ] && cp -v bin/xmr-stak-cpu ../../miners/xmr-stak-cpu
cd ../
