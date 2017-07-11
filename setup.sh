#!/bin/bash
set -e

mkdir -p miners/lib

PW=$(pwd)
cd miners-bootstrap/
./build-cpuminer-opt.sh
./build-nheqminer.sh
./build-xmr-stak-cpu.sh
cd ${PW}
wget -O .rates.json "https://www.nicehash.com/api?method=simplemultialgo.info"

npm install
