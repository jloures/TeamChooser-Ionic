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
    url: '/:userId/createoreditgame',
    cache: false,
    templateUrl: 'templates/createoreditgame.html',
    controller: 'CreateOrEditGame'
  })
  .state('createoreditplayer', {
    url: '/:userId/createoreditplayer/:playerId',
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

/*
    endpoint/login POST with {username, passwd}
    endpoint/signup POST with {username, passwd, email, displayname}
    endpoint/recovery POST with {email}
*/ 
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

    $scope.currentGameInstance = {teamA:{name:"Light"},teamB:{name:"Dark"}};
    if( $stateParams.gameId != null ) {
        $scope.currentGameInstance = GamesManager.get($stateParams.gameId);
    }

    $scope.exitCreateOrEditGamePage = function() {
        // start the loading page
        utils.showLoading("Loading...", $ionicLoading);
        //API to get all games
        $http.get(
            config.endpoint + '/' + $stateParams.userId + '/allgames'
        ).then(function(res){
            console.log(res)
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
},{"../utils.js":15}],6:[function(require,module,exports){
var utils = require('../utils.js');
var config = require('../config.js');

module.exports = function(
  $http,
  $scope,
  $state,
  $ionicPopup,
  $ionicPopover,
  $ionicModal,
  $ionicListDelegate,
  $stateParams,
  GamesManager,
  PlayersManager
) {
  
  $scope.games = GamesManager.all();

  $scope.openPlayersList = function(game) {
    //make api call here to get all players in the game
    $http
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

},{"../utils.js":15}],10:[function(require,module,exports){
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
    }
};
},{}]},{},[1,3,12]);
