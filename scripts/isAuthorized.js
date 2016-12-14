const query = require('querystring');

module.exports = function(req, res, next) {
	if (req.session.authorized) next();
	else {
		var params = req.query;
		params.backUrl = req.path;
		res.redirect('/login?' + query.stringify(params));
	}
};
