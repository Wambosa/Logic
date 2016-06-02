"use strict";

var root = process.cwd();
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

function removePeek(players, uuid, cardMask){

    //this can only work because player only ever have one card in their hands
    //todo: additionally, i just realized that i have no factor that accounts for other players knowing what my hand is.
    players.forEach(function (player) {
        let known = player.peek[uuid];
        player.peek[uuid] = known & cardMask ? null : known;
    });

    return true;
}

function discard(hand, card){
    let index = t.simplify(hand).indexOf(card.mask);

    if(index === -1)
        throw new Error("FATAL: use.discard must NOT fail to remove a card from the hand.");

    return hand.splice(index, 1)[0];
}


module.exports = {
    configure: function (gameState, players) {

        let player = _.curry(t.find)(players, 'uuid');
        let stateOf = _.curry(t.find)(gameState, 'uuid');
        let findMe = _.curry(t.find)(players, 'isTurn');
        let unPeek = _.curry(removePeek)(players);

        return {

            accuse: function (thought) {

                let me = findMe(true);
                let target = player(thought.target);
                let speculation = me.peek[target.uuid] || stateOf(thought.target).m[1][1];

                //todo: instead of invalidating, either re-speculate or change guess to random (if this is the only option)
                let illegal = speculation & guard; //rule: cannot accuse another guard

                if (illegal)
                    return false;

                target.inPlay = !(speculation & t.toMask(target.hand));
                //target.discard

                let playedCard = t.find(me.hand, 'perk', thought.action);

                unPeek(me.uuid, playedCard.mask);

                return discard(me.hand, playedCard);
            },

            spy: function (thought) {

                let me = findMe(true);
                let target = player(thought.target);

                me.peek[target.uuid] = t.toMask(target.hand);

                let playedCard = t.find(me.hand, 'perk', thought.action);

                unPeek(me.uuid, playedCard.mask);

                return discard(me.hand, playedCard);
            },

            debate: function (thought) {

                let me = findMe(true);
                let target = player(thought.target);

                //rule: baron cannot participate directly. remove BEFORE comparison
                let playedCard = discard(me.hand, t.find(me.hand, 'perk', thought.action));

                //rule: a tie allows both players to live
                me.inPlay = t.toMask(me.hand) >= t.toMask(target.hand);
                target.inPlay = t.toMask(me.hand) <= t.toMask(target.hand);
                //target.discard

                unPeek(me.uuid, playedCard.mask);

                return playedCard;
            },

            protect: function (thought) {

                let me = findMe(true);

                //rule: can only target self for immunity
                me.isImmune = true;

                let playedCard = discard(me.hand, t.find(me.hand, 'perk', thought.action));

                unPeek(me.uuid, playedCard.mask);

                return playedCard;
            },

            policy: function (thought) {
                //make target discard
                //for now, check for princess card. later, each card will have a event/discard handler

                let me = findMe(true);

                let target = player(thought.target);

                unPeek(target.uuid, t.toMask(target.hand));

                target.inPlay = !(princess & t.toMask(target.hand));

                target.discard(); //todo: empty arg tosses entire hand (only one card in love letter)

                if(target.inPlay)
                    target.draw(); //already has knowledge of deck on player init

                return discard(me.hand, t.find(me.hand, 'perk', thought.action));
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