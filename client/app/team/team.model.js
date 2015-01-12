(function () {
	'use strict';

	var $ng = angular.module('tflngApp');

	var stats = [
		'assists',
		'caused_turnovers',
		'clear_attempts',
		'clear_success',
		'extra_man_goals',
		'extra_man_opportunities',
		'faceoffs_won',
		'goals',
		'ground_balls',
		'man_down_goals',
		'penalties',
		'penalty_time',
		'pyth',
		'shot_attempts',
		'shots_on_goal',
		'turnovers'
	];

	function _camelize(string) {
		return string.replace(/(_\w)/g, function (match) {
			return match[1].toUpperCase();
		});
	}

	function _mapStats(spec, _prefix) {
		var bucket = {};
		var prefix = _prefix || '';

		_.each(stats, function (stat) {
			bucket[_camelize(stat)] = spec[prefix + stat];
		});

		return bucket;
	}

	$ng.factory('Team', function teamFactory() {

		function Team(spec) {
			var self = this;
			var opp;

			self.name = spec.team.name;
			self.id = spec.team.id;

			self.stats = {};
			self.stats.offensiveAdjustment = spec.off_adj;
			self.stats.defensiveAdjustment = spec.def_adj;
			self.stats.games = spec.games;
			self.stats.wins = spec.wins;
			self.stats.faceoffsTaken = spec.faceoffs_taken;
			self.stats.us = _mapStats(spec);
			self.stats.them = _mapStats(spec, 'opp_');

			self.opp = function _opp() {
				opp = new Team(spec);
				opp.stats.us = _.clone(self.stats.them);
				opp.stats.them = _.clone(self.stats.us);
				return opp;
			};
		}

		Team.prototype.perGame = function perGame(arg) {
			var self = this;
			return function () {
				var value = (_.isFunction(arg)) ? arg() : arg;
				return value / self.stats.games;
			};
		};

		Team.prototype.perPos = function perPos(arg) {
			var self = this;
			return function () {
				var value = (_.isFunction(arg)) ? arg() : arg;
				return value / self.possessions();
			};
		};

		Team.prototype.losses = function losses() {
			return this.stats.games - this.stats.wins;
		};

		Team.prototype.goalsPerGame = function gpg() {
			return this.perGame(this.stats.us.goals)();
		};

		Team.prototype.goalsPerPossesion = function gpp() {
			return this.perPos(this.stats.us.goals)();
		};

		Team.prototype.goalDifferential = function goalDiff() {
			return this.stats.us.goals - this.stats.them.goals;
		};

		Team.prototype.opponentGoalsPerGame = function ogpg() {
			return this.goalsPerGame.call(this.opp());
		};

		Team.prototype.opponentGoalsPerPossession = function ogpg() {
			return this.goalsPerPossesion.call(this.opp());
		};

		Team.prototype.possessions = function pos() {
			var rides = this.stats.them.clearAttempts - this.stats.them.clearSuccess;
			return this.stats.us.faceoffsWon + this.stats.us.clearAttempts + rides;

		};

		Team.prototype.possessionsPerGame = function ppg() {
			return this.perGame(this.possessions());
		};

		Team.prototype.opponentPossessions = function oppPos() {
			return this.possessions.call(this.opp());
		};

		Team.prototype.opponentPossessionsPerGame = function oppg() {
			return this.perGame(this.opponentPossessions());
		};

		Team.prototype.pace = function pace() {
			return (this.possessions() + this.opponentPossessions()) / this.stats.games;
		};

		Team.prototype.possessionPercentage = function posPer() {
			return this.possessions() / (this.possessions() + this.opponentPossessions());
		};

		Team.prototype.opponentPossessionPercentage = function oppPosPer() {
			return this.possessionPercentage.call(this.opp());
		};

		Team.prototype.faceoffPercentage = function foPercent() {
			return this.stats.us.faceoffsWon / this.stats.faceoffsTaken;
		};

		Team.prototype.shootingPercentage = function shootingPer() {
			return this.stats.us.goals / this.stats.us.shotAttempts;
		};

		Team.prototype.effectiveShootingPercentage = function effShootingPer() {
			return this.stats.us.goals / this.stats.us.shotsOnGoal;
		};

		Team.prototype.shotAccuracy = function shotAcc() {
			return this.stats.us.shotsOnGoal / this.stats.us.shotAttempts;
		};

		Team.prototype.shotsPerPossesion = function shotsPerPos() {
			return this.perPos(this.stats.us.shotsOnGoal);
		};

		Team.prototype.opponentShootingPercentage = function oppShootingPer() {
			return this.shootingPercentage.call(this.opp());
		};

		Team.prototype.opponentEffectiveShootingPercentage = function oppEffShootingPer() {
			return this.effectiveShootingPercentage.call(this.opp());
		};

		Team.prototype.opponentShotAccuracy = function oppShotAcc() {
			return this.shotAccuracy.call(this.opp());
		};

		Team.prototype.opponentShotsPerPossesion = function oppShotsPerPos() {
			return this.shotsPerPossesion.call(this.opp());
		};

		Team.prototype.offensiveClearRate = function offClearRate() {
			return this.stats.us.clearSuccess / this.stats.us.clearAttempts;
		};

		Team.prototype.defensiveClearRate = function defClearRate() {
			return 1 - (this.stats.them.clearSuccess / this.stats.them.clearAttempts);
		};

		Team.prototype.saves = function saves() {
			return this.stats.them.shotsOnGoal - this.stats.them.goals;
		};

		Team.prototype.savesPerPossession = function savesPP() {
			return this.savesPerPossession(this.saves);
		};

		Team.prototype.adjustedOffensiveEfficiency = function adjOffEff() {
			return ((this.stats.us.goals) / this.possessions()) / this.stats.offensiveAdjustment;
		};

		Team.prototype.adjustedDefensiveEfficiency = function adjOffEff() {
			return ((this.stats.them.goals) / this.opponentPossessions()) / this.stats.defensiveAdjustment;
		};

		Team.prototype.pyth = function pyth() {
			if (_.isUndefined(this.stats.us.pyth)) {
				var defVal = this.adjustedDefensiveEfficiency() * this.opponentPossessionPercentage();
				var offVal = this.adjustedOffensiveEfficiency() * this.possessionPercentage();

				this.stats.us.pyth = Math.pow(1 + (Math.pow(defVal / offVal, 3.1)), -1);
			}

			return this.stats.us.pyth;
		};

		Team.prototype.opponentPyth = function oppPyth() {
			return this.stats.them.pyth / 100;
			// return this.pyth.call(this.opp());
		};



		return Team;
	});
}());
