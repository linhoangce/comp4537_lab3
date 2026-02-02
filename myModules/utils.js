module.exports = class ServerTime {
	constructor() {
		this.time = Date();
	}

	getCurrentTime() {
		return this.time;
	}
};
