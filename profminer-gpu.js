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
const ClaymoreZecAMD = require('./lib/miners/claymore-zec-amd')
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
			case 'equihash':
				miner = new ClaymoreZecAMD();
				miner.configure('equihash',
								THREADS,
								'stratum+tcp://equihash.jp.nicehash.com:33357',
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

