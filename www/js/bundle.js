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
  .state('createoreditgame', {
    url: '/:userId/createoreditgame',
    cache: false,
    templateUrl: 'templates/createoreditgame.html',
    controller: 'CreateOrEditGame'
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
.controller('GamesList', require('./controllers/gameslist.js'))
.controller('LoginCtrl', require('./controllers/login.js'))
.controller('PassRecoveryCtrl', require('./controllers/passrecovery.js'))
.controller('SignUpCtrl', require('./controllers/signup.js'))

},{"./controllers/createoreditgame.js":4,"./controllers/gameslist.js":5,"./controllers/login.js":6,"./controllers/passrecovery.js":7,"./controllers/signup.js":8}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
var utils = require('../utils.js');

module.exports = function(
  $scope,
  $ionicPopup,
  $ionicPopover,
  $ionicModal,
  $ionicListDelegate,
  $stateParams,
  GamesManager
) {
  
  $scope.games = [];
  $scope.currentGameInstance = {teamA:{name:"Light"},teamB:{name:"Dark"}};
  $scope.currentPlayer = {};
  $scope.numberOfgames = 0;
  $scope.playerId = 0;

  $ionicPopover.fromTemplateUrl('templates/playerlistactions.html', {
    scope: $scope
  }).then(function(playerlistactions) {
    $scope.playerlistactions = playerlistactions;
  });

  $ionicModal.fromTemplateUrl('templates/createoreditgame.html', {
    scope: $scope
  }).then(function(createoreditgame) {
    $scope.createoreditgame = createoreditgame; 
  });
  
  $ionicModal.fromTemplateUrl('templates/createoreditplayer.html', {
    scope: $scope
  }).then(function(createoreditplayer) {
    $scope.createoreditplayer = createoreditplayer; 
  });

  $ionicModal.fromTemplateUrl('templates/gameslist.html', {
    scope: $scope
  }).then(function(gameslist) {
    $scope.gameslist = gameslist; 
  });

  $ionicModal.fromTemplateUrl('templates/playerslist.html', {
    scope: $scope
  }).then(function(playerslist) {
    $scope.playerslist = playerslist; 
  });

  $ionicModal.fromTemplateUrl('templates/teamlist.html', {
    scope: $scope
  }).then(function(teamlist) {
    $scope.teamlist = teamlist; 
  });

  $scope.showTeamList = function() {
    $scope.playerlistactions.hide();
    $scope.teamlist.show();
  }

  $scope.openPlayerListActions = function($event) {
    $scope.playerlistactions.show($event);
  };
  $scope.closePlayerListActions = function() {
    $scope.playerlistactions.hide();
  };

  $scope.openPlayersList = function(game) {
    $scope.currentGameInstance = game;
    $scope.playerslist.show();
  }

  $scope.setIsSelectedBoolean = function(booleanValue) {
    var players = $scope.currentGameInstance.players;
    for( var i = 0; i < players.length; i++ ) {
      var player = players[i];
      if( player.isSelected !== booleanValue ) {
        $scope.selectPlayer(player);
      }
    }
    $scope.playerlistactions.hide();
  }

  $scope.closeCreateOrEditPage = function() {
    $scope.currentGameInstance.lastPlayerAdded = null;
    $scope.currentPlayer = {};
    $scope.createoreditplayer.hide();
    $ionicListDelegate.closeOptionButtons();
  }

  $scope.selectPlayer = function(player) {
    player.isSelected = !player.isSelected;
    $scope.currentGameInstance.selectedPlayers += player.isSelected ? 1 : -1;
    $scope.recalculatePlayerTypes();
  }

  $scope.addPlayer = function() {
    $scope.playerlistactions.hide();
    $scope.currentGameInstance.lastPlayerAdded = null;
    $scope.createoreditplayer.show();
    $ionicListDelegate.closeOptionButtons();
  }

  $scope.editPlayer = function(player) {
    $scope.currentPlayer = utils.clone(player);
    $scope.currentGameInstance.lastPlayerAdded = null;
    $scope.createoreditplayer.show();
    $ionicListDelegate.closeOptionButtons();
  }

  $scope.deletePlayer = function(player) {
    var playerIndex = utils.findIndex($scope.currentGameInstance.players,player);
    if( playerIndex === -1 ) {
      return;
    }
    var players = $scope.currentGameInstance.players;
    if( player.isSelected ) {
      $scope.currentGameInstance.selectedPlayers--;
    }
    players.splice(playerIndex, 1);
    if( players.length !== 0 ) {
      $scope.currentGameInstance.lastPlayerAdded = players[players.length -1];
    } else {
      $scope.currentGameInstance.lastPlayerAdded = null;
    }
    $scope.currentPlayer = {};
    $scope.recalculatePlayerTypes();
    $ionicListDelegate.closeOptionButtons();
  }

  $scope.returnToGameList = function() {
    $scope.currentGameInstance = {teamA:{name:"Light"},teamB:{name:"Dark"}};
    $scope.playerslist.hide();
  }

  $scope.createOrEditPlayer = function() {
    var playerObject = $scope.currentPlayer;
    var isNewPlayer = playerObject.id === undefined;
    if( isNewPlayer ) {
      playerObject = $scope.currentPlayer;
      playerObject.isSelected = false;
    }
    if( errorCheckingPlayer(playerObject, $scope.currentGameInstance.players, $ionicPopup) < 0 ) {
      return;
    }
    //verify pre-assign
    playerObject.team = playerObject.preassign ? playerObject.team : null;
    if( isNewPlayer ) {
      playerObject.id = ++$scope.playerId;
      $scope.currentGameInstance.players.push(playerObject);
    } else {
      var index = utils.findIndex($scope.currentGameInstance.players, playerObject);
      $scope.currentGameInstance.players[index] = playerObject;
    }
    $scope.currentGameInstance.lastPlayerAdded = isNewPlayer ? playerObject : null;
    $scope.currentPlayer = {};
    if( !isNewPlayer ) {
      $scope.createoreditplayer.hide();
    }
    $scope.recalculatePlayerTypes();
  }

  $scope.deleteGame = function(game) {
    var gameIndex = utils.findIndex($scope.games,game);
    if( gameIndex === -1 ) {
      return;
    }
    $scope.games.splice(gameIndex, 1);
    $scope.currentGameInstance = {teamA:{name:"Light"},teamB:{name:"Dark"}};
    $ionicListDelegate.closeOptionButtons();
  }

  $scope.exitCreateOrEditGamePage = function() {
    $scope.currentGameInstance = {teamA:{name:"Light"},teamB:{name:"Dark"}};
    $scope.createoreditgame.hide();
  }

  $scope.editGame = function(game) {
    $scope.currentGameInstance = utils.clone(game);
    $scope.createoreditgame.show();
    $ionicListDelegate.closeOptionButtons();
  }

  $scope.duplicateGame = function() {
    var newInstance = utils.clone($scope.currentGameInstance);
    if( erroCheckingGame(newInstance, $ionicPopup, $scope.games) < 0 ) {
      return;
    }
    newInstance.id = $scope.numberOfgames++;
    $scope.games.push(newInstance);
    $scope.createoreditgame.hide();
    //set all properties to default
    $scope.currentGameInstance = {teamA:{name:"Light"},teamB:{name:"Dark"}};
  }

  $scope.createOrEditGame = function() {
    var gameInstance = $scope.currentGameInstance;
    var isNewGame = gameInstance.id === undefined;
    if( isNewGame ) {
      gameInstance = $scope.currentGameInstance;
    }
    //this is error checking
    if( erroCheckingGame(gameInstance, $ionicPopup, $scope.games) < 0 ) {
      return;
    }

    gameInstance.hasBODRatings = gameInstance.hasSuperOptimizer && gameInstance.hasBODRatings;
    if( isNewGame ) {
      gameInstance.id = ++$scope.numberOfgames;
      gameInstance.selectedPlayers = 0;
      gameInstance.players = [];
      gameInstance.offensePlayers = 0;
      gameInstance.defensePlayers = 0;
      gameInstance.lastPlayerAdded = null;
      $scope.games.push(gameInstance);
    } else {
      var index = utils.findIndex($scope.games,gameInstance);
      $scope.games[index] = gameInstance;
    }

    $scope.createoreditgame.hide();
    $scope.currentGameInstance = {teamA:{name:"Light"},teamB:{name:"Dark"}};;
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

//utils
var erroCheckingGame = function(game, $ionicPopup, games) {
  if( game.gameName === undefined || game.gameName.trim() === "" ) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Game Name has to be valid!'
      });
      return -1;
    }

  var hasFoundDuplicate = false;
  for(var i =0; i < games.length; i++) {
    if( games[i].gameName === game.gameName ) {
      hasFoundDuplicate = true;
      break;
    }
  }

  if( hasFoundDuplicate ) {
    $ionicPopup.alert({
      title: 'Error',
      template: 'Game with the same name already exists!'
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



},{"../utils.js":11}],6:[function(require,module,exports){
//dependencies
var config = require('../config.js');
var utils = require('../utils.js');

module.exports = function($scope, $state, $ionicPopup, $http, $ionicLoading) {
    
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
            //userId should come from response
            $state.go('gameslist', {userId: 0});
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
},{"../config.js":2,"../utils.js":11}],7:[function(require,module,exports){
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
},{"../config.js":2}],8:[function(require,module,exports){
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
},{"../config.js":2,"../utils.js":11}],9:[function(require,module,exports){
angular.module('ionicApp.services', [])
//data providers
.factory('GamesManager', require('./services/gamesmanager.js'))
},{"./services/gamesmanager.js":10}],10:[function(require,module,exports){
module.exports = function() {
    var games = [];

    return {
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
},{}],11:[function(require,module,exports){
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
},{}]},{},[1,3,9]);
