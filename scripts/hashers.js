const crypto = require('crypto');
const algorithm = 'sha512';
const saltLength = 8;

function generateRandomBytes(len) {
	return crypto.randomBytes(Math.ceil(len/2))
				 .toString('hex')
				 .slice(0,len);
}

function generateHash(plaintext, salt) {
	let hash = crypto.createHmac(algorithm, salt);
	hash.update(plaintext);
	return hash.digest('base64');
}

function hashPassword(password) {
	let salt = generateRandomBytes(saltLength);
	let hash = generateHash(password, salt);
	return {
		salt: salt,
		hash: hash,
		password: algorithm+'$'+salt+'$'+hash
	};
}

function validate(password, plaintext) {
	if(!password || !plaintext) return false;
	let slices = password.split('$');
	let hash = generateHash(plaintext, slices[1]);

	if(hash === slices[2])
		return true;
	else
		return false;
}

module.exports = {
	hashPassword: hashPassword,
	validatePassword: validate,
	generateHash: generateHash,
	generateRandomBytes: generateRandomBytes
};
