"use strict";

var t = require('./tool');

var shuffle = t.shuffle;

module.exports = function(cards){
    let self = this;

    self = {
        originals: Object.freeze(cards.slice(0)),
        pile: cards || [],
        discarded: [],
        banished: [],

        //todo: change to top and bottom where top adds to the end of the array (push)
        top: function(card){
            self.pile.push(card);
        },

        //todo: multidraw support
        draw: function(){
            return self.pile.pop() || self.banished.pop();
        },
        
        discard: function(c){
            
            if(typeof c == "number" && self.pile.length){
                for(let i=0; i<c; ++i)
                    self.discarded.push(self.pile.pop());
                return 1;
            }
            
            if(typeof c == "object" && !c.length){
                self.discarded.push(c);
                return 2;
            }
            
            return 0;
        },
        
        banish: function(count){
            for(let i=0; i<count; ++i)
                self.banished.push(self.pile.pop());
        },
        
        history: function(playerUuid, isOpposite){
            
            let isMine = function(card){
                return !playerUuid || card.user === playerUuid;
            };
            
            let isNotMine = function(card){
                return card.user !== playerUuid;
            }
            
            return self.discarded.filter(isOpposite && isNotMine || isMine);
        },

        reset: function(){
            self.pile = shuffle(self.originals);
            self.discarded = [];
            self.banished = [];
        }
    };

    return self;
};