const express = require('express');
const config = require('../config');

const clientCtrl = require('../postgresql/controllers/client');

const api_client = express.Router();


api_client.get('/', clientCtrl.findAllClient);


module.exports = api_client;