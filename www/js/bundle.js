(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
angular.module('ionicApp', ['ionic', 'ionicApp.controllers', 'ionicApp.services'])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  //this is the route for our login
  .state('login', {
    url: '/',
    cache: false,
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('gameslist', {
    url: '/:userId/gameslist',
    cache: false,
    templateUrl: 'templates/gameslist.html',
    controller: 'GamesList'
  })
  .state('playerslist', {
    url: '/:userId/gameslist/:gameId/playerslist',
    cache: false,
    templateUrl: 'templates/playerslist.html',
    controller: 'PlayersList'
  })
  .state('teamlist', {
    url: '/:userId/gameslist/:gameId/teamlist',
    cache: false,
    templateUrl: 'templates/teamlist.html',
    controller: 'TeamList'
  })
  .state('createoreditgame', {
    url: '/:userId/createoreditgame/:gameId',
    cache: false,
    templateUrl: 'templates/createoreditgame.html',
    controller: 'CreateOrEditGame'
  })
  .state('createoreditplayer', {
    url: '/:userId/:gameId/createoreditplayer/:playerId',
    cache: false,
    templateUrl: 'templates/createoreditplayer.html',
    controller: 'CreateOrEditPlayer'
  })
  .state('signup', {
    url: '/signup',
    cache: false,
    templateUrl: 'templates/signup.html',
    controller: 'SignUpCtrl'
  })
  .state('passrecovery', {
    url: '/passrecovery',
    cache: false,
    templateUrl: 'templates/passrecovery.html',
    controller: 'PassRecoveryCtrl'
  })
  $urlRouterProvider.otherwise('/');
});


},{}],2:[function(require,module,exports){
module.exports = {
    endpoint: ""
}

},{}],3:[function(require,module,exports){
angular.module('ionicApp.controllers', [])
//controllers
.controller('CreateOrEditGame', require('./controllers/createoreditgame.js'))
.controller('CreateOrEditPlayer', require('./controllers/createoreditplayer.js'))
.controller('GamesList', require('./controllers/gameslist.js'))
.controller('LoginCtrl', require('./controllers/login.js'))
.controller('PassRecoveryCtrl', require('./controllers/passrecovery.js'))
.controller('PlayersList', require('./controllers/playerslist.js'))
.controller('SignUpCtrl', require('./controllers/signup.js'))
.controller('TeamList', require('./controllers/teamlist.js'))

},{"./controllers/createoreditgame.js":4,"./controllers/createoreditplayer.js":5,"./controllers/gameslist.js":6,"./controllers/login.js":7,"./controllers/passrecovery.js":8,"./controllers/playerslist.js":9,"./controllers/signup.js":10,"./controllers/teamlist.js":11}],4:[function(require,module,exports){
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

    $scope.currentGameInstance = utils.defaultGame();
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
        var newInstance = utils.clone($scope.currentGameInstance);
        if( erroCheckingGame(newInstance, $ionicPopup, GamesManager.all()) < 0 ) {
            return;
        }
        //make api call here to duplicate
        utils.showLoading("Duplicating Game...", $ionicLoading);
        //will need to change this once you have the players too
        $http.post(
            // /:userId/duplicategame POST returns id (gamesInstance.id)
            config.endpoint + '/' + $stateParams.userId + '/duplicategame',
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
                config.endpoint + '/' + $stateParams.userId + '/' + gameInstance.id + '/updategame',
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

},{"../config.js":2,"../utils.js":15}],5:[function(require,module,exports){
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
                config.endpoint + '/' + $stateParams.userId + '/' + $stateParams.gameId + '/' + playerObject.id + '/updateplayer',
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

    if( player.position !== 'Defense' && player.position !== 'Offense' ) {
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
},{"../config.js":2,"../utils.js":15}],6:[function(require,module,exports){
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

},{"../config.js":2,"../utils.js":15}],7:[function(require,module,exports){
//dependencies
var config = require('../config.js');
var utils = require('../utils.js');

module.exports = function($scope, $state, $ionicPopup, $http, $ionicLoading, GamesManager) {
    
    $scope.goToSignUp = function() {
        $state.go('signup');
    }

    $scope.goToRecovery = function() {
        $state.go('passrecovery');
    }

    $scope.login = function() {
        // start the loading page
        utils.showLoading("Signing In...", $ionicLoading);
        var data = parseLoginInfo($scope);
        if( errorCheckingLogin(data) < 0 ) {
            utils.hideLoading($ionicLoading);
            $ionicPopup.alert({
                title: 'Error',
                template: 'One or more fields are incorrect'
            });
            return;
        }
        $http.post(
            config.endpoint + '/login',
            data
        ).then(function(res){
            //hide the loading 
            utils.hideLoading($ionicLoading);
            //call the service here to set gameInstances
            GamesManager.set(res.data.allGames);
            //userId should come from response
            $state.go('gameslist', {userId: res.data.userId});
        }, function(err){
            utils.hideLoading($ionicLoading);
            $ionicPopup.alert({
                title: 'Error',
                template: err.data
            });
        });
    }
}

var parseLoginInfo = function($scope) {
    return {
        username: $scope.login.username,
        passwd: $scope.login.passwd
    };
}

var errorCheckingLogin = function(data) {
   if( data.username === undefined || data.username === "" || data.username === null ) {
       return -1;
   }
   if( data.passwd === undefined || data.passwd === "" || data.passwd === null ) {
       return -1;
   }
   return 0;
}
},{"../config.js":2,"../utils.js":15}],8:[function(require,module,exports){
var config = require('../config.js');

module.exports = function($scope, $ionicPopup, $http, $state) {
    $scope.recovery = {};
    $scope.returnToLoginPage = function() {
        $state.go('login');
    }
    $scope.submitPasswordRecovery = function() {
        var email = $scope.recovery.email;
        var data = {
            email: email
        };
        if( parseEmail(email) < 0 ) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Not a valid email'
            });
            return;
        }
        $http.post(
            config.endpoint + '/recovery', 
            data
        ).then(function(res){
            $state.go('login');
        }, function(err){
            $ionicPopup.alert({
                title: 'Error',
                template: err.data
            });
        });
    }
}

var parseEmail = function(email) {
    if( email === undefined ) {
        return -1;
    }
    var indexOfAtSymbol = email.indexOf("@");
    if( indexOfAtSymbol < 1 ) {
        return -1;
    }
    var indexOfPeriod = email.substring(indexOfAtSymbol+1).indexOf(".");
    if( indexOfPeriod < 1 ) {
        return -1;
    }
    if( email.substring(indexOfAtSymbol+1).substring(indexOfPeriod) === "") {
        return -1;
    }
    return 0;
}
},{"../config.js":2}],9:[function(require,module,exports){
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
  PlayersManager,
  GamesManager
) {

    $scope.players = PlayersManager.all();
    $scope.gameName = GamesManager.get($stateParams.gameId).gameName;
    $scope.lastPlayerAdded = null;
    $scope.selectedPlayers = 0;
    $scope.defensePlayers = 0;
    $scope.offensePlayers = 0;

    //register what the popover should contain ( what html page it should display )
    $ionicPopover.fromTemplateUrl('templates/playerlistactions.html', {
        scope: $scope
    }).then(function(playerlistactions) {
        $scope.playerlistactions = playerlistactions;
    });

    $scope.showTeamList = function() {
        //will need to change this once assignment 
        //gets proper
        //MILESTONE 6
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
                if( players[i].position === 'Offense' ) {
                    $scope.offensePlayers++;
                } else if( players[i].position === 'Defense' ) {
                    $scope.defensePlayers++;
                }
            }
        }
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
        $scope.recalculatePlayerTypes();
        $ionicListDelegate.closeOptionButtons();
    }
}

},{"../config.js":2,"../utils.js":15}],10:[function(require,module,exports){
//dependencies
var config = require('../config.js');
var utils = require('../utils.js');

module.exports = function($scope, $http, $state, $ionicPopup, $ionicLoading) {
    $scope.signup = {};

    $scope.returnToLoginPage = function() {
        $state.go('login');
    }
    $scope.createNewUser = function() {
        utils.showLoading("Adding new user...", $ionicLoading);
        var data = parseSignUpInfo($scope);
        if( errorCheckingSignUp(data) < 0 ) {
            utils.hideLoading($ionicLoading);
            $ionicPopup.alert({
                title: 'Error',
                template: 'One or more fields are incorrect'
            });
            return;
        } 
        $http.post(
            config.endpoint + '/signup', 
            data
        ).then(function(res){
            utils.hideLoading($ionicLoading);
            $state.go('login');
        }, function(err){
            utils.hideLoading($ionicLoading);
            $ionicPopup.alert({
                title: 'Error',
                template: err.data
            });
        });
    }
}

var parseSignUpInfo = function($scope) {
    return {
        username: $scope.signup.username,
        displayname: $scope.signup.displayname,
        passwd: $scope.signup.passwd,
        email: $scope.signup.email
    };
}

var errorCheckingSignUp = function(data) {
   if( data.username === undefined || data.username === "" || data.username === null ) {
       return -1;
   }
   if( data.displayname === undefined || data.displayname === "" || data.displayname === null ) {
       return -1;
   }
   if( data.passwd === undefined || data.passwd === "" || data.passwd === null ) {
       return -1;
   }
   if( data.email === undefined || data.email === "" || data.email === null ) {
       return -1;
   }
   if( parseEmail(data.email) < 0 ) {
       return -1;
   }
   return 0;
}

var parseEmail = function(email) {
    if( email === undefined ) {
        return -1;
    }
    var indexOfAtSymbol = email.indexOf("@");
    if( indexOfAtSymbol < 1 ) {
        return -1;
    }
    var indexOfPeriod = email.substring(indexOfAtSymbol+1).indexOf(".");
    if( indexOfPeriod < 1 ) {
        return -1;
    }
    if( email.substring(indexOfAtSymbol+1).substring(indexOfPeriod) === "") {
        return -1;
    }
    return 0;
}
},{"../config.js":2,"../utils.js":15}],11:[function(require,module,exports){

},{}],12:[function(require,module,exports){
angular.module('ionicApp.services', [])
//data providers
.factory('GamesManager', require('./services/gamesmanager.js'))
.factory('PlayersManager', require('./services/playersmanager.js'))
},{"./services/gamesmanager.js":13,"./services/playersmanager.js":14}],13:[function(require,module,exports){
module.exports = function() {
    var games = [];
    var currentGame = {};

    return {
        set: function(allGames) {
            games = allGames;
        },
        all: function() {
            return games;
        },
        add: function(newGame) {
            games.push(newGame);
        },
        get: function(gameId) {
            for(var i = 0; i < games.length; i++) {
                if( games[i].id == gameId ) {
                    return games[i];
                }
            }
            return null;
        },
        remove: function(gameId) {
            for(var i = 0; i < games.length; i++) {
                if(games[i].id == gameId) {
                    games.splice(i, 1);
                    return;
                }
            }
        },
        edit: function(newGame) {
            for(var i = 0; i < games.length; i++) {
                if( games[i].id == newGame.id ) {
                    games[i] = newGame;
                    return;
                }
            }
        },
        setCurrent: function(curr) {
            currentGame = curr;
        },
        getCurrent: function() {
            return currentGame;
        }
    }
}
},{}],14:[function(require,module,exports){
module.exports = function() {
    var players = [];

    return {
        set: function(allPlayers) {
            players = allPlayers;
        },
        all: function() {
            return players;
        },
        add: function(newPlayer) {
            players.push(newPlayer);
        },
        get: function(playerId) {
            for(var i = 0; i < players.length; i++) {
                if( players[i].id == playerId ) {
                    return players[i];
                }
            }
            return null;
        },
        remove: function(playerId) {
            for(var i = 0; i < players.length; i++) {
                if(players[i].id == playerId) {
                    players.splice(i, 1);
                    return;
                }
            }
        },
        edit: function(newPlayer) {
            for(var i = 0; i < players.length; i++) {
                if( players[i].id == newPlayer.id ) {
                    players[i] = newPlayer;
                    return;
                }
            }
        }
    }
}
},{}],15:[function(require,module,exports){
module.exports = {
    showLoading: function(message, $ionicLoading) {
        $ionicLoading.show({
            template: message
        });
    },

    hideLoading: function($ionicLoading) {
        $ionicLoading.hide();
    },
    clone: function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = {};
        if( obj.length !== undefined ) {
            var arrayCopy = [];
            for(var i = 0; i < obj.length; i++) {
                var objInArray = obj[i];
                if( objInArray.length !== undefined ) {
                arrayCopy[i] = clone(objInArray);
                } else {
                copy = {};
                for (var attr in objInArray) {
                    if (objInArray.hasOwnProperty(attr)) {
                        copy[attr] = clone(objInArray[attr]);
                    }
                }
                arrayCopy[i] = copy;
                }
            }
            return arrayCopy;
        } else {
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    copy[attr] = clone(obj[attr]);
                }
            }
        }
        return copy;
    },
    findIndex: function(array,object) {
        for(var i = 0; i < array.length; i++) {
            if( array[i].id === object.id ) {
                return i;
            }
        }
        return -1;
    },
    defaultGame: function(){
        return this.clone({teamA:{name:"Light"},teamB:{name:"Dark"}});
    }
};
},{}]},{},[3,12,1]);
