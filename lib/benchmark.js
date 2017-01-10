module.exports = function(miner) {
	this.miner = miner;

    /*
        Benchmarking
    */
    this.run = function(time) {
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
                    console.log('Benchmark done.');
                }
            })(this),
            time);
    }

}