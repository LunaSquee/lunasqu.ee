const express 	= require('express');
const path 		= require('path');
const query 	= require('querystring');
const router 	= express.Router();

const application 	= require(path.join(__dirname, '../models'));
const emailtemplate = require(path.join(__dirname, '../../scripts/email'));
const config 		= require(path.join(__dirname, '../../scripts/config'));
const hasher 		= require(path.join(__dirname, '../../scripts/hashers'));
const logger 		= require(path.join(__dirname, '../../scripts/logger'));
const recaptcha 	= require(path.join(__dirname, '../../scripts/reCAPTCHA'));

function form_error(req, res, message, data, field) {
	req.flash('message', { message: message, error: true });
	if(field)
		req.flash('field', field);

	if(data)
		req.flash('form_data', data);

	res.redirect('/register');
}

function send_activation_email(acc) {
	let url = config.site.url + '/account/activate/';

	application.ActivationToken.query().delete().where('user_id', acc.id);

	let activationToken = hasher.generateRandomBytes(64);

	application.ActivationToken.query().insert({user_id: acc.id, token: activationToken, expiry: new Date(Date.now()+86400000)})
		.then((dat) => {
			logger.debug('account-activator', 'Activation token generated for '+acc.username);
			emailtemplate.sendTemplatedEmail(config.email.admin, [acc.email], 'Activate Your '+config.site.title+' Account.', 
				'register_success', {accountActivationCode: url + activationToken, site: config.site, username: acc.display_name});
	});
}

router.get('/logout', function (req, res, next) {
	if(req.session.user) {
		req.session.authorized = false;
		logger.debug('login', 'account logout `{0}`'.format(req.session.user.username));
		delete req.session.user;
	}

	res.redirect('/');
});

router.get('/account/activate/:hash', function (req, res, next) {
	if(!req.params.hash)
		return res.redirect('/');
	let hash = req.params.hash;

	application.ActivationToken.query().where('token', hash).then((token) => {
		if(token.length == 0) {
			req.flash('message', {message: 'Invalid activation token!', error: true});
			res.redirect('/login');
			return;
		}
		token = token[0];

		if(Date.now() > new Date(token.expiry).getTime()) {
			req.flash('message', {message: 'The activation token has expired!', error: true});
			res.redirect('/login');
			application.ActivationToken.query().delete().where('id', token.id);
			return;
		}

		application.User.query().where('id', token.user_id).then((user) => {
			user = user[0];
			
			application.ActivationToken.query().delete().where('user_id', user.id);

			if(user.activated == 1) {
				req.flash('message', {message: 'That account is already activated!', error: false});
				res.redirect('/login');
				return;
			}

			application.User.query().patch({activated: 1}).where('id', user.id).then(() => {
				req.flash('message', {message: 'Account activated!\nYou may now log in.', error: false});
				res.redirect('/login');
			}, (e) => {
				logger.error('account-activator', e);
				req.flash('message', {message: 'An error occured.', error: true});
				res.redirect('/login');
				return;
			});
		});
	}, (e) => {
		logger.error('account-activator', e);
		req.flash('message', {message: 'An error occured.', error: true});
		res.redirect('/login');
		return;
	});
});

router.get('/account/activate/resend/:username', function (req, res, next) {
	if(!req.params.username) return res.redirect('/');

	application.User.query().where('username', req.params.username).then((acc) => {
		if(acc.length === 0) return res.redirect('/');
		acc = acc[0];

		if(acc.activated === 1) return res.redirect('/');

		send_activation_email(acc);

		req.flash('message', { message: 'The confirmation email has been resent.', error: false });
		res.redirect('/login');
	});
});

router.get('/login', function (req, res, next) {
	if(req.session.user) {
		let backUrl = req.query.backUrl ? req.query.backUrl : '/';
		delete(req.query.backUrl);
		return res.redirect(backUrl);
	}

	let message = req.flash('message') || [{}];

	res.render('login', { message: message[0], site: config.site });
});

router.post('/login', function(req, res, next) {
	let backUrl = req.query.backUrl ? req.query.backUrl : '/';
	delete(req.query.backUrl);
	backUrl += backUrl.indexOf('?') > -1 ? '&' : '?';
	backUrl += query.stringify(req.query);

	let username = req.body.username;
	let password = req.body.password;

	if (req.session.authorized) res.redirect(backUrl);
	else if (username && password) {
		application.User.query().where('username', username).then((user) => {
			if(!user.length) {
				req.flash('message', {message: 'Invalid username or password!', error: true});
				return res.redirect(req.url);
			}

			user = user[0];

			let valid = hasher.validatePassword(user.password, password);
			if(!valid) {
				req.flash('message', {message: 'Invalid username or password!', error: true});
				res.redirect(req.url);
				return;
			}

			if(user.activated === 0) {
				req.flash('message', {message: 'This user has not been activated yet!', error: true});
				res.redirect(req.url);
				return;
			}

			logger.debug('login', 'account login `{0}`'.format(username));

			req.session.user = user;
			req.session.authorized = true;
			res.redirect(backUrl);
		}, (e) => {
			logger.error('login', e);
			req.flash('message', {message: 'Server error.', error: true});
			res.redirect(req.url);
		});
	} else res.redirect(req.url);
});

router.get('/register', function (req, res, next) {
	if(req.session.user) return res.redirect('/');
	let message = req.flash('message');
	let form_data = req.flash('form_data');

	if(message)
		message = message[0];

	if(form_data.length)
		form_data = form_data[0];
	else
		form_data = {};

	let recaptcha_site = (config.server.security.recaptcha_site === '' ? null : config.server.security.recaptcha_site);

	res.render('register', {message: message, form_data: form_data, recaptcha: recaptcha_site, site: config.site});
});

router.post('/register', function(req, res) {
	if(req.session.user)
		return res.redirect('/');

	let data = {};

	let username = req.body.username;
	if(!username || (username = username.match(/[a-zA-Z0-9\_\-]{3,20}/)) == null)
		return form_error(req, res, 'Invalid username!\nUsername may only contain English letters, numbers, `-` and `_`.', data, 'username');

	if(username[0])
		username = username[0];

	data.username = username;

	let display_name = req.body.display_name;
	if(!display_name || (display_name = display_name.match(/.{3,56}/)) == null)
		return form_error(req, res, 'Invalid display name!', data, 'display_name');

	if(display_name[0])
		display_name = display_name[0];

	data.display_name = display_name;

	let password      = req.body.password;
	let passwordAgain = req.body.password_again;
	if(!password)
		return form_error(req, res, 'Please enter a password!', data, 'password');

	data.passwordPlain = password;

	if(password.length < 8)
		return form_error(req, res, 'Your password is too short (8 characters minimum)', data, 'password');

	if(password !== passwordAgain)
		return form_error(req, res, 'The passwords do not match', data, 'password_again');

	let email = req.body.email;
	if(!email || email.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/) == null)
		return form_error(req, res, 'Invalid email address!', data, 'email');

	data.email = email;

	recaptcha(req, config.server.security.recaptcha_secret).then(() => {
		application.User.query().where('username', username).then((a) => {
			if(a.length)
				return form_error(req, res, 'Username is already taken!', data, 'username');

			data.password = hasher.hashPassword(data.passwordPlain).password;

			application.User.query().insert({username: data.username, display_name: data.display_name, password: data.password,
				email: data.email, created_at: new Date(), updated_at: new Date()}).then((user) => {
					send_activation_email(user);

					// Create a profile for the user
					user.$relatedQuery('profile').insert({bio: 'I\'m new here.'}).then();

					logger.debug('register', 'account created '+data.username);

					req.flash('message', { message: 'Account successfully created!\nA confirmation email has been sent.', error: false });
					res.redirect('/login');
			}, (a) => {
				logger.error('register', a);
				return form_error(req, res, 'Server error', data);
			});
		}, (a) => {
			logger.error('register', a);
			return form_error(req, res, 'Server error', data);
		});
	}, () => {
		return form_error(req, res, 'Failed to verify your humanity.', data);
	});
});

module.exports = router;
