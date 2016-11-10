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