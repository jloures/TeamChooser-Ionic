var utils = require('../utils.js');

module.exports = function(
  $scope,
  $ionicPopup,
  $ionicPopover,
  $ionicModal,
  $ionicListDelegate,
  $stateParams,
  PlayersManager,
  GamesManager
) {

    //remove this once you get these from the server
    $scope.playerId = 0;
    $scope.lastPlayerAdded = null;
    $scope.players = PlayersManager.all();
    if( $stateParams.playerId != null ) {
        $scope.currentPlayer = PlayersManager.get($stateParams.playerId);
    } else {
        $scope.currentPlayer = {};
    }
    $scope.gameInstance = GamesManager.get($stateParams.gameId);

    //go back to the players list page
    $scope.closeCreateOrEditPage = function() {
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
            //make api call here
            playerObject.id = ++$scope.playerId;
            PlayersManager.add(playerObject);
        } else {
            //make an api call here
            PlayersManager.edit(playerObject);
        }
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