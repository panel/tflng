'use strict';

angular.module('tflngApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap'
])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  })

  .filter('percentage', function () {
    return function (value, _precision) {
      var newValue = parseFloat(value) * 100;
      return (_.isUndefined(_precision)) ? newValue + '%' : newValue.toFixed(_precision) + '%';
    };
  })
  .filter('trim', function () {
    return function (value, _precision) {
      return parseFloat(value).toFixed(_precision || 3);
    };
  });