const path 		= require('path');
const config 	= require(path.join(__dirname, 'config'));

const lvls 		= ['info', 'debug', 'warning', 'error'];

function colorize(type, scope, message) {
	let final = '';

	final += '\x1b[1;36m'+scope+'\x1b[0m ';

	switch(type) {
		case 1:
			final += '\x1b[1;32m{0}\x1b[0m '.format(lvls[type]);
			break;
		case 2:
			final += '\x1b[1;33m{0}\x1b[0m '.format(lvls[type]);
			break;
		case 3:
			final += '\x1b[1;31m{0}\x1b[0m '.format(lvls[type]);
			break;
		default:
			final += '\x1b[1;35m{0}\x1b[0m '.format(lvls[type]);
	};

	final += message;
	return final;
}

function qformat(lvl, scope, message) {
	if(config.log.color)
		message = colorize(lvl, scope, message);
	else
		message = '{0} - {1} - {2}'.format(lvls[lvl], scope, message);
	return message;
}

module.exports = {
	log: (scope, message) => {
		process.stdout.write(qformat(0, scope, message)+'\n');
	},
	debug: (scope, message) => {
		if(process.env.NODE_ENV === 'production') return;
		process.stdout.write(qformat(1, scope, message)+'\n');
	},
	warning: (scope, message) => {
		process.stdout.write(qformat(2, scope, message)+'\n');
	},
	error: (scope, message) => {
		process.stderr.write(qformat(3, scope, message)+'\n');
	}
};
