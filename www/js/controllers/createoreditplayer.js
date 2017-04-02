var utils = require('../utils.js');
var config = require('../config.js');

module.exports = function(
  $http,
  $scope,
  $state,
  $ionicLoading,
  $ionicPopup,
  $ionicPopover,
  $ionicModal,
  $ionicListDelegate,
  $stateParams,
  $ionicPlatform,
  PlayersManager,
  GamesManager
) {


    $ionicPlatform.registerBackButtonAction(function (event) {
            event.preventDefault();
    }, 100);
    //controller variables
    $scope.gameInstance = GamesManager.get($stateParams.gameId);
    $scope.players = PlayersManager.all();
    $scope.lastPlayerAdded = null;

    if( $stateParams.playerId != "-1" ) {
        $scope.currentPlayer = utils.clone(PlayersManager.get($stateParams.playerId));
    } else {
        $scope.currentPlayer = {};
    }

    //go back to the players list page
    $scope.closeCreateOrEditPage = function() {
        error = false;
        getAllPlayers();
    }

    var error = false;
    $scope.createOrEditPlayer = function() {
        var playerObject = utils.clone($scope.currentPlayer);
        var isNewPlayer = $stateParams.playerId == "-1";
        if( isNewPlayer ) {
            playerObject.isSelected = false;
        }
        if( errorCheckingPlayer(playerObject, $scope.players, $ionicPopup) < 0 ) {
            return;
        }
        //verify pre-assign
        playerObject.team = playerObject.preassign ? playerObject.team : null;
        delete playerObject['isSelected'];
        var request;
        error = false;
        if( isNewPlayer ) {
            //make post to create player
            utils.showLoading("Creating Player...", $ionicLoading);
            request = $http.post(
                // /:userId/:gameId/createplayer POST returns id of player
                config.endpoint + '/' + $stateParams.userId + '/' + $stateParams.gameId + '/createplayer',
                playerObject
            ).then(function(res){
                playerObject.id = res.data.id;
                PlayersManager.add(playerObject);
                fixState(isNewPlayer, playerObject);
            }, function(err){
                $ionicPopup.alert({
                    title: 'Error',
                    template: err.data
                });
            }).finally(function(){
                utils.hideLoading($ionicLoading);
            });
        } else {
            request = $http.put(
                // /:userId/:playerId PUT
                config.endpoint + '/' + $stateParams.userId + '/' + playerObject.id + '/updateplayer',
                playerObject
            ).then(function(res){
                PlayersManager.edit(playerObject);
                fixState(isNewPlayer, playerObject);
            }, function(err){
                error = true;
                $ionicPopup.alert({
                    title: 'Error',
                    template: err.data
                });
            }).finally(function(){
                utils.hideLoading($ionicLoading);
            });
        }

        if( !isNewPlayer ) {
            request.then(getAllPlayers);
        }

    }

    var fixState = function(isNewPlayer, playerObject) {
        $scope.lastPlayerAdded = isNewPlayer ? playerObject : null;
        $scope.currentPlayer = {};
        if( !isNewPlayer ) {
            $scope.closeCreateOrEditPage();
        }
    }

    var getAllPlayers = function() {
        if( error ) {
            return;
        }

        $http.get(
            // /:userId/:gameId GET
            config.endpoint + '/' + $stateParams.userId + '/' + $stateParams.gameId + '/allplayers'
        ).then(function(res){
            //set all game instances
            PlayersManager.set(res.data.allPlayers);
            $state.go(
                'playerslist', 
                {
                    userId: $stateParams.userId,
                    gameId: $stateParams.gameId
                }
            );
        }, function(err){
            $ionicPopup.alert({
                title: 'Error',
                template: err.data
            });
        });
    }

}

//helper functions
var errorCheckingPlayer = function(player, players, $ionicPopup) {
    if( player.name === undefined || player.name.trim() === "") {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Player Name has to be valid!'
      });
      return -1;
    }

    var hasFoundDuplicate = false;
    if( player.id === undefined ) {
      for(var i =0; i < players.length; i++) {
        if( players[i].name === player.name ) {
          hasFoundDuplicate = true;
          break;
        }
      }
    }

    if( hasFoundDuplicate ) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Player with this name already exists!'
      });
      return -1;
    }

    player.rating = parseRating(player.rating);
    if( player.rating === null ) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Player Rating is invalid!'
      });
      return -1;
    }
}


var parseRating = function(possibleNumber) {
    var floatVar = parseFloat(possibleNumber);
    return !isNaN(possibleNumber) && floatVar >= 0 && floatVar <=10 ? floatVar.toFixed(2) : null;
}