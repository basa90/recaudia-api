const DBlayer = require('../model/donor');
const uuidv4 = require('uuid/v4');
const chalk = require('chalk');

exports.findAllDonor = async function(req, res) {
    try {

    	let results = await DBlayer.DBfindAllDonor();

          res.status(200).json({
              statusCode: 200,
              data: results
          });

    } catch (err) {
      res.status(500).json({
          statusCode: 500,
          pgErrorCode: err
      });
    }
};

exports.addDonor = async function(req, res) {
	console.log("add");
    try {
    	console.log("Llegue");
    	let donor_code = uuidv4(),
    		name = req.body.name,
            last_name = req.body.last_name,
            email = req.body.email,
            _date = req.body.birthdate_date,
            aDate = _date.split("-"),
            birthdate_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`,
            phone = req.body.phone ,
            gender = req.body.gender ,
            client_id = 1,
            slug = `${name.trim()}-${last_name.trim()}`; 

    	let records = await DBlayer.DBaddDonor(donor_code, name, last_name, email, birthdate_date, phone, gender, slug, client_id),
    		results = await DBlayer.DBfindAllDonor();

          res.status(200).json({
              statusCode: 200,
              data: results
          });

    } catch (err) {
      console.log(`${chalk.red('[recaudia-api]')} addDonor/Error pgErrorCode: ${err.code} `);
      res.status(500).json({
          statusCode: 500,
          pgErrorCode: err
      });

    }
};



exports.updateDonor = async function(req, res) {
    try {

    	let name = req.body.name,
            last_name = req.body.last_name,
            email = req.body.email,
            _date = req.body.birthdate_date,
            aDate = _date.split("-"),
            birthdate = `${aDate[2]}-${aDate[1]}-${aDate[0]}`,
            phone = req.body.phone ,
            gender = req.body.gender ,
            client_id = req.body.client_id,
            donor_id = req.body.donor_id; 

    	let records = await DBlayer.DBupdateDonor(donor_id, name, last_name, email, birthdate, phone, gender, client_id),
    		results = await DBlayer.DBfindAllDonor();
          res.status(200).json({
              statusCode: 200,
              data: results
          });

    } catch (err) {
    	console.log(err);
      console.log(`${chalk.red('[recaudia-api]')} updateDonor/Error pgErrorCode: ${err.code} `);
      res.status(500).json({
          statusCode: 500,
          pgErrorCode: err
      });
    }
};



exports.deleteDonor = async function(req, res) {
    try {
    	let donor_id = req.body.donor_id;

    	let records = await DBlayer.DBdeleteDonor(donor_id),
    		results = await DBlayer.DBfindAllDonor();

          res.status(200).json({
              statusCode: 200,
              data: results
          });

    } catch (err) {
      console.log(`${chalk.red('[recaudia-api]')} deleteDonor/Error pgErrorCode: ${err.code} `);
      res.status(500).json({
          statusCode: 500,
          pgErrorCode: err
      });
    }
};