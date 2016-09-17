angular.module('ionicApp', ['ionic'])

.controller('AppCtrl', function($scope, $ionicPopup, $timeout, $ionicModal) {
  
  $scope.games = [];
  $scope.numberOfgames = 0;

  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  $scope.createGame = function(game) {
    console.log(game)
    var newGame = Object.assign({}, game);
    //do error checking here
    if( game.gameName.trim() === "" ) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Game Name has to be valid!'
      });
      return;
    }

    if( game.teamA.trim() === "") {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Team A name has to be valid!'
      });
      return;
    }

    if( game.teamB.trim() === "") {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Team B name has to be valid!'
      });
      return;
    }

    if( game.teamA === game.teamB ) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Two teams cannot have the same name!'
      });
      return;
    }

    newGame.gameId = $scope.numberOfgames++;
    $scope.games.push(newGame);
    $scope.modal.hide();
    //set all properties to default
    game.gameName = "";
    game.teamA = "";
    game.teamB = "";
    game.hasBODCount = false;
    game.hasSuperOptimizer = false;
    game.hasBODCount = false;
  }
});