'use strict';

var express = require('express');
var controller = require('./annualstat.controller');

var router = express.Router();

router.get('/:year', controller.index);
router.get('/:year/:team', controller.show);

module.exports = router;