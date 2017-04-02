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
  $ionicPlatform,
  PlayersManager,
  GamesManager
) {

    $ionicPlatform.registerBackButtonAction(function (event) {
            event.preventDefault();
    }, 100);
    $scope.players = PlayersManager.all();
    $scope.gameName = GamesManager.get($stateParams.gameId).gameName;
    $scope.lastPlayerAdded = null;
    $scope.selectedPlayers = 0;
    $scope.updateRating = $stateParams.updateRating == true;

    //register what the popover should contain ( what html page it should display )
    $ionicPopover.fromTemplateUrl('templates/playerlistactions.html', {
        scope: $scope
    }).then(function(playerlistactions) {
        $scope.playerlistactions = playerlistactions;
    });

    $scope.showTeamList = function() {
        //check if you have more than 1 player selected
        if( $scope.selectedPlayers < 2 ) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'More than 1 player needed to make teams'
            });
            return;
        }
        $scope.closePlayerListActions();
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
        // start the loading page
        utils.showLoading("Syncing...", $ionicLoading);
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

    //open and close popover
    $scope.openPlayerListActions = function($event) {
        $scope.playerlistactions.show($event);
    };
    $scope.closePlayerListActions = function() {
        $scope.playerlistactions.hide();
    };

    //player data manipulation
    $scope.addPlayer = function() {
        $scope.closePlayerListActions();
        $state.go(
            'createoreditplayer',
            {
                userId: $stateParams.userId,
                playerId: "-1", //new player
                gameId: $stateParams.gameId
            }
        )
    }

    $scope.editPlayer = function(player) {
        //just go to createoreditplayer with a known player Id
        $state.go(
            'createoreditplayer',
            {
                userId: $stateParams.userId,
                playerId: player.id, 
                gameId: $stateParams.gameId
            }
        )
    }

    $scope.updateRatings = function() {
        $scope.closePlayerListActions();
        utils.showLoading("Updating Ratings...", $ionicLoading);
        var updatePlayers = $scope.players.filter(function(player){
            return player.isSelected;
        }).map(function(player){
            player.rating = player.newRating;
            return player;
        });

        if( updatePlayers.length === 0 ) {
            utils.hideLoading($ionicLoading);
            $scope.refresh();  
        }

        setAllPlayersSelectState(false);

        $http.put(
            config.endpoint + '/' + $stateParams.userId + '/' + $stateParams.gameId + '/updateallplayers',
            {
                allPlayers: updatePlayers
            }       
        ).then(function(res){
            $scope.refresh();
        }, function(err){
            $ionicPopup.alert({
                title: 'Error',
                template: err.data
            });
        }).finally(function(){
            utils.hideLoading($ionicLoading);
        });
    }

    $scope.refresh = function() {
        //make api call here to get all players in the game
        //start the loading page
        utils.showLoading("Loading Players...", $ionicLoading);
        //API to get all games
        $http.get(
            // :userId/:gameId/allplayers GET
            config.endpoint + '/' + $stateParams.userId + '/' + $stateParams.gameId + '/allplayers'
        ).then(function(res){
            //set all game instances
            PlayersManager.set(res.data.allPlayers);
            $state.go(
                'playerslist', 
                {
                    userId: $stateParams.userId,
                    gameId: $stateParams.gameId,
                    updateRating: false
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

    $scope.deletePlayer = function(player) {
        //make api call here for deleting player
        utils.showLoading("Deleting Player...", $ionicLoading);
        $http.delete(
        // /:userId/:gameId/:playerId DEL
        config.endpoint + '/' + $stateParams.userId + '/' + $stateParams.gameId + '/' + player.id + '/deleteplayer'
        ).then(function(res){
            deletePlayer(player);
        },function(err){
            $ionicPopup.alert({
                title: 'Error',
                template: err.data
            });
        }).finally(function(){
            utils.hideLoading($ionicLoading);
        });
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

    $scope.setIsSelectedBoolean(false);

    $scope.toggleSelection = function(player) {
        player.isSelected = !player.isSelected;
        $scope.selectedPlayers += player.isSelected ? 1 : -1;
    }

    //make sure that our popover closes
    $scope.$on('$ionicView.leave', function(){
        $scope.closePlayerListActions();
    });

    var deletePlayer = function(player) {
        var playerIndex = utils.findIndex($scope.players,player);
        if( playerIndex === -1 ) {
            return;
        }
        var players = $scope.players;
        if( player.isSelected ) {
            $scope.selectedPlayers--;
        }
        players.splice(playerIndex, 1);
        if( players.length !== 0 ) {
            $scope.lastPlayerAdded = players[players.length -1];
        } else {
            $scope.lastPlayerAdded = null;
        }
        $ionicListDelegate.closeOptionButtons();
    }
}
