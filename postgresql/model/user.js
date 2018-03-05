const config = require('../../config');
const conn = require('../db');

exports.DBfindAllUser = function() {
    return conn.db.any('SELECT * FROM public.user order by full_name ASC');
};

exports.DBislogin = function(_user, password, email) {  

    return conn.db.any("SELECT * FROM public.user WHERE _user = $1 and password = $2 and email = $3 ", 
    					[_user, password, email]);
};

