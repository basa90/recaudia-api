const config = require('../../config');
const conn = require('../db');

exports.DBfindAllDonor = function() {
    return conn.db.any("SELECT donor_id, a.name, last_name, email, TO_CHAR(birthdate, 'DD/MM/YYYY') as birthdate, "+
    				   "phone, case when gender='Male' then 'Masculino' else 'Femenino' END as gender_name, gender, a.client_id, b.name as name_client "+
    				   "FROM public.donor a "+
    				   "LEFT JOIN public.client b on a.client_id = b.client_id "+
    				   "order by a.name ASC");
};

exports.DBaddDonor = function(donor_code, name, last_name, email, birthdate_date, phone, gender, slug, client_id) {
	let dateT = new Date();
    return conn.db.one("INSERT INTO public.donor (donor_code, name, last_name, email, birthdate, phone, gender, slug, client_id, created_at, updated_at ) "+
    				   "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING donor_id", 
    				   [donor_code, name, last_name, email, birthdate_date, phone, gender, slug, client_id, dateT, dateT]);
};


exports.DBupdateDonor = function(donor_id, name, last_name, email, birthdate, phone, gender, client_id) {
	let dateT = new Date();
    return conn.db.none("UPDATE public.donor SET name = $1, last_name = $2, email = $3, birthdate = $4, phone = $5, "+
    					"gender = $6, client_id = $7, updated_at =$8 "+
                        "WHERE donor_id = $9", [name, last_name, email, birthdate, phone, gender, client_id, dateT ,donor_id]);
};

exports.DBdeleteDonor = function(donor_id) {
    return conn.db.none("DELETE FROM public.donor WHERE donor_id = $1",[donor_id]);
};