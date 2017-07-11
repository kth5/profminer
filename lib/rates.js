const fs = require('fs');
const https = require('https');
const os = require('os');

module.exports = function() {
	this.userAgent = 'ProfminerRates/0.0.4 (' + os.type() + '/' + os.arch() + '; ' + os.release() + ')'
	this.nicehash_domain = 'www.nicehash.com';
	this.nicehash_api_path = '/api?method=simplemultialgo.info';

	this.btc_rates_by_algo = {};

	try {
		if( fs.existsSync('.rates.json') ) {
			this.rates = fs.readFileSync('.rates.json');
			this.rates = JSON.parse(this.rates);
			for(var index in this.rates.result.simplemultialgo) {
				if ( typeof this.rates.result.simplemultialgo[index].name !== undefined ) {
					this.btc_rates_by_algo[ this.rates.result.simplemultialgo[index].name ] = this.rates.result.simplemultialgo[index].paying
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

		var options = {
			hostname: this.nicehash_domain,
			path: this.nicehash_api_path,
			method: 'GET',
			port: 443,
			headers: {
				'User-Agent': this.userAgent
			}
		}

		var client = https.get(options, callback);
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
