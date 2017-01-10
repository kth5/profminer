const fs = require('fs');

module.exports = function() {
	if( fs.existsSync('.hashrates.json') ) {
		this.hash_array = JSON.parse(fs.readFileSync('.hashrates.json'));
	} else {
		this.hash_array = {};
	}

	this.saveHashrates = function() {
		fs.writeFileSync('.hashrates.json', JSON.stringify(this.hash_array));
	}
	
	this.getBenchmarkedHashrates = function() {
		return this.hash_array;
	}

    /*
        Benchmarking
    */
    this.miner = {};
    this.benchmark = function(miner, time) {
    	this.miner = miner;
    	if ( this.miner.status !== 'running' ) {
    		console.log('Miner is down.');
    	}

        if ( time < 20000 ) {
            console.log('Time to benchmark set too short.');
            return false;
        }

        this.miner.run();
        this.miner.startMonitoring();
        setTimeout(
            (function(self) {
                return function() {
                    self.miner.stopMonitoring();
                    self.miner.stop();
                    self.hash_array[self.miner.algo] = self.miner.hashrate;
                    self.saveHashrates();
                    console.log('Benchmark done.');
                }
            })(this),
            time);
    }
}