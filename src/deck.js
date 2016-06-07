"use strict";

module.exports = function(cards, isStatic){
    var self = this;

    self = {
        isStatic: isStatic || false,
        pile: cards || [],

        push: function(card){
            self.pile.push(card);
        },

        draw: function(){
            this.push(self.pile.pop());
        }
    };

    return self;//todo: honor isStatic with object.freeze
};