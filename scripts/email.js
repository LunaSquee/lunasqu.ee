const path 			= require('path');
const nodemailer 	= require('nodemailer');
const pug 			= require('pug');
const config 		= require(path.join(__dirname, 'config'));
const templates 	= path.join(__dirname, '../templates/email');

let transporter = nodemailer.createTransport(config.email.smtp);

/**
 * Sends an email
 * @param {string} from - Sender Email Address
 * @param {Array} to - Array of recipients
 * @param {string} subject - Subject of the email
 * @param {string} html - Rendered HTML file
 */
let sendEmail = module.exports.sendEmail = function (from, to, subject, html) {
	let mailOptions = {
		from: from,
		to: to.join(' '),
		subject: subject,
		text: html.replace(/<(?:.|\n)*?>/gm, ''),
		html: html
	};

	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, function(error, info) {
			if(error) return reject(error);
			resolve(info);
		});
	});
};

module.exports.sendTemplatedEmail = (from, to, subject, templateName, pugopts) => {
	return new Promise((resolve, reject) => {
		let html = null;
		
		try{
			html = pug.renderFile(path.join(templates, templateName + '.pug'), pugopts);
		} catch(e) {
			return reject(e);
		}

		if(!html) return reject('empty html');

		sendEmail(from, to, subject, html).then(resolve, reject);
	});
};
