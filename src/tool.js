"use strict";

function random(upper, lower) {
    upper++;
    lower = lower || 0;
    return Math.floor((Math.random() * (upper - lower)) + lower);
}

function dedup(list, property_) {
    let prop = property_ || 'mask';
    return list.slice(0).sort(function(a, b){
        return a[prop] > b[prop];
    }).filter(function (item, pos, ary) {
        return !pos || item[prop] != ary[pos - 1][prop];
    });
}

function simplify(list, field_){
    let field = field_ || 'mask';
    return list.map(function(i){
        return i[field];
    });
}

module.exports = {

    random: random,

    simplify: simplify,

    dedup: dedup,

    toMask: function(list, field_){
        let field = field_ || 'mask';
        return simplify(dedup(list), field).reduce(function(prev, cur){
            return prev + cur;
        });
    },

    shuffle: function (list_) {
        let list = list_.slice(0);
        let count = list.length;
        let swap = 0;

        for (let i = count-1; i > -1; i--) {
            swap = random(i);
            list[i] = list.splice(swap, 1, list[i])[0];
        }

        return list;
    },

    toChoice: function(hand, ideals){
        return hand.map(function(card){
            let i = ideals[card.perk];
            return {
                uuid: card.perk,
                t: i.t,
                m: i.m
            };
        });
    },

    //todo: findAll? hmmm
    find: function (objList, property, key) {
        return objList.find(function (obj) {
            return obj[property] === key;
        });
    },
    
    //note: designed to work with player objects
    drawFrom: function(deck){
        return function(){
            if(!deck.pile.length)
                return false;
                
            this.hand.push(deck.draw());
            return true;
        };
    },

    //note: only supports a single card discard
    discardTo: function(deck) {
        return function(){
            if(this.hand.length) {
                this.hand[this.hand.length - 1].user = this.uuid;
                deck.discard(this.hand.pop());
            }
        };

    }
};