const fs = require('fs');
const https = require('https');

module.exports = function() {
	this.nicehash_api_rates = 'https://www.nicehash.com/api?method=stats.global.current';

	this.nicehash_algo_to_id = {
    	9: 'lyra2re',
    	19: 'hodl',
    	22: 'cryptonight',
    	24: 'equihash'
	}

	this.algo_divisor_to_khs = {
		'lyra2re': 1000*1000,
		'hodl': 1000,
		'cryptonight': 1000,
		'equihash': 1
	}

	this.btc_rates_by_algo = {};

	try {
		if( fs.existsSync('.rates.json') ) {
			this.rates = fs.readFileSync('.rates.json');
			this.rates = JSON.parse(this.rates);
			for(var index in this.rates.result.stats) {
				if ( typeof this.nicehash_algo_to_id[this.rates.result.stats[index].algo] !== undefined ) {
					this.btc_rates_by_algo[
						this.nicehash_algo_to_id[this.rates.result.stats[index].algo]
					] =	this.rates.result.stats[index].price / this.algo_divisor_to_khs[this.nicehash_algo_to_id[this.rates.result.stats[index].algo]];
				}
			}
		}

		setInterval(this.updateRates(), 61000);
	} catch (e) {
		this.rates = {};
	}

	this.getRates = function() {
		return this.rates;
	}

	this.getRate = function(algo) {
		return this.btc_rates_by_algo[algo];
	}

	this.updateRates = function(me) {
		var data = '';

		callback = function(response) {
			response.on('data', function(d) {
				data += d;
			});

			response.on('end', function() {
				console.log('++ Updated rates!');
	            fs.writeFileSync('.rates.json', data.toString());
			});

			response.on('error', function(e){
				console.log('++ Rates could not be updated!');
				process.exit();
			});
		};

		var client = https.get(this.nicehash_api_rates, callback);
	}

	this.getBestRateAlgo = function(benchmarked_hashrates) {
		var bestRate = 0;
		var bestAlgo = '';
		for( var algo in benchmarked_hashrates ) {
			var rate = this.btc_rates_by_algo[algo] * benchmarked_hashrates[algo];
			if( bestRate < rate ) {
				//console.log(algo + ' pays more than ' + bestAlgo + '/' + bestRate + '(' + rate + ')');
				bestRate = rate;
				bestAlgo = algo;
			} /*else {
				console.log(algo + ' pays less than ' + bestAlgo + '/' + bestRate + '(' + rate + ')');
			}*/
		}
		return bestAlgo;
	}
}