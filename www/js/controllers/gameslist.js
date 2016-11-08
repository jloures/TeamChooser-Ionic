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
  
  $scope.games = GamesManager.all();

  $scope.openPlayersList = function(game) {
    //make api call here to get all players in the game
    $state.go(
      'playerslist', 
      { 
          userId: $stateParams.userId, 
          gameId: $stateParams.gameId
      }
    )
  }

  $scope.goToCreateOrEditGame = function() {
    $state.go(
      'createoreditgame',
      {
          userId: $stateParams.userId,
          gameId: null
      }
    )
  }

  $scope.deleteGame = function(game) {
    //make api call here to delete game then execute the code
    var gameIndex = utils.findIndex($scope.games,game);
    if( gameIndex === -1 ) {
      return;
    }
    $scope.games.splice(gameIndex, 1);
    $ionicListDelegate.closeOptionButtons();
  }

  $scope.editGame = function(game) {
    $state.go(
      'createoreditgame',
      {
          userId: $stateParams.userId,
          gameId: game.id
      }
    )
  }
}
