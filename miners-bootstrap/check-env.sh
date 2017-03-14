#!/bin/bash

OS=$(uname)

CFLAGS="-Ofast -march=native -mtune=native -D_REENTRANT -funroll-loops -fvariable-expansion-in-unroller -fmerge-all-constants -fbranch-target-load-optimize2 -fsched2-use-superblocks -falign-loops=16 -falign-functions=16 -falign-jumps=16 -falign-labels=16"

BINARIES="make git cmake autoreconf"

if [ "${OS}" = "Darwin" ]; then
	BINARIES="${BINARIES} gcc-6 g++-6"

	PKG_CONFIG_PATH=/usr/local/opt/curl/lib/pkgconfig:/usr/local/opt/openssl/lib/pkgconfig
else
	BINARIES="${BINARIES} gcc g++"
	export AES=$(grep aes /proc/cpuinfo | wc -l)
	export AVX=$(grep avx /proc/cpuinfo | wc -l)
	export AVX2=$(grep avx2 /proc/cpuinfo | wc -l)

	[ ${AES} -gt 0 ] && CFLAGS="${CFLAGS} -maes"
	[ ${AVX} -gt 0 ] && CFLAGS="${CFLAGS} -mavx"
	[ ${AVX2} -gt 0 ] && CFLAGS="${CFLAGS} -mavx2"

	export MAKEFLAGS="-j$(cat /proc/cpuinfo | grep 'core id' | sort | uniq | wc -l)"
fi

for binary in ${BINARIES[@]}; do
	if [ -z $(which ${binary} 2>/dev/null) ]; then
		echo ":: ${binary} missing..."
		exit 1
	fi
done

# some miners profit or need a newer gcc
if [ -d /opt/gcc ]; then
	_mygcc=$(find /opt/gcc/6*/bin -name gcc)
	_mygpp=$(find /opt/gcc/6*/bin -name g++)
	[ ! -z "${_mygcc}" ] && export CC6=${_mygcc}
	[ ! -z "${_mygpp}" ] && export CXX6=${_mygpp}
fi

if [ -z "$(pkg-config --libs libcurl 2>/dev/null)" ]; then
        echo ":: curl-dev missing..."
        exit 1
fi

if [ -z "$(pkg-config --libs libcrypto 2>/dev/null)" ]; then
        echo ":: OpenSSL dev missing..."
        exit 1
fi

if [ -z "$(pkg-config --libs libmicrohttpd 2>/dev/null)" ]; then
	echo ":: libmicrohttpd missing..."
fi

export CFLAGS
export CXXFLAGS="${CXXFLAGS}"
