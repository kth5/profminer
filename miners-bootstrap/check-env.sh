#!/bin/bash

OS=$(uname)

BINARIES="make git cmake autoreconf"

if [ "${OS}" = "Darwin" ]; then
	BINARIES="${BINARIES} gcc-6 g++-6"

	PKG_CONFIG_PATH=/usr/local/opt/curl/lib/pkgconfig:/usr/local/opt/openssl/lib/pkgconfig
else
	BINARIES="${BINARIES} gcc g++"
	export AES=$(grep aes /proc/cpuinfo | wc -l)
	export AVX=$(grep avx /proc/cpuinfo | wc -l)
	export AVX2=$(grep avx2 /proc/cpuinfo | wc -l)

	CFLAGS="-Ofast -march=native -mtune=native"

	[ ${AES} -gt 0 ] && CFLAGS="${CFLAGS} -maes"
	[ ${AVX} -gt 0 ] && CFLAGS="${CFLAGS} -mavx"
	[ ${AVX2} -gt 0 ] && CFLAGS="${CFLAGS} -mavx2"
fi

for binary in ${BINARIES[@]}; do
	if [ -z $(which ${binary} 2>/dev/null) ]; then
		echo ":: ${binary} missing..."
		exit 1
	fi
done



if [ -z "$(pkg-config --libs libcurl 2>/dev/null)" ]; then
        echo ":: curl-dev missing..."
        exit 1
fi

if [ -z "$(pkg-config --libs libcrypto 2>/dev/null)" ]; then
        echo ":: OpenSSL dev missing..."
        exit 1
fi

export CFLAGS
export CXXFLAGS="${CXXFLAGS}"
