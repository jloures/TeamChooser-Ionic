module.exports = function() {
    var games = [];
    var curr = {};

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