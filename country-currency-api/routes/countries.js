const express = require('express');
const router = express.Router();
const controller = require('../controller/countriesCountroller');

router.post('/refresh', controller.refreshCountries);

router.get('/image', controller.getSummaryImage);

router.get('/', controller.getAllCountries);

router.get('/:name', controller.getCountryByName);

router.delete('/:name', controller.deleteCountry);

module.exports = router;