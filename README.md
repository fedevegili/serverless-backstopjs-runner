### serverless-backstopjs-runner
Runs [BackstopJS](https://github.com/garris/BackstopJS) against a serverless endpoint. Used in conjuction with [serverless-backstopjs](https://github.com/fedevegili/serverless-backstopjs).

Read more about it here: [The power of serverless: Visual regression tests from 20 minutes to 10 seconds](ARTICLE_LINK)

### Install
```npm install serverless-backstopjs-runner```

### Usage
```API_KEY=YOUR_API_KEY API_URL=YOUR_API_URL npx serverless-backstopjs-runner --config sample/sample_backstop_config.json --retries 2```

### Configuration
View available parameters using ```npx serverless-backstopjs-runner -h```

### Guidelines
* You must create a sub-folder for your backstop config
* Every file inside this sub-folder will be serialized and sent to your endpoint
* Your endpoint will read it, write them to disk and run backstopjs
* Your associate scripts (e.g. onReadyScript) must be in this same sub-folder