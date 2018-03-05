const DBlayer = require('../model/user');

exports.findAllUser = async function(req, res) {
    try {

    	let results = await DBlayer.DBfindAllUser();

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


exports.islogin = async function(req, res) {
    try {
      console.log("login");
      let _user = req.body._user,
          password = req.body.password,
          email = req.body.email;


      let results = await DBlayer.DBislogin(_user, password, email);

          let isValid = results.length > 0? true:false;
          console.log(isValid);

          res.status(200).json({
              statusCode: 200,
              data: isValid
          });

    } catch (err) {
      console.log(err);
      res.status(500).json({
          statusCode: 500,
          pgErrorCode: err
      });
    }
};