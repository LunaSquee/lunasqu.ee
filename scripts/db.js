const path = require('path');
const knex = require('knex')(require(path.join(__dirname, '../knexfile')));

module.exports = { knex: knex };
