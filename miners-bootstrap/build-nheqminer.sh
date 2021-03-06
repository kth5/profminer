#!/bin/bash

source check-env.sh

if [ "${OS}" = "Darwin" ]; then
	echo ":: OSX isn't supported."
	exit 1
fi

# fix bug with later glibc/boost combinations than nheqminer was originally
# intended for
export CXXFLAGS="${CXXFLAGS} -lpthread"

PW=$(pwd)

git clone https://github.com/kth5/nheqminer.git
cd ${PW}/nheqminer/cpu_xenoncat/Linux/asm && ./assemble.sh
cd ${PW}/nheqminer/Linux_cmake/nheqminer_cpu
cmake .
make
[ $? -eq 0 ] && cp -v nheqminer_cpu ${PW}/../miners/nheqminer_cpu
cd ../../../
