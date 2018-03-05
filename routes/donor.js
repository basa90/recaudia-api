const express = require('express');
const config = require('../config');

const donorCtrl = require('../postgresql/controllers/donor');

const api_donor = express.Router();


api_donor.get('/', donorCtrl.findAllDonor);
api_donor.post('/', donorCtrl.addDonor);
api_donor.put('/', donorCtrl.updateDonor);
api_donor.delete('/', donorCtrl.deleteDonor);

module.exports = api_donor;