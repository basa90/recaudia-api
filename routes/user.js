const express = require('express');
const config = require('../config');

const userCtrl = require('../postgresql/controllers/user');

const api_user = express.Router();


api_user.get('/', userCtrl.findAllUser);
api_user.post('/islogin', userCtrl.islogin);


module.exports = api_user;