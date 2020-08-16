/* eslint-disable no-use-before-define */
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const loggers = require('./loggers');

const startTime = Date.now();
let requestedCount = 0;
let successCount = 0;

function onRequestSuccess({ outputPath, resolve }, response) {
	const results = response.data.result;

	if (results) {
		Object.keys(results).forEach((imgName) => {
			successCount += 1;

			loggers.logInfo(`[${successCount}/${requestedCount}] Processing response ${imgName}, took ${Date.now() - startTime}ms.`);

			fs.writeFileSync(
				path.join(outputPath, imgName),
				results[imgName],
				'base64',
			);

			resolve();
		});
	}
}

function onRequestFail(parameters, labels, error) {
	const {
		reject,
		maxRetries,
		retryCount
	} = parameters;

	let newRetryCount = (retryCount || 0);

	if (retryCount >= maxRetries) {
		console.error(error);
		loggers.logFatalError(`No more retries for [${labels}], failing.`);
		reject();
	} else {
		newRetryCount = newRetryCount + 1;

		loggers.logError(`Error happened with [${labels}]. Trying again, retries: ${newRetryCount}/${maxRetries}.`);

		doRequest({
			...parameters,
			retryCount: newRetryCount
		});
	}
}

function doRequest({ url, key, outputPath, data, resolve, reject, maxRetries, retryCount }) {
	const parameters = arguments[0];
	const backstop = JSON.parse(data['backstop.json']);
	const labels = backstop.scenarios.map((scenario) => scenario.label).join(', ');

	loggers.logInfo(`Requesting ${labels}`);

	requestedCount += 1;

	axios.post(
		url,
		data,
		{
			headers: { 'x-api-key': key },
		},
	)
		.then(onRequestSuccess.bind(null, { outputPath, resolve }))
		.catch(onRequestFail.bind(null, parameters, labels));
}

module.exports = {
	doRequest,
};
