"use strict";

module.exports = function Player(uuid, hand, ideals){
    var self = this;

    self = {
        name: uuid, //todo: uuid is stupid. just use name.... what was i thinking!
        uuid: uuid,
        inPlay: true,
        wins: 0,
        hand: hand || [],
        peek: {},
        ideals: ideals || {},

        push: function(card){
            self.hand.push(card);
        },
        
        purge: function(methodName){
            if(self[methodName])
                self.hand.forEach(function(){
                    self[methodName]();
                });
        },

        configure: function(actions){
            actions.forEach(function(a){
                self[a.name] = a.func.bind(self);
            });
            return self;
        }
    };

    return self;
};