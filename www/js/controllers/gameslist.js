var utils = require('../utils.js');
var config = require('../config.js');

module.exports = function(
  $http,
  $scope,
  $state,
  $ionicPopup,
  $ionicPopover,
  $ionicLoading,
  $ionicModal,
  $ionicListDelegate,
  $stateParams,
  GamesManager,
  PlayersManager
) {
  
  $scope.games = GamesManager.all();
  $scope.openPlayersList = function(game) {
    //make api call here to get all players in the game
    // start the loading page
    utils.showLoading("Loading Players...", $ionicLoading);
    //API to get all games
    $http.get(
        // :userId/:gameId/allplayers GET
        config.endpoint + '/' + $stateParams.userId + '/' + game.id + '/allplayers'
    ).then(function(res){
        //set all game instances
        PlayersManager.set(res.data.allPlayers);
        $state.go(
          'playerslist', 
          {
            userId: $stateParams.userId,
            gameId: game.id
          }
        );
    }, function(err){
        $ionicPopup.alert({
            title: 'Error',
            template: err.data
        });
    }).finally(function(){
        utils.hideLoading($ionicLoading);
    });
  }

  $scope.goToCreateOrEditGame = function() {
    $state.go(
      'createoreditgame',
      {
          userId: $stateParams.userId,
          gameId: "-1"
      }
    )
  }

  $scope.deleteGame = function(game) {
    //make api call here to delete game then execute the code
    utils.showLoading("Deleting Game...", $ionicLoading);
    $http.delete(
      // /:userId/:gameId DEL
      config.endpoint + '/' + $stateParams.userId + '/' + game.id + '/deletegame'
    ).then(function(res){
      var gameIndex = utils.findIndex($scope.games,game);
      if( gameIndex === -1 ) {
        return;
      }
      $scope.games.splice(gameIndex, 1);
      $ionicListDelegate.closeOptionButtons();
    },function(err){
        $ionicPopup.alert({
            title: 'Error',
            template: err.data
        });
    }).finally(function(){
        utils.hideLoading($ionicLoading);
    });
  }

  $scope.editGame = function(game) {
    //make api call here to delete game then execute the code
    utils.showLoading("Loading Game Info...", $ionicLoading);
    $http.get(
      // /:userId/:gameId GET
      config.endpoint + '/' + $stateParams.userId + '/' + game.id + '/getgame'
    ).then(function(res){
      GamesManager.setCurrent(res.data.game);
      $state.go(
        'createoreditgame',
        {
            userId: $stateParams.userId,
            gameId: game.id
        }
      )
    },function(err){
        $ionicPopup.alert({
            title: 'Error',
            template: err.data
        });
    }).finally(function(){
        utils.hideLoading($ionicLoading);
    });
  }
}
