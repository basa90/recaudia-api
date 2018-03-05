const config = require('../../config');
const conn = require('../db');

exports.DBfindAllSubscription = function() {
    return conn.db.any("select subscription_id, amount, type_card, brand_card, last_digits, "+
    				   "TO_CHAR(init_date, 'DD/MM/YYYY') as init_date, a.donor_id, (b.name || ' ' || b.last_name) as donor_name "+
					   "FROM subscription a "+
					   "LEFT JOIN donor b on a.donor_id = b.donor_id "+
					   "order by donor_name");
};

exports.DBaddSubscription = function(donor_id, amount, type_card, type_brand, last_digits, init_date) {
	let dateT = new Date();
    return conn.db.one("INSERT INTO public.subscription (donor_id, amount, type_card, brand_card, last_digits, init_date, created_at) "+
    				   "VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING subscription_id", 
    					[donor_id, amount, type_card, type_brand, last_digits, init_date, dateT]);
};

exports.DBupdateSubscription = function(subscription_id, donor_id, amount, type_card, brand_card, last_digits, init_date) {
    return conn.db.none("UPDATE public.subscription SET donor_id = $1, amount = $2, type_card = $3, brand_card = $4, last_digits = $5, init_date = $6 "+
                        "WHERE subscription_id = $7", [donor_id, amount, type_card, brand_card, last_digits, init_date, subscription_id]);
};

exports.DBdeleteSubscription = function(subscription_id) {
	console.log(subscription_id);
    return conn.db.none("DELETE FROM public.subscription WHERE subscription_id = $1",[subscription_id]);
};