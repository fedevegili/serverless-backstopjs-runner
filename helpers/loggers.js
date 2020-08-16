const clc = require('cli-color');

function logInfo(data) {
	console.log(`[${clc.cyanBright('info')}] ${data}`);
}

function logSuccess(data) {
	console.log(`[${clc.greenBright('success')}] ${data}`);
}

function logError(data) {
	console.error(`[${clc.redBright('info')}] ${data}`);
}

function logFatalError(data) {
	logError(data);
	process.exit(1);
}

module.exports = {
	logSuccess,
	logInfo,
	logError,
	logFatalError,
};
