const fs = require('fs');
const toml = require('toml');
const path = require('path');
const filename = path.join(__dirname, '../config.toml');

let config;

try {
	config = toml.parse(fs.readFileSync(filename));
} catch (e) {
	throw 'config.toml parse error: ' + e;
	console.error(e.stack);
}

module.exports = config;
