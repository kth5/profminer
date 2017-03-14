#!/bin/bash
set -e
source check-env.sh

[ ! -d xmr-stak-cpu ] && git clone https://github.com/fireice-uk/xmr-stak-cpu
cd xmr-stak-cpu
if [ "${OS}" = "Darwin" ]; then
	git pull --no-edit https://github.com/bhayer/xmr-stak-cpu.git master
	git checkout -- CMakeLists.txt
	patch -Np0 -i ../xmr-stak-cpu-001-osx-openssl.patch
	CC=gcc-6 CXX=g++-6 \
	cmake . \
	-DOPENSSL_ROOT_DIR=/usr/local/opt/openssl
else
	[ ! -z "${CC6}" ] && export CC=${CC6}
	[ ! -z "${CXX6}" ] && export CXX=${CXX6}
	rm -rf CMakeFiles CMakeCache Makefile
	cmake -DCMAKE_BUILD_TYPE=STATIC .
fi
make clean
make
[ $? -eq 0 ] && cp -v bin/xmr-stak-cpu ../../miners/xmr-stak-cpu
cd ../
