angular.module('ionicApp.services', [])
//data providers
.factory('GamesManager', require('./services/gamesmanager.js'))
.factory('PlayersManager', require('./services/playersmanager.js'))