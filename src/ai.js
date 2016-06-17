"use strict";
var root = process.cwd();
var math = require('mathjs');
var t = require(`${root}/src/tool`);

module.exports = {
    speculate: function (deck, discard, hand) {

        let possible = t.simplify(deck);

        let known = t.simplify(hand.concat(discard));

        known.forEach(function(k){
            possible.splice(possible.indexOf(k), 1);
        });

        let guess = t.random(possible.length-1);

        return possible[guess];
    },

    computeRisk: function (target, action){
        target = math.matrix(target);
        action = math.matrix(action);
        let ignorables = math.and(math.ceil(target), math.ceil(action));
        target = math.dotMultiply(target, ignorables);

        //there are 3 ish steps here
        let w = math.index(0, [0,1]); // difference the wins
        let c = math.index(1, [0,1]); // hamming weight card expectation
        let n = math.index(2, [0,1]); // difference the counts

        let risk = 10; //inherent risk
        risk += math.sum(math.abs(math.subtract(target.subset(w), action.subset(w))));
        risk += math.sum(math.abs(math.subtract(target.subset(n), action.subset(n))));

        // i actually want to do hamming weight for more complex games.
        // The hamming weight can only ever be 1 or 0 for this game.
        // the preferred card decreases risk instead of increasing it.

        let bitAnd = math.bitAnd(target.subset(c), action.subset(c))._data[0];
        //todo: hamming weight * impact (currently -2)
        risk += bitAnd[0] && -2;
        risk += bitAnd[1] && -2;

        return risk;
    },

    think: function (targets, choices) {
        var self = this;
        var actions = [];

        choices.forEach(function(c){
            targets.filter(function(tar){
                return !tar.isImmune && tar.t & c.t && tar.inPlay; //todo: write test for only targeting inPlay
            }).forEach(function(tar){
                actions.push({
                    risk: self.computeRisk(tar.m, c.m),
                    target: tar.uuid,
                    action: c.uuid
                });
            });
        });

        return actions.sort(function(a, b){
            return a.risk > b.risk;
        });
    }
};

