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
    GamesManager
) {

    $scope.currentGameInstance = utils.defaultGame;
    if( $stateParams.gameId != "-1" ) {
        $scope.currentGameInstance = GamesManager.getCurrent();
    }

    $scope.exitCreateOrEditGamePage = function() {
        // start the loading page
        utils.showLoading("Syncing Games...", $ionicLoading);
        //API to get all games
        $http.get(
            // :userId/allgames GET
            config.endpoint + '/' + $stateParams.userId + '/allgames'
        ).then(function(res){
            utils.hideLoading($ionicLoading);
            //set all game instances
            GamesManager.set(res.data.allGames);
            $state.go('gameslist', {userId: $stateParams.userId});
        }, function(err){
            utils.hideLoading($ionicLoading);
            $ionicPopup.alert({
                title: 'Error',
                template: err.data
            });
        });
    }

    $scope.duplicateGame = function() {
        var newInstance = $scope.currentGameInstance;
        if( erroCheckingGame(newInstance, $ionicPopup, GamesManager.all()) < 0 ) {
            return;
        }
        //make api call here to duplicate
        utils.showLoading("Duplicating Game...", $ionicLoading);
        //will need to change this once you have the players too
        $http.post(
            // /:userId/creategame POST returns id (gamesInstance.id)
            config.endpoint + '/' + $stateParams.userId + '/creategame',
            newInstance
        ).then(function(res){
            newInstance.id = res.data.id;
            GamesManager.add(newInstance);
            $state.go('gameslist', {userId: $stateParams.userId});
        }, function(err){
            $ionicPopup.alert({
                title: 'Error',
                template: err.data
            });
        }).finally(function(){
            utils.hideLoading($ionicLoading);
        });
    }

    $scope.createOrEditGame = function() {
        var gameInstance = $scope.currentGameInstance;
        var isNewGame = gameInstance.id === null || gameInstance.id === undefined;
        //error checking right here
        if( erroCheckingGame(gameInstance, $ionicPopup, GamesManager.all()) < 0 ) {
            return;
        }

        gameInstance.hasBODRatings = gameInstance.hasSuperOptimizer && gameInstance.hasBODRatings;
        if( isNewGame ) {
            //make post to create game
            utils.showLoading("Creating Game...", $ionicLoading);
            $http.post(
                // /:userId/creategame POST returns id (gamesInstance.id)
                config.endpoint + '/' + $stateParams.userId + '/creategame',
                gameInstance
            ).then(function(res){
                gameInstance.id = res.data.id;
                GamesManager.add(gameInstance);
                $state.go('gameslist', {userId: $stateParams.userId});
            }, function(err){
                $ionicPopup.alert({
                    title: 'Error',
                    template: err.data
                });
            }).finally(function(){
                utils.hideLoading($ionicLoading);
            });
        } else {
            utils.showLoading("Updating Game...", $ionicLoading);
            $http.put(
                // /:userId/:gameId PUT
                config.endpoint + '/' + $stateParams.userId + '/' + gameInstance.id,
                gameInstance
            ).then(function(res){
                GamesManager.edit(gameInstance);
                $state.go('gameslist', {userId: $stateParams.userId});
            }, function(err){
                $ionicPopup.alert({
                    title: 'Error',
                    template: err.data
                });
            }).finally(function(){
                utils.hideLoading($ionicLoading);
            });
        }
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
