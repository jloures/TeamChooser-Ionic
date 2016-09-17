angular.module('ionicApp', ['ionic'])

.controller('AppCtrl', function($scope, $ionicPopup, $ionicModal) {
  
  $scope.games = [];
  $scope.numberOfgames = 0;

  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  $scope.createGame = function(game) {
    var newInstance = Object.assign({}, game);
    //this is error checking
    if( newInstance.gameName === undefined || newInstance.gameName.trim() === "" ) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Game Name has to be valid!'
      });
      return;
    }

    if( newInstance.teamA === undefined || newInstance.teamA.trim() === "") {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Team A name has to be valid!'
      });
      return;
    }

    if( newInstance.teamB === undefined || newInstance.teamB.trim() === "") {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Team B name has to be valid!'
      });
      return;
    }

    if( newInstance.teamA === game.teamB ) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Two teams cannot have the same name!'
      });
      return;
    }

    newInstance.gameId = $scope.numberOfgames++;
    $scope.games.push(newInstance);
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