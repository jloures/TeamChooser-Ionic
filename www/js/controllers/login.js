//dependencies
var request = require('superagent');

module.exports = function($scope, $state, $ionicPopup, $http) {
    
    $scope.goToSignUp = function() {
        $state.go('signup');
    }

    $scope.goToRecovery = function() {
        $state.go('passrecovery');
    }

    $scope.login = function() {
        var data = parseLoginInfo($scope);
        if( errorCheckingLogin(data) < 0 ) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'One or more fields are incorrect'
            });
            return;
        }
        $http.post(
            '/login',
            data
        ).then(function(res){
            //call the service here to set gameInstances
            //userId should come from response
            console.log(res);
            $state.go('gameslist', {userId: 0});
        }, function(err){
            $ionicPopup.alert({
                title: 'Error',
                template: 'CUSTOM MESSAGE HERE'
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