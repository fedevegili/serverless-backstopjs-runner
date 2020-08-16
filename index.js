const path = require('path');
const { Command } = require('commander');
const loggers = require('./helpers/loggers');
const prepare = require('./helpers/prepare');
const requester = require('./helpers/requester');

const program = new Command();

program
	.option('--config <path>', 'custom path for backstopjs config', 'backstop.json')
	.option('--retries <number>', 'how many times each request should be retried', '1')
	.option('--output <path>', 'folder where images will be saved', 'dist');

program.parse(process.argv);

const retries = parseInt(program.retries, 10);
const outputPath = program.output;
const configPath = program.config;
const configName = path.basename(configPath);

loggers.logInfo('Successfully read API_URL and API_KEY');

prepare.ensureDirs(outputPath);

const { url, key } = prepare.getEnvVars();

const filesToSend = prepare.getFilesToSend(configPath);

loggers.logInfo(`Files to be sent: ${Object.keys(filesToSend).join(', ')}`);

const backstopRequests = prepare.prepareBackstopRequests(filesToSend, configName);

loggers.logInfo(`Prepared ${backstopRequests.length} requests. ${retries} retries for each failure.`);

const requestPromises = [];
const startTime = Date.now();

backstopRequests.forEach((data) => {
	requestPromises.push(
		new Promise((resolve, reject) => {
			requester.doRequest({
				url,
				key,
				outputPath,
				data,
				resolve,
				reject,
				maxRetries: retries,
			});
		}),
	);
});

Promise.all(requestPromises).then(() => {
	loggers.logSuccess(`All requests completed in ${Date.now() - startTime}ms. Files saved to ${outputPath} folder`);

	process.exit(0);
}).catch((error) => {
	loggers.logError(error);
	loggers.logFatalError('Some requests could not be completed, failing.');

	process.exit(1);
});
