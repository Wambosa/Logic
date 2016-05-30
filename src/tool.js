"use strict";

module.exports = {

    random: function (upper, lower) {
        upper++;
        lower = lower || 0;
        return Math.floor((Math.random() * (upper - lower)) + lower);
    },

    simplify: function(list, field_){
        let field = field_ || 'mask';
        return list.map(function(i){
            return i[field];
        });
    },

    dedup: function (list, property_) {
        let prop = property_ || 'mask';
        return list.slice(0).sort(function(a, b){
            return a[prop] > b[prop];
        }).filter(function (item, pos, ary) {
            return !pos || item[prop] != ary[pos - 1][prop];
        });
    },

    toMask: function(list, field_){
        let field = field_ || 'mask';
        return this.dedup(list).reduce(function(prev, cur){
            return prev[field] + cur[field];
        });
    },

    toMind: function(hand, ideals){
        return hand.map(function(card){
            let i = ideals[card.perk];
            return {
                uuid: card.perk,
                t: i.t,
                m: i.m
            };
        });
    },

    shuffle: function (list_) {
        let list = list_.splice(0);
        let count = list.length;
        let swap = 0;

        for (let i = count-1; i > -1; i--) {
            swap = this.random(i);
            list[i] = list.splice(swap, 1, list[i])[0];
        }

        return list;
    }
};