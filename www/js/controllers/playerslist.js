var utils = require('../utils.js');

module.exports = function(
  $scope,
  $state,
  $ionicPopup,
  $ionicPopover,
  $ionicLoading,
  $ionicModal,
  $ionicListDelegate,
  $stateParams,
  PlayersManager,
  GamesManager
) {

    $scope.players = PlayersManager.all();
    $scope.gameName = GamesManager.get($stateParams.gameId).gameName;
    $scope.lastPlayerAdded = null;
    $scope.selectedPlayers = 0;
    $scope.defensePlayers = null;
    $scope.offensePlayers = null;

    //register what the popover should contain ( what html page it should display )
    $ionicPopover.fromTemplateUrl('templates/playerlistactions.html', {
        scope: $scope
    }).then(function(playerlistactions) {
        $scope.playerlistactions = playerlistactions;
    });

    $scope.showTeamList = function() {
        //will need to change this once assignment 
        //gets proper
        $state.go(
            'teamlist', 
            { 
                userId: $stateParams.userId, 
                gameId: $stateParams.gameId
            }
        );
    }

    //return to gameslist
    $scope.returnToGameList = function() {
        $state.go('gameslist', { userId: $stateParams.userId });
    }

    //open and close popover
    $scope.openPlayerListActions = function($event) {
        $scope.playerlistactions.show($event);
    };
    $scope.closePlayerListActions = function() {
        $scope.playerlistactions.hide();
    };

    //player data manipulation
    $scope.addPlayer = function() {
        $state.go(
            'createoreditplayer',
            {
                userId: $stateParams.userId,
                playerId: null //new player
            }
        )
    }

    $scope.editPlayer = function(player) {
        //just go to createoreditplayer with a known player Id
        $state.go(
            'createoreditplayer',
            {
                userId: $stateParams.userId,
                playerId: player.id
            }
        )
    }

    $scope.deletePlayer = function(player) {
        var playerIndex = utils.findIndex($scope.players,player);
        if( playerIndex === -1 ) {
            return;
        }
        var players = $scope.currentGameInstance.players;
        if( player.isSelected ) {
            $scope.currentGameInstance.selectedPlayers--;
        }
        players.splice(playerIndex, 1);
        if( players.length !== 0 ) {
            $scope.lastPlayerAdded = players[players.length -1];
        } else {
            $scope.currentGameInstance.lastPlayerAdded = null;
        }
        $scope.recalculatePlayerTypes();
        $ionicListDelegate.closeOptionButtons();
    }

    $scope.setIsSelectedBoolean = function(booleanValue) {
        var players = $scope.players;
        for( var i = 0; i < players.length; i++ ) {
            var player = players[i];
            if( player.isSelected !== booleanValue ) {
                $scope.toggleSelection(player);
            }
        }
        $scope.playerlistactions.hide();
    }

    $scope.toggleSelection = function(player) {
        player.isSelected = !player.isSelected;
        $scope.selectedPlayers += player.isSelected ? 1 : -1;
        $scope.recalculatePlayerTypes();
    }

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

    $scope.recalculatePlayerTypes = function() {
        var players = $scope.currentGameInstance.players;
        $scope.currentGameInstance.offensePlayers = 0;
        $scope.currentGameInstance.defensePlayers = 0;
        for(var i = 0; i < players.length; i++) {
            if( players[i].isSelected ) {
                if( players[i].type === 'Offense' ) {
                    $scope.currentGameInstance.offensePlayers++;
                } else if( players[i].type === 'Defense' ) {
                    $scope.currentGameInstance.defensePlayers++;
                }
            }
        }
    }
}
