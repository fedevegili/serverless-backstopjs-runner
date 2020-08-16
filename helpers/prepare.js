const fs = require('fs-extra');
const path = require('path');
const loggers = require('./loggers');

function ensureDirs(outputPath) {
	fs.ensureDirSync(outputPath);
}

function logNoEnv(varName) {
	loggers.logFatalError(`${varName} must be provided in environment`);
}

function getEnvVars() {
	const url = process.env.API_URL;
	const key = process.env.API_KEY;

	if (!url) {
		logNoEnv('API_URL');
	}

	if (!key) {
		logNoEnv('API_KEY');
	}

	return { url, key };
}

function getFilesToSend(config) {
	const basePath = path.dirname(config);
	const files = fs.readdirSync(basePath);
	const filesObj = {};

	files.forEach((fileName) => {
		filesObj[fileName] = fs.readFileSync(
			path.join(basePath, fileName),
			'utf8',
		);
	});

	return filesObj;
}

function prepareBackstopRequests(files, configName) {
	const backstop = JSON.parse(files[configName]);
	const requests = [];

	// Necessary for serverless-backstopjs
	backstop.paths = {
		bitmaps_reference: '/tmp/tested-images',
		bitmaps_test: '/tmp/backstop_data/bitmaps_test',
		engine_scripts: '/tmp/backstop',
		html_report: '/tmp/backstop_data/html_report',
		ci_report: '/tmp/backstop_data/ci_report',
	};

	while (backstop.scenarios.length > 0) {
		const newBackstop = { ...backstop };

		newBackstop.scenarios = backstop.scenarios.splice(0, 1);

		const newFiles = { ...files };
		newFiles['backstop.json'] = JSON.stringify(newBackstop);

		requests.push(newFiles);
	}

	return requests;
}

module.exports = {
	ensureDirs,
	getEnvVars,
	getFilesToSend,
	prepareBackstopRequests,
};
