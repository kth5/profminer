#!/bin/bash

PW=$(pwd)
cd miners-bootstrap/
./build-cpuminer-opt.sh
./build-nheqminer.sh

wget -O .rates.json "https://www.nicehash.com/api?method=stats.global.current&location=0"
