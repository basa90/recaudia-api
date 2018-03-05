const DBlayer = require('../model/subscription');
const chalk = require('chalk');

exports.findAllSubscription = async function(req, res) {
    try {
      console.log("llegue");
    	let results = await DBlayer.DBfindAllSubscription();

          res.status(200).json({
              statusCode: 200,
              data: results
          });

    } catch (err) {
      console.log(err);
      console.log(`${chalk.red('[recaudia-api]')} findAll/Error pgErrorCode: ${err.code} `);
      res.status(500).json({
          statusCode: 500,
          pgErrorCode: err
      });
    }
};

exports.addSubscription = async function(req, res) {
	console.log("add");
    try {
    	console.log("Llegue");
    	let 	donor_id = req.body.donor_id,
            amount = req.body.amount,
            type_card = req.body.type_card,
            type_brand = req.body.type_brand,
            last_digits = req.body.last_digits,
            _date = req.body.init_date,
            aDate = _date.split("-"),
            init_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`; 

    	let records = await DBlayer.DBaddSubscription(donor_id, amount, type_card, type_brand, last_digits, init_date),
    		results = await DBlayer.DBfindAllSubscription();

          res.status(200).json({
              statusCode: 200,
              data: results
          });

    } catch (err) {
      console.log(err);
      console.log(`${chalk.red('[recaudia-api]')} addSubscription/Error pgErrorCode: ${err.code} `);
      res.status(500).json({
          statusCode: 500,
          pgErrorCode: err
      });

    }
};



exports.updateSubscription = async function(req, res) {
    try {

    	let  subscription_id = req.body.subscription_id,
            donor_id = req.body.donor_id,
            amount = req.body.amount,
            type_card = req.body.type_card,
            brand_card = req.body.brand_card,
            last_digits=   req.body.last_digits,
            _date = req.body.init_date,
            aDate = _date.split("-"),
            init_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;

      console.log(subscription_id, donor_id, amount, type_card, brand_card, last_digits, init_date);

    	let records = await DBlayer.DBupdateSubscription(subscription_id, donor_id, amount, type_card, brand_card, last_digits, init_date),
    		results = await DBlayer.DBfindAllSubscription();
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



exports.deleteSubscription = async function(req, res) {
    try {
    	let subscription_id = req.body.subscription_id;
      console.log(subscription_id);
    	let records = await DBlayer.DBdeleteSubscription(subscription_id),
    		  results = await DBlayer.DBfindAllSubscription();

          res.status(200).json({
              statusCode: 200,
              data: results
          });

    } catch (err) {
      console.log(err);
      console.log(`${chalk.red('[recaudia-api]')} deleteSubscription/Error pgErrorCode: ${err.code} `);
      res.status(500).json({
          statusCode: 500,
          pgErrorCode: err
      });
    }
};