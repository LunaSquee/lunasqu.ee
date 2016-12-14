// http://stackoverflow.com/a/6163500

module.exports = function() {
	return function(req, res, next) {
		let data = {Mobile: false};
		const ua = req.headers['user-agent'];

		if (/mobile/i.test(ua))
			data.Mobile = true;

		if (/like Mac OS X/.test(ua)) {
			data.iOS = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua)[2].replace(/_/g, '.');
			data.iPhone = /iPhone/.test(ua);
			data.iPad = /iPad/.test(ua);
		}

		if (/Android/.test(ua))
			data.Android = /Android ([0-9\.]+)[\);]/.exec(ua)[1];

		if (/webOS\//.test(ua))
			data.webOS = /webOS\/([0-9\.]+)[\);]/.exec(ua)[1];

		if (/(Intel|PPC) Mac OS X/.test(ua))
			data.Mac = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(ua)[2].replace(/_/g, '.') || true;

		if (/Windows NT/.test(ua))
			data.Windows = /Windows NT ([0-9\._]+)[\);]/.exec(ua)[1];

		req.mobileuser = data;
		next();
	};
};
