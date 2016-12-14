const express 			= require('express');
const combinerRouter 	= express.Router();

const path				= require('path');

combinerRouter.use('/', require(path.join(__dirname, 'home')));
combinerRouter.use('/', require(path.join(__dirname, 'account')));

module.exports = combinerRouter;
