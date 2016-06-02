"use strict";

module.exports = function Player(uuid, hand){
    var self = this;

    self = {
        uuid: uuid,
        inPlay: true,
        hand: hand || [],
        peek: {},

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