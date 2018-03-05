const DBlayer = require('../model/client');

exports.findAllClient = async function(req, res) {
    try {

    	let results = await DBlayer.DBfindAllClient();

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