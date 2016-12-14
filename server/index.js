'use strict';
const express 		= require('express');
const app 			= express();

const fs 			= require('fs');
const path 			= require('path');
const bodyParser 	= require('body-parser');
const session 		= require('express-session');
const morgan 		= require('morgan');

const RedisStore 	= require('connect-redis')(session);

const config 		= require(path.join(__dirname, '../scripts/config'));
const flash 		= require(path.join(__dirname, '../scripts/flash'));
const uas 			= require(path.join(__dirname, '../scripts/mobileUA'));
const logger 		= require(path.join(__dirname, '../scripts/logger'));

const routes		= require(path.join(__dirname, 'routes'));

const production 	= (process.env.NODE_ENV === 'production');

if(!production)
	logger.debug('server', 'debug output enabled');

app.use(session({
	key: config.server.session.key,
	secret: config.server.session.secret,
	store: new RedisStore({ port: config.server.cache.redis }),
	resave: false,
	saveUninitialized: true
}));

app.use(morgan((production ? 'short' : 'dev')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());
app.use(uas());

// Templating engine
app.disable('x-powered-by');
app.set('devel', !production);
app.set('view engine', 'pug');
app.set('view cache', true);
app.set('views', path.join(__dirname, '../templates'));

app.use('/', express.static(path.join(__dirname, '../build/')));
app.use('/', express.static(path.join(__dirname, '../build/icons/')));
app.use('/', express.static(path.join(__dirname, '../build/document/')));
app.use('/static/', express.static(path.join(__dirname, '../static/')));

app.use(routes);

app.listen(config.server.port, () => {
	logger.log('server', 'Listening on http://localhost:{0}/'.format(config.server.port));
});
