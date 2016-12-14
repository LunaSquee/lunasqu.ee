const path 		= require('path');
const config 	= require(path.join(__dirname, 'scripts/config'));

module.exports = {
	client: 'mysql',
	connection: config.mysql,
	pool: { min: 0, max: 24 }
};
