const fs = require('fs');
const os = require('os');
const cmdLineArgs = require('command-line-args');

const cmdArgsDefinitions = [
  { name: 'user', alias: 'u', type: String, defaultValue: '1FUJAKARZtNoYMNn7SRxyufKkE3p5AtgD5.profminer' },
  { name: 'pass', alias: 'p', type: String, defaultValue: 'z' },
  { name: 'threads', alias: 't', type: Number, defaultValue: os.cpus().length },
  { name: 'benchmark', alias: 'b' }
]
const cmdArgs = cmdLineArgs(cmdArgsDefinitions);

const NH_USER = cmdArgs.user;
const NH_PASS = cmdArgs.pass;
const THREADS = cmdArgs.threads;


/*
	Profminer
*/
const CpuMinerOpt = require('./lib/miners/cpuminer-opt');
const NheqminerCpu = require('./lib/miners/nheqminer');
const XmrStackCpu = require('./lib/miners/xmr-stack-cpu')
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
				miner = new XmrStackCpu();
				miner.configure('cryptonight',
								THREADS,
								'stratum+tcp://cryptonight.jp.nicehash.com:3355',
								NH_USER,
								'z'
				);
				break;
			case 'hodl':
				miner = new CpuMinerOpt();
				miner.configure('hodl',
								THREADS,
								'stratum+tcp://hodl.jp.nicehash.com:3352',
								NH_USER,
								'z'
				);
				break;
			case 'lyra2re':
				miner = new CpuMinerOpt();
				miner.configure('lyra2re',
								THREADS,
								'stratum+tcp://lyra2re.jp.nicehash.com:3342',
								NH_USER,
								'z'
				);
				break;
			case 'equihash':
				miner = new NheqminerCpu();
				miner.configure('equihash',
								THREADS,
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
						 btcday = rates.getRate(miner.algo)*miner.hashrate / rates.algo_divisor_to_khs[miner.algo];
						 console.log('== Algorithm: ' + miner.algo +
								 ', Hashrate: ' + (miner.hashrate / rates.algo_divisor_to_khs[miner.algo]).toFixed(5) + 'Kh/s' +
								 ', BTC/Day: '  + btcday.toFixed(5) +
								 ', Accepted: ' + miner.accepted + 
								 ', Rejected: ' + miner.rejected +
					 			 ', Status: ' + miner.status ); } ,10000);

