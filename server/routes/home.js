const path 		= require('path');
const config 	= require(path.join(__dirname, '../../scripts/config'));

const express 	= require('express');
const router	= express.Router();

router.get('/', (req, res) => {
	res.render('index', {title: config.site.title, user: req.session.user});
});

module.exports = router;
