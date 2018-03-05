const config = require('../../config');
const promise = require('bluebird');
const options = {
    promiseLib: promise
};
const pgp = require('pg-promise')(options);
// Instancia de la base de datos:
const db = pgp(config.db);

module.exports = {
    pgp, db
};