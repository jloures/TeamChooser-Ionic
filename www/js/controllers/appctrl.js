module.exports = function(
  $scope,
  $ionicPopup,
  $ionicPopover,
  $ionicModal,
  $ionicListDelegate,
  $stateParams
) {
  
  $scope.games = [];
  $scope.currentGameInstance = {teamA:{name:"Light"},teamB:{name:"Dark"}};
  $scope.currentPlayer = {};
  $scope.numberOfgames = 0;
  $scope.playerId = 0;

  console.log($stateParams);

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

  /*$ionicModal.fromTemplateUrl('templates/instructions.html', {
    scope: $scope
  }).then(function(instructions) {
    $scope.instructions = instructions; 
  });*/
  
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
    $scope.currentPlayer = clone(player);
    $scope.currentGameInstance.lastPlayerAdded = null;
    $scope.createoreditplayer.show();
    $ionicListDelegate.closeOptionButtons();
  }

  $scope.deletePlayer = function(player) {
    var playerIndex = findIndex($scope.currentGameInstance.players,player);
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
      var index = findIndex($scope.currentGameInstance.players, playerObject);
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
    var gameIndex = findIndex($scope.games,game);
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
    $scope.currentGameInstance = clone(game);
    $scope.createoreditgame.show();
    $ionicListDelegate.closeOptionButtons();
  }

  $scope.duplicateGame = function() {
    var newInstance = clone($scope.currentGameInstance);
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
      var index = findIndex($scope.games,gameInstance);
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

var findIndex = function(array,object) {
  for(var i = 0; i < array.length; i++) {
    if( array[i].id === object.id ) {
      return i;
    }
  }
  return -1;
}

//common util
var clone = function clone(obj) {
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
}