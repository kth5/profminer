#!/bin/bash

source check-env.sh

git clone https://github.com/kth5/cpuminer-opt.git
cd cpuminer-opt
sh autogen.sh
CXXFLAGS="${CXXFLAGS} -std=c++11" ./configure --with-curl --with-crypto
make clean
make
[ $? -eq 0 ] && cp -v cpuminer ../../miners/cpuminer-opt
cd ../
