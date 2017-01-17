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
  $scope.currentGameInstance = GamesManager.getCurrent();
  var players = utils.clone(PlayersManager.all()).filter(function(player){
    return player.isSelected;
  });
  //make teams
  var makeTeams = function() {
    //check if number of players is even or odd
    var middlePlayer = null;
    players.sort(function(a,b){
      return parseFloat(b.rating) - parseFloat(a.rating);
    })
    if( (players.length % 2) === 1 ) {
      var playerIndex = players.length/2 - 0.5
      middlePlayer = players[playerIndex];
      players.splice(playerIndex, 1);
    }
    //assign players to teams
    $scope.currentGameInstance.teamA.players = [];
    $scope.currentGameInstance.teamB.players = [];
    var teamA = {
      players: $scope.currentGameInstance.teamA.players,
      sum: 0
    };
    var teamB = {
      players: $scope.currentGameInstance.teamB.players,
      sum: 0
    };

    teamA.players.push(players[0]);
    for(var i = 1; i < players.length; i++) {
      addPlayer(teamB,i,players);
      i++;
      addPlayer(teamB,i,players);
      i++;
      addPlayer(teamA,i,players);
      i++;
      addPlayer(teamA,i,players);
    }
    if(middlePlayer != null) {
      if( teamA.sum/teamA.players.length > teamB.sum/teamB.players.length ) {
        teamB.players.push(middlePlayer);
      } else {
        teamA.players.push(middlePlayer);
      }
    }
  }

  $scope.saveScore = function() {
    //check if scores are valid
    var scoreA = this.scoreA;
    if( !parseRating(scoreA) || (scoreA % 1 != 0) ) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Score must be an integer'
      });
      return;
    }
    var scoreB = this.scoreB;
    if( !parseRating(scoreB) || (scoreB % 1 != 0) ) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Score must be an integer'
      });
      return;
    }
    //valid scores were entered
    //make api call
    utils.showLoading("Saving Scores...", $ionicLoading);
    var data = [];
    var teamA = $scope.currentGameInstance.teamA.players;
    var teamB = $scope.currentGameInstance.teamB.players;
    for(var j = 0; j < teamA.length; j++) {
      var player = teamA[j];
      player.score = this.scoreA;
      data.push(player);
    }
    for(var k = 0; k < teamB.length; k++) {
      var player = teamB[k];
      player.score = this.scoreB;
      data.push(player);
    }
    $http.post(
        config.endpoint + '/' + $stateParams.userId + '/' + $stateParams.gameId + '/match',
        data
    ).then(function(res){
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

  $scope.cancel = function() {
    $state.go('gameslist', {userId: $stateParams.userId});
  }
  makeTeams();
}

var parseRating = function(possibleNumber) {
    var floatVar = parseFloat(possibleNumber);
    return !isNaN(possibleNumber) && floatVar >= 0 && floatVar <=10 ? floatVar.toFixed(2) : null;
}

var addPlayer = function(team,index,players) {
  if(players[index] == undefined) {
    return;
  }
  team.players.push(players[index]);
  team.sum += parseFloat(players[index].rating);
}