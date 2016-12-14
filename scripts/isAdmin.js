const path 			= require('path');
const application	= require(path.join(__dirname, '../models'));

module.exports = function (scopes) {
	return function(req, res, next) {
		if(!req.session.user) return res.status(401).jsonp({error: 'Unauthorized.'});

		application.Administrator.query().where('user_id', req.session.user.id).then((users) => {
			if(!users.length) return res.status(403).jsonp({error: 'Forbidden.'});
			let user = users[0];

			let satisfied = false;

			for(let i in scopes) {
				if(user.scopes.indexOf(scopes[i]) != -1) {
					satisfied = true;
				} else {
					satisfied = false;
					break;
				}
			}

			if(satisfied)
				next();
			else
				return res.status(403).jsonp({error: 'Forbidden.'});
		});
	};
};
