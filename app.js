const express = require('express');
const bodyParser = require('body-parser');
const fs =  require('fs');
const app = express();
const config = require('./config');

const api_user = require('./routes/user');
const api_subscription = require('./routes/subscription');
const api_donor = require('./routes/donor');
const api_client = require('./routes/client');

// Evitar problemas de CORS:
app.use(function(req, res, next) {

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*');

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();
});


app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.use('/user', api_user);
app.use('/subscription', api_subscription);
app.use('/donor', api_donor);
app.use('/client', api_client);


module.exports = app;
