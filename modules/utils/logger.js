/* ************ 0. Other Module Imports ************ */

/* ************** 1. Classes/Objects/Variables: ************** */

// Send data to server flag:
let _serverOn = false;

// Keep the original console as private object:
const _console = Object.assign(window.console);

// Create the new modified console object:
const _newConsole = {
	_console,
	envs: {
		prod: false,
		dev: true
	},
	log(...data) {
		this.worker('log', data);
	},
	warn(...data) {
		this.worker('warn', data);
	},
	info(...data) {
		this.worker('info', data);
	},
	error(...data) {
		this.worker('error', data);
	},
	worker(method, data) {
		if(!this.envs.prod || method === 'error') {
			this._console[method](...data);
		}
		if(_serverOn) {
			try {
				firebase.database().ref(method).update({
					time: Date.now(),
					message: data
				});
			} catch(e) {
				/* Firebase: did not log / logged improperly. */
			}
		}
	},
	declareEnv(type) {
		for(let e in this.envs) { this.envs[e] = false; }
		this.envs[type] = true;
	},
	setupServer(serverType, data) {
		return new Promise(function(resolve, reject) {
			if(serverType === 'firebase') {
				try {
					let firebase = data.firebase;
					let config = data.config;
					firebase.initializeApp(config);
				} catch(e) {
					reject('Firebase setup failed');
				}
				resolve();
			}
			// else if()
		}); 
	},
	switchOnServer() {
		_serverOn = true;
	},
	switchOffServer() {
		_serverOn = false;
	}
};

// Merge it with existing console (Overrding only the defined functionality):
const newConsole = Object.assign({}, _console, _newConsole);

// Override the default console:
window.console = newConsole;

/* Also be ready to export it. */

/* ************** 2. Actions/Events: ************** */

/* ************** 3. Exports: ************** */

export {
	newConsole as default
}

/* ************** 4. Functions: ************** */