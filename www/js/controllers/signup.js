//dependencies
var config = require('../config.js');

module.exports = function($scope, $http, $state, $ionicPopup) {
    $scope.signup = {};

    $scope.returnToLoginPage = function() {
        $state.go('login');
    }
    $scope.createNewUser = function() {
        var data = parseSignUpInfo($scope);
        if( errorCheckingSignUp(data) < 0 ) {
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
            console.log(res)
            $state.go('login');
        }, function(err){
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