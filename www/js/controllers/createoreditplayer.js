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
  PlayersManager,
  GamesManager
) {

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
        //change this to go back to a list of players
        $state.go(
            'playerslist', 
            { 
                userId: $stateParams.userId, 
                gameId: $stateParams.gameId
            }
        );
    }

    $scope.createOrEditPlayer = function() {
        var playerObject = $scope.currentPlayer;
        var isNewPlayer = playerObject.id === undefined;
        if( isNewPlayer ) {
            playerObject.isSelected = false;
        }
        if( errorCheckingPlayer(playerObject, $scope.players, $ionicPopup) < 0 ) {
            return;
        }
        //verify pre-assign
        playerObject.team = playerObject.preassign ? playerObject.team : null;
        if( isNewPlayer ) {
            //make post to create player
            utils.showLoading("Creating Player...", $ionicLoading);
            $http.post(
                // /:userId/:gameId/createplayer POST returns id of player
                config.endpoint + '/' + $stateParams.userId + '/createplayer',
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
            $http.put(
                // /:userId/:playerId PUT
                config.endpoint + '/' + $stateParams.userId + '/' + playerObject.id + '/updateplayer',
                playerObject
            ).then(function(res){
                PlayersManager.edit(playerObject);
                fixState(isNewPlayer, playerObject);
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

    //TODO remove duplicated code
    $scope.recalculatePlayerTypes = function() {
        var players = $scope.players;
        $scope.offensePlayers = 0;
        $scope.defensePlayers = 0;
        for(var i = 0; i < players.length; i++) {
            if( players[i].isSelected ) {
                if( players[i].type === 'Offense' ) {
                    $scope.offensePlayers++;
                } else if( players[i].type === 'Defense' ) {
                    $scope.defensePlayers++;
                }
            }
        }
    }

    var fixState = function(isNewPlayer, playerObject) {
        $scope.lastPlayerAdded = isNewPlayer ? playerObject : null;
        $scope.currentPlayer = {};
        if( !isNewPlayer ) {
            $scope.closeCreateOrEditPage();
        }
        $scope.recalculatePlayerTypes();
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

    if( player.type !== 'Defense' && player.type !== 'Offense' ) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Player has to be either offense or defense'
      });
      return -1;
    }

    if( player.preassign !== undefined && player.preassign && ( player.team === null || player.team === undefined || player.team.trim() === "" )) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Player preassign has been set, select a team!'
      });
      return -1;
    }
}


var parseRating = function(possibleNumber) {
    var floatVar = parseFloat(possibleNumber);
    return !isNaN(possibleNumber) && floatVar >= 0 && floatVar <=10 ? floatVar.toFixed(2) : null;
}