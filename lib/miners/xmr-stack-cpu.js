// dependencies
const net = require('net');
const spawn = require('child_process').spawn;
const http = require('http');

module.exports = function() {
	// configuration
	this.apiHost = '127.0.0.1';
	this.apiPort = 3334;
	this.apiInterval = 5000;
	this.apiTimeout = 10000;
	this.algo = null;
	this.threads = 1;
	this.stratumUrl = null;
	this.stratumUser = null;
	this.stratumPass = null;

	// xmr-stak-cpu specifics
	this.minerPath = './miners/xmr-stak-cpu';
	this.algoSupported = ['cryptonight'];
	this.algoPlatform = 'cpu';

	// status
	this.configured = false;
	this.status = 'idle';
	this.accepted = 0;
	this.rejected = 0;
	this.summary = {}
	this.hashrate = 0.0;

	// functions
	this.getSummary = function() {
		var self = this;

		var options = {
			host: this.apiHost,
			port: this.apiPort,
			path: '/r',
			timeout: this.apiTimeout
		}

		callback = function(response) {
			var data = '';

			response.on('data', function (chunk) {
				data += chunk;
			});

			response.on('end', function () {
				if (data != '' && (data)) {
		                        var results = data.toString();
					results = results.replace(/.*Good results<\/th><td>/i, '');
					results = results.replace(/ \(.*<\/td><\/tr>.*/i, '');
					results = results.split(' / ');
					if ( results[0] != '' ) {
						self.accepted = parseFloat(results[0]);
						self.rejected = parseFloat(results[1] - results[0]);
					}
				}
			});
		}

		http.request(options, callback).end();
	}

	this.getHashrate = function() {
		var self = this;

		var options = {
			host: this.apiHost,
			port: this.apiPort,
			path: '/h',
			timeout: this.apiTimeout
		}

		callback = function(response) {
			var data = '';

			response.on('data', function (chunk) {
				data += chunk;
			});

			response.on('end', function () {
				if (data != '' && (data)) {
		                        var rate = data.toString();
					rate = rate.replace(/.*Totals:<\/th><td> /i, '');
					rate = rate.replace(/<\/td><td>.*/i, '');
					self.hashrate = parseFloat(rate);
				}
			});
		}

		http.request(options, callback).end();
	}

	this.configure = function(algo, threads, stratumUrl, stratumUser, stratumPass) {
		if (this.algoSupported.indexOf(algo) > -1) {
			this.algo = algo;
		} else {
			console.log('xmr-stak-cpu: Algo "' + algo + '" is not supported by this miner.' );
			return false;
		}

		if (threads >= 1) {
			this.threads = threads;
		} else {
			console.log('xmr-stak-cpu: Threads needs to be a positive number.');
			return false;
		}

		this.stratumUrl = stratumUrl;
		this.stratumUser = stratumUser;
		this.stratumPass = stratumPass;
		this.configured = true;
		return true;
	}

	this.run = function () {
		if ( this.configured !== true ) {
			console.log('xmr-stak-cpu Not configured yet!');
			return;
		}

		if ( this.status == 'running') {
			console.log('xmr-stak-cpu: Already running!');
		}

		this.status = 'running';

		const miner = spawn(this.minerPath, [ 'miners/xmr-config.txt' ]);

		if ( !miner ) {
			this.status = 'error';
			console.log('xmr-stak-cpu: Unhandled error occured.');
		}

		miner.stdout.on('data', (data) => {
		  console.log(`stdout: ${data}`);
		});

		miner.stderr.on('data', (data) => {
		  console.log(`stderr: ${data}`);
		});

		miner.on('close', (code) => {
		  this.status = 'idle';
		});

		miner.on('exit', (data) => {
			this.status = 'idle';
			miner.kill('SIGTERM');
			delete miner;
		});

		this.miner = miner;
	}

	this.stop = function() {
		clearInterval(this.updateSummaryInterval);
		this.miner.kill('SIGTERM');
	}

	/*
		Async monitoring
	*/
	this.startMonitoring = function() {
		this.updateSummaryInterval = setInterval(
			(function(self) { 
				return function() {
					self.getSummary();
					self.getHashrate();
				}
			})(this),
			this.apiInterval
		);
	}

	this.stopMonitoring = function() {
		this.summary = {};
		this.hashrate = 0.0;
		clearInterval(this.updateSummaryInterval);
	}
};

