angular.module('ionicApp', ['ionic', 'ionicApp.controllers', 'ionicApp.services'])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  //this is the route for our login
  .state('login', {
    url: '/',
    cache: false,
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('gameslist', {
    url: '/:userId/gameslist',
    cache: false,
    templateUrl: 'templates/gameslist.html',
    controller: 'GamesList'
  })
  .state('playerslist', {
    url: '/:userId/gameslist/:gameId/playerslist',
    cache: false,
    templateUrl: 'templates/playerslist.html',
    controller: 'PlayersList'
  })
  .state('teamlist', {
    url: '/:userId/gameslist/:gameId/teamlist',
    cache: false,
    templateUrl: 'templates/teamlist.html',
    controller: 'TeamList'
  })
  .state('createoreditgame', {
    url: '/:userId/createoreditgame/:gameId',
    cache: false,
    templateUrl: 'templates/createoreditgame.html',
    controller: 'CreateOrEditGame'
  })
  .state('createoreditplayer', {
    url: '/:userId/createoreditplayer/:playerId',
    cache: false,
    templateUrl: 'templates/createoreditplayer.html',
    controller: 'CreateOrEditPlayer'
  })
  .state('signup', {
    url: '/signup',
    cache: false,
    templateUrl: 'templates/signup.html',
    controller: 'SignUpCtrl'
  })
  .state('passrecovery', {
    url: '/passrecovery',
    cache: false,
    templateUrl: 'templates/passrecovery.html',
    controller: 'PassRecoveryCtrl'
  })
  $urlRouterProvider.otherwise('/');
});

