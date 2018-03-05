const config = require('../../config');
const conn = require('../db');

exports.DBfindAllClient = function() {
    return conn.db.any("SELECT * "+
    				   "FROM public.client order by name ASC");
};
