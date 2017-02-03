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

        push: function(card){
            self.pile.push(card);
        },

        draw: function(){
            return self.pile.pop() || self.banished.pop(); //because policy can trigger a card draw on the last turn
        },
        
        discard: function(count){
            for(let i=0; i<count; ++i)
                self.discarded.push(self.pile.pop());
        },
        
        banish: function(count){
            for(let i=0; i<count; ++i)
                self.banished.push(self.pile.pop());
        },
        
        reset: function(){
            self.pile = shuffle(self.originals);
            self.discarded = [];
            self.banished = [];
        }
    };

    return self;//todo: honor isStatic with object.freeze
};