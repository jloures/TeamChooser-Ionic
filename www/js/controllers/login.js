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