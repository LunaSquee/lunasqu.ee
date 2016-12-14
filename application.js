#!/usr/bin/env node
'use strict';
const path 		= require('path');
const config 	= require(path.join(__dirname, 'scripts/config'));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = (config.server.security.tls_reject ? '1' : '0');
process.env.APPLICATION_PATH = path.resolve(__dirname);

global.root_path = process.env.APPLICATION_PATH;

if(process.argv.indexOf('-d') == -1 && process.argv.indexOf('--development') == -1)
	process.env.NODE_ENV = 'production';

if (!String.prototype.format) {
	String.prototype.format = function() {
		let args = arguments;
		return this.replace(/{(\d+)}/g, (match, number) => { 
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}

require(path.join(__dirname, 'server'));
