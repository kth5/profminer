// dependencies
const net = require('net');
const spawn = require('child_process').spawn;

module.exports = function() {
    // configuration
	this.apiHost = '127.0.0.1';
	this.apiPort = 4049;
    this.apiInterval = 5000;
    this.apiTimeout = 10000;
    this.algo = null;
    this.threads = 1;
    this.stratumUrl = null;
    this.stratumUser = null;
    this.stratumPass = null;

    // NheqminerCpu specifics
    this.minerPath = './miners/nheqminer_cpu';
    this.algoSupported = ['equihash'];
    this.algoPlatform = 'cpu';

    // status
    this.configured = false;
    this.status = 'idle';
    this.summary = {}
    this.hashrate = 0;

	// functions
    this.getSummary = function() {
        var self = this;

        var options = {
            host: this.apiHost,
            port: this.apiPort,
            timeout: this.apiTimeout
        }

        var client = net.createConnection(options, () => {
            client.write('status\r\n');
        });

        client.on('data', (data) => {
            data = data.toString();
            this.summary = JSON.parse(data);
            this.hashrate = this.summary.result.speed_sps/1000;
            this.accepted = this.summary.result.accepted_per_minute + '/m';
            this.rejected = this.summary.result.rejected_per_minute + '/m';
        });

        client.on('timeout', (e) => {
            this.stop();
            this.status = 'idle';
        });

        client.on('error', (e) => {
            console.log(e.message);
        });
    }

    this.configure = function(algo, threads, stratumUrl, stratumUser, stratumPass) {
        if (this.algoSupported.indexOf(algo) > -1) {
            this.algo = algo;
        } else {
            console.log('nheqminer_cpu: Algo "' + algo + '" is not supported by this miner.' );
            return false;
        }

        if (threads >= 1) {
            this.threads = threads;
        } else {
            console.log('nheqminer_cpu: Threads needs to be a positive number.');
            return false;
        }

        this.stratumUrl = stratumUrl.replace('stratum+tcp://', '');
        this.stratumUser = stratumUser;
        this.stratumPass = stratumPass;
        this.configured = true;
        return true;
    }

    this.run = function () {
        if ( this.configured !== true ) {
            console.log('nheqminer_cpu: Not configured yet');
            return;
        }

        if ( this.status == 'running') {
            console.log('nheqminer_cpu: Already running!');
        }

        this.status = 'running';

        const miner = spawn(this.minerPath, 
            [
              '-d', 5,
              '-l', this.stratumUrl,
              '-u', this.stratumUser,
              '-p', this.stratumPass,
              '-t', this.threads,
              '-a', this.apiPort
            ]
        );

        if ( !miner ) {
            this.status = 'error';
            console.log('nheqminer_cpu: Unhandled error occured.');
        }

        miner.stdout.on('data', (data) => {
          //console.log(`stdout: ${data}`);
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
                }
            })(this),
            this.apiInterval
        );
    }

    this.stopMonitoring = function() {
        this.summary = {};
        clearInterval(this.updateSummaryInterval);
    }
};

