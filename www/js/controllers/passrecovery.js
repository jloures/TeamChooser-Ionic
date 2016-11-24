var config = require('../config.js');

module.exports = function(
    $scope,
    $ionicPopup,
    $http,
    $state,
    $ionicPlatform
) {

    $ionicPlatform.registerBackButtonAction(function (event) {
            event.preventDefault();
    }, 100);
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