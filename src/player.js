"use strict";

module.exports = function Player(uuid, hand, ideals){
    var self = this;

    self = {
        uuid: uuid,
        inPlay: true,
        wins: 0,
        hand: hand || [],
        peek: {},
        ideals: ideals || {},

        push: function(card){
            self.hand.push(card);
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