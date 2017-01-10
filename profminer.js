const fs = require('fs');
const os = require('os');

const NH_USER='1FUJAKARZtNoYMNn7SRxyufKkE3p5AtgD5.imc'

/*
	Profminer
*/
const CpuMinerOpt = require('./lib/miners/cpuminer-opt');
const NheqminerCpu = require('./lib/miners/nheqminer');
const Rates = require('./lib/rates');
const ProfMiner = require('./lib/profminer');

var profitability = {};

var prof = new ProfMiner();

var miner = '';
var cur_algo = '';

function updateRestartCPUMiner() {
	var rates = new Rates();
	cur_algo = rates.getBestRateAlgo(prof.getBenchmarkedHashrates());
	console.log('## Best Rate Algo now: ' + cur_algo);

	if ( typeof miner == 'object' && miner.algo != cur_algo) {
		console.log('## SWITCH: ' + miner.algo + '=>' + cur_algo);
		miner.stop();
		miner.stopMonitoring();
		delete miner;
	}

	if( miner.algo != cur_algo) {
		console.log('++ Reconfiguring miner...');
		switch(cur_algo) {
			case 'cryptonight':
				miner = new CpuMinerOpt();
				miner.configure('cryptonight',
								'3',
								'stratum+tcp://cryptonight.jp.nicehash.com:3355',
								NH_USER,
								'z'
				);
				break;
			case 'hodl':
				miner = new CpuMinerOpt();
				miner.configure('hodl',
								'4',
								'stratum+tcp://hodl.jp.nicehash.com:3352',
								NH_USER,
								'z'
				);
				break;
			case 'lyra2re':
				miner = new CpuMinerOpt();
				miner.configure('lyra2re',
								'3',
								'stratum+tcp://lyra2re.jp.nicehash.com:3342',
								NH_USER,
								'z'
				);
				break;
			case 'equihash':
				miner = new NheqminerCpu();
				miner.configure('equihash',
								'6',
								'stratum+tcp://equihash.jp.nicehash.com:3357',
								NH_USER,
								'z'
				);
				break;
			default:
				process.exit();
		}
	}

	if ( miner.status == 'idle' ) {
		miner.run();
		miner.startMonitoring();
	}
}

var rates = new Rates();
if( rates.btc_rates_by_algo = {} ) {
	rates.updateRates();
	setTimeout(updateRestartCPUMiner, 5000);
} else {
	updateRestartCPUMiner();
}
setInterval(updateRestartCPUMiner, 60000);

setInterval(function() { if (miner.hashrate == undefined) {return;};
						 var rates = new Rates();
						 btcday = rates.getRate(miner.algo)*miner.hashrate;
						 console.log('== Algorithm: ' + miner.algo +
									 ', Hashrate: ' + miner.hashrate.toFixed(5) + 'Kh/s' +
									 ', BTC/Day: '  + btcday.toFixed(5) +
									 ', Accepted: ' + miner.accepted + 
									 ', Rejected: ' + miner.rejected +
						 			 ', Status: ' + miner.status ); } ,10000);

