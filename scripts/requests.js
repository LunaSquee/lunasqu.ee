const qs 	= require('querystring');
const url 	= require('url');

let postRequest = module.exports.POST = (link, postdata, options, headers) => {
	if(!options) {
		options = {
			postJSON: false,
			expectJSON: true
		};
	}

	let parsed = url.parse(link);
	let post_data = (options.postJSON ? JSON : qs).stringify(postdata);
	let post_options = {
		host: parsed.host,
		port: parsed.port,
		path: parsed.path,
		method: 'POST',
		headers: {
			'Content-Type': (!options.postJSON ? 'application/x-www-form-urlencoded' : 'application/json; charset=UTF-8'),
			'Content-Length': Buffer.byteLength(post_data),
			'User-Agent': 'lunasqu.ee.js/backend'
		}
	};

	if(headers != null) {
		for(let ext in headers) {
			let header = headers[ext];
			post_options.headers[ext] = header;
		}
	}

	let httpModule = parsed.protocol === 'https:' ? require('https') : require('http');
	
	return new Promise((fulfill, reject) => {
		let post_req = httpModule.request(post_options, (qres) => {
			qres.setEncoding('utf8');

			let data = '';
			let obj;

			qres.on('data', (chunk) => {
				data += chunk;
			});
			
			qres.on('end', () => {
				if(options.expectJSON === true) {
					try{
						obj = JSON.parse(data);
					} catch (err) {
						return reject({data: data, request: qres});
					}
					return fulfill({data: obj, request: qres});
				}
				fulfill({data: data, request: qres});
			});
		}).on('error', function(e) {
			reject({data: e.message, request: qres});
		});

		post_req.write(post_data);
		post_req.end();
	});
};

let getRequest = module.exports.GET = (link, options, headers) => {
	if(!options) {
		options = {
			expectJSON: true
		};
	}

	let parsed = url.parse(link);
	let get_options = {
		host: parsed.host,
		port: parsed.port,
		path: parsed.path,
		method: 'GET',
		'headers':{
			'User-Agent': 'lunasqu.ee.js/backend'
		}
	};

	if(headers != null) {
		for(let ext in headers) {
			let header = headers[ext];
			get_options.headers[ext] = header;
		}
	}
	
	let httpModule = parsed.protocol === 'https:' ? require('https') : require('http');

	return new Promise((fulfill, reject) => {
		httpModule.get(get_options, function (res) {
			if (res.statusCode === 302 || res.statusCode === 301) {
				getRequest.call(this, res.headers.location, callback, extendedHeaders, lback).then(fulfill, reject);
				return;
			}
			let data = '';
			let obj;

			res.on('data', function (chunk) {
				data += chunk;
			});

			res.on('end', function () {
				if(options.expectJSON === true) {
					try{
						obj = JSON.parse(data);
					} catch (err) {
						return reject({data: data, request: res});
					}
					return fulfill({data: obj, request: res});
				}
				fulfill({data: data, request: res});
			});

		}).on('error', function (e) {
			reject({data: e.message, request: res});
		});
	});
};
