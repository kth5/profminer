// dependencies
const net = require('net');
const spawn = require('child_process').spawn;

module.exports = function() {
    // configuration
	this.apiHost = '127.0.0.1';
	this.apiPort = 4048;
    this.apiInterval = 5000;
    this.apiTimeout = 1000;
    this.algo = null;
    this.threads = 1;
    this.stratumUrl = null;
    this.stratumUser = null;
    this.stratumPass = null;

    // cpuminer-opt specifics
    this.minerPath = './miners/sgminer/sgminer';
    this.algoSupported = ['cryptonight', 'hodl', 'lyra2re'];

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
            client.write('GET /summary\r\n');
        });

        client.on('data', (data) => {
            data = data.toString();
            data = data.substring(data.indexOf('{'));
            data = data.substring(0, data.indexOf('}') + 1);
            this.summary = JSON.parse(data);
        });

        client.on('error', (e) => {
            console.log(e.message);
        });
    }

    this.getHashrate = function() {
        var self = this;
        var options = {
            host: this.apiHost,
            port: this.apiPort,
            timeout: this.apiTimeout
        }

        var client = net.createConnection(options, () => {
            client.write('GET /hashrate\r\n');
        });

        client.on('data', (data) => {
            data = data.toString();
            data = data.substring(data.indexOf('{'));
            data = data.substring(0, data.indexOf('}') + 1);
            this.hashrate = JSON.parse(data).KHS;
        });

        client.on('error', (e) => {
            console.log(e.message);
        });
    }

    this.configure = function(algo, threads, stratumUrl, stratumUser, stratumPass) {
        if (this.algoSupported.indexOf(algo) > -1) {
            this.algo = algo;
        } else {
            console.log('Algo "' + algo + '" is not supported by this miner.' );
            return false;
        }

        if (threads >= 1) {
            this.threads = threads;
        } else {
            console.log('Threads needs to be a positive number.');
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
            console.log('Miner isn\'t configured yet');
            return;
        }

        this.status = 'running';

        console.log('Running: ' + this.minerPath + ' -a ' + this.algo + ' -o ' +  this.stratumUrl + ' -u ' + this.stratumUser + ' -p ' + this.stratumPass + ' -t ' + this.threads + ' --api-bind ' + this.apiHost + ':' + this.apiPort );
        const miner = spawn(this.minerPath, 
            [
              '-a', this.algo,
              '-o', this.stratumUrl,
              '-u', this.stratumUser,
              '-p', this.stratumPass,
              '-t', this.threads,
              '--api-bind', this.apiHost + ':' + this.apiPort
            ]
        );

        if ( !miner ) {
            this.status = 'error';
            console.log('somehting went wrong');
        }

        /*miner.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
        });*/

        miner.stderr.on('data', (data) => {
          console.log(`stderr: ${data}`);
        });

        miner.on('close', (code) => {
          this.status = 'idle';
          console.log(`Miner process exited with code ${code}`);
        });

        miner.on('exit', (data) => {
            this.status = 'idle';
            miner.kill('SIGTERM');
            delete miner;
        });

        this.miner = miner;
    }

    this.stop = function() {
        delete this.updateSummaryInterval;
        this.miner.kill('SIGTERM');
        delete miner;
    }

    /*
        Async monitoring
    */
    this.startMonitoring = function() {
        this.getSummary();
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
        delete this.updateSummaryInterval;
    }
};