const express = require('express');
const config = require('../config');

const subscriptionCtrl = require('../postgresql/controllers/subscription');

const api_subscription = express.Router();


api_subscription.get('/', subscriptionCtrl.findAllSubscription);
api_subscription.post('/', subscriptionCtrl.addSubscription);
api_subscription.put('/', subscriptionCtrl.updateSubscription);
api_subscription.delete('/', subscriptionCtrl.deleteSubscription);

module.exports = api_subscription;