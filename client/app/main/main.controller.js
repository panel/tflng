'use strict';

angular.module('tflngApp')
  .controller('MainCtrl', function ($scope, $http, Team) {
    $scope.teams = [];

    $http.get('/api/annualstat/2014').success(function(teams) {
      $scope.teams = _.map(teams, function (team) {
        return new Team(team);
      });
      window.team = $scope.teams[0];
    });

    var currentSort;

    $scope.sortBy = function (key) {
      if (key === currentSort) {
        $scope.teams.reverse();
      } else {
        currentSort = key;

        $scope.teams = _.sortBy($scope.teams, function(team) {
          var path = key.split('.');
          return path.reduce(function (obj, prop) {
            var val = obj[prop];
            return (_.isFunction(val)) ? val.call(team) : val;
          }, team);
        });
      }
    };

  });
