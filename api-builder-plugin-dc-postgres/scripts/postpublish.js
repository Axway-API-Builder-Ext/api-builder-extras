const fs = require('fs');
const path = require('path');
const request = require('request');
const mkdirSync = require('mkdirp').sync;
const pkg = require('../package.json');

const destFolder = path.join('published');
const target = path.join(destFolder, `${pkg.name}@${pkg.version}.tgz`);

const url = `http://registry.ecd.axway.int:8081/artifactory/local-npm/${pkg.name}/-/${pkg.name}-${pkg.version}.tgz`;
// eslint-disable-next-line no-console
console.log(`Downloading ${url} to ./${target}`);

// May be a scoped package folder
const targetDir = path.dirname(target);
if (!fs.existsSync(targetDir)) {
	mkdirSync(targetDir);
}

request
	.get(url)
	.on('error', (err) => {
		throw err;
	})
	.pipe(fs.createWriteStream(target));
