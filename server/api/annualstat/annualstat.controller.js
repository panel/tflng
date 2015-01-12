/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var http = require('request');

// Get list of things
exports.index = function(req, res) {
  var stats;

  http.get('http://localhost:3000/overview/2014.json',function (err, response, body) {
    stats = JSON.parse(body);
    res.json(stats);
  });
};

exports.show = function (req, res) {

};