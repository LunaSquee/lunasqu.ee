const path 		= require('path');
const requests 	= require(path.join(__dirname, 'requests'));

module.exports = function(req, secret) {
	return new Promise((success, fail) => {
		// Skip verification if no captcha key present.

		if(secret == null || secret == '')
			return success(true);

		let code = null;

		if(req.body['g-recaptcha-response'])
			code = req.body['g-recaptcha-response'];
		else
			return fail();

		requests.POST('https://www.google.com/recaptcha/api/siteverify', {secret: secret, response: code}).then((res) => {
			if(!res.data)
				return fail();

			if(res.data.success === true)
				return success(true);

			fail();
		}, fail);
	});
};
