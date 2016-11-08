var utils = require('../utils.js');

module.exports = function(
  $scope,
  $state,
  $ionicPopup,
  $ionicPopover,
  $ionicModal,
  $ionicListDelegate,
  $stateParams,
  GamesManager
) {

    $scope.currentGameInstance = {teamA:{name:"Light"},teamB:{name:"Dark"}};
    if( $stateParams.gameId != null ) {
        $scope.currentGameInstance = GamesManager.get($stateParams.gameId);
    }

    $scope.exitCreateOrEditGamePage = function() {
        //go back to games list
        //make api call to get all the games
       $state.go('gameslist', {userId: $stateParams.userId});
    }

    $scope.duplicateGame = function() {
        var newInstance = $scope.currentGameInstance;
        if( erroCheckingGame(newInstance, $ionicPopup, GamesManager.all()) < 0 ) {
            return;
        }
        //make api call here to duplicate
        $state.go('gameslist', {userId: $stateParams.userId});
    }

    $scope.createOrEditGame = function() {
        var gameInstance = $scope.currentGameInstance;
        var isNewGame = gameInstance.id === undefined;
        //error checking right here
        if( erroCheckingGame(gameInstance, $ionicPopup, GamesManager.all()) < 0 ) {
            return;
        }

        gameInstance.hasBODRatings = gameInstance.hasSuperOptimizer && gameInstance.hasBODRatings;
        if( isNewGame ) {
            //make post to create game
        } else {
            //make a put to update game info
        }
        //dont forget to put this inside .then for each post and put
        $state.go('gameslist', {userId: $stateParams.userId});
    }   
}

//utils
var erroCheckingGame = function(game, $ionicPopup, games) {
  if( game.gameName === undefined || game.gameName.trim() === "" ) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Game Name has to be valid!'
      });
      return -1;
    }

  var hasFoundDuplicate = false;
  for(var i =0; i < games.length; i++) {
    if( games[i].gameName === game.gameName ) {
      hasFoundDuplicate = true;
      break;
    }
  }

  if( hasFoundDuplicate ) {
    $ionicPopup.alert({
      title: 'Error',
      template: 'Game with the same name already exists!'
    });
    return -1;
  }

    if( game.teamA === undefined || game.teamA.name === undefined || game.teamA.name.trim() === "") {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Team A name has to be valid!'
      });
      return -1;
    }

    if( game.teamB === undefined || game.teamB.name === undefined || game.teamB.name.trim() === "") {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Team B name has to be valid!'
      });
      return -1;
    }

    if( game.teamA.name === game.teamB.name ) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Two teams cannot have the same name!'
      });
      return -1;
    }
}
