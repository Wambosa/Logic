"use strict";

var tool = require('./tool');

var shuffle = tool.shuffle;

module.exports = function(cards, isStatic){
    let self = this;

    self = {
        isStatic: isStatic || false,
        originals: Object.freeze(cards.slice(0)),
        pile: cards || [],
        discarded: [],
        banished: [],

        //change to top and bottom where top adds to the end of the array (push)
        push: function(card){
            self.pile.push(card);
        },

        draw: function(){
            return self.pile.pop() || self.banished.pop(); //because policy can trigger a card draw on the last turn
        },
        
        discard: function(c){
            
            if(typeof c == "number"){
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

    return self;//todo: honor isStatic with object.freeze
};