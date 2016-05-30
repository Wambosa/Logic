"use strict";

var t = require(`${root}/src/tool`);
var _ = require('ramda');

const guard = 1;
const priest = 2;
const baron = 4;
const handmaiden = 8;
const prince = 16;
const king = 32;
const countess = 64;
const princess = 128;

module.exports = {
    configure: function (gameState, players) {

        let player = _.curry(t.find)(players, null);
        let stateOf = _.curry(t.find)(gameState, null);
        let findMe = _.curry(t.find)(players, 'isTurn');

        return {

            accuse: function (thought) {

                let me = findMe(true);
                let target = player(thought.target);
                let speculation = me.peek[target.uuid] || stateOf(thought.target).m[1][1];

                let illegal = speculation & guard; //rule: cannot accuse another guard

                if (illegal)
                    return false;

                target.inPlay = speculation & t.toMask(target.hand);

                //todo:convert to endTurn here?
                for (var i = 0; i < me.hand.length; i++) {
                    if (me.hand[i].perk === thought.action) {

                        //this can only work because player only ever have one card in their hands
                        //todo: additionally, i just realized that i have no factor that accounts for other players knowing what my hand is.
                        players.forEach(function (player) {
                            let publicKnown = player.peek[me.uuid];
                            player.peek[me.uuid] = publicKnown === me.hand[i].mask ? null : publicKnown;
                        });

                        return me.hand.splice(i, 1);
                    }
                }
                throw new Error(`Accuse action was considered valid, yet no guard card exists in player ${me.uuid}.hand ${me.hand}`);
            },

            spy: function (thought) {
                //todo: reveal card to current player
                let me = players.find(function (p) {
                    return p.isTurn;
                });
                let target = players[tar.index];
                me.peek[target.uuid] = target.hand; //todo: toMask && init the peek object on players

                return target.hand;//todo: toMask
            },
            debate: function (gameState, tar) {
                //compare the highest card. hig card wins. low card loses
            },
            protect: function (gameState, tar) {
                //trigger isImmune Flag on player
            },
            policy: function (gameState, tar) {
                //make target discard
                //for now, check for princess card. later, each card will have a event/discard handler
            },
            mandate: function (gameState, tar) {
                // switch cards with target
                // move your hand to temp
                // set me.hand to target.hand
                // set me.peek to temp
                // set target.hand to temp
            },
            subvert: function (gameState, tar) {
                //this one requires an event handler of sorts?
                // maybe this card flags the others as unplayable so that the users is simply forced to play this
                // i dont want to "auto" play this card. otherwise, the lack of delay is telling
            },
            favor: function (gameState, tar) {
                // oddly enough. just makes the user lose.
                // if this card is played, then set me.inPlay = false
            }
        };
    }
};