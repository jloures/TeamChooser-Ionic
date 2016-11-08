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