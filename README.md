# profminer
Multi currency Cryptomining manager with automatic profitability adjustment via NiceHash

This miner currently is meant to *only* support GNU/Linux and Mac operating systems.

## Disclaimer

This definitely isn't release quality so don't complain or file issues please. :) 

#### Currently supported algorithms
 * ✓ __cryptonight__ (Bytecoin [BCN], Monero)
 * ✓ __equihash__ (Z.Cash [ZEC])
 * ✓ __hodl__ (HOdlcoin [HODL])
 * ✓ __lyra2RE__ (Lyrabar, Cryptocoin)

#### Command line arguments

###### --user/-u string
This is your NiceHash username or rather BTC wallet address.

If you'd like to be able to identify your particular worker on the NH
stats page, attach a name to this address like so:

	1FUJAKARZtNoYMNn7SRxyufKkE3p5AtgD5**.myworker**

The default is set to the author's (me) so be sure to set this. ;)

###### --pass/-p string
This is your NiceHash password (currently doesn't matter).

###### --threads/-t integer 
Maximum number of CPU threads to be used. Currently it's the total amount
that will always be allocated. Later on, the benchmarking (TBI) should reduce
this limit if suboptimal for your CPU. Like for inatce on an AMD A10-7860K which has
AVX2 but will provide the best hashrate when only one of the 4 cores is in use.	

The default is set to the amount of CPUs/cores you have available **including HT**.
So be sure to set this to a sane level.
