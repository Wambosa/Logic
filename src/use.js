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

//todo: just update t.discardTo(index), then delete this func
function discard(hand, card){
    let index = t.simplify(hand).indexOf(card.mask);//todo: fix this line (the issue likely comes from the guard accuse/ or not having a legal action)

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
                
                //consider moving ai speculation here, we have everything we need from the player to pull it off. if only the deck was not shared, or each player had access to hi deck
                let speculation = me.peek[target.uuid] || stateOf(thought.target).m[1][1];

                //todo: maybe improve this by speculating per action instead of per player? this way the accuse action cannot speculate another guard
                speculation = !(speculation & guard) && speculation || [2,4,8,16,32,64,128][t.random(6)]; //rule: cannot accuse another guard. random roll another guess

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

                //todo: this pattern appears too often, bake the unpeek into discard action or broadcast event.
                if(!me.inPlay) {
                    unPeek(me.uuid, t.toMask(me.hand));
                    me.discard();
                }

                if(!target.inPlay) {
                    unPeek(target.uuid, t.toMask(target.hand));
                    target.discard();
                }

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

                let me = findMe(true);

                let target = player(thought.target);

                let illegal = countess & t.toMask(me.hand);

                if(illegal) //todo: will likely need an error object to send up to client
                    return false;

                //todo: consider unPeek being a part of discard action

                unPeek(target.uuid, t.toMask(target.hand));

                target.inPlay = !(princess & t.toMask(target.hand));

                let playedCard = discard(me.hand, t.find(me.hand, 'perk', thought.action));

                target.discard(); //todo: empty arg tosses entire hand (only one card in love letter)

                if(target.inPlay)
                    target.draw(); //already has knowledge of deck on player init

                unPeek(me.uuid, playedCard.mask);
                return playedCard;
            },

            mandate: function (thought) {

                let me = findMe(true);

                let target = player(thought.target);

                let illegal = countess & t.toMask(me.hand);

                if(illegal)
                    return false;

                let playedCard = discard(me.hand, t.find(me.hand, 'perk', thought.action));
                unPeek(me.uuid, playedCard.mask);

                let myHand = me.hand.slice(0);
                let tarHand = target.hand.slice(0);

                let mePeekKnowledge = t.toMask(myHand);
                let tarPeekKnowledge = t.toMask(tarHand);

                me.hand = tarHand;
                target.hand = myHand;

                //todo: move peek knowledge that other players may posses
                players.forEach(function(p){
                    let peekMe = p.peek[me.uuid];
                    let peekTar = p.peek[target.uuid];
                    p.peek[me.uuid] = peekTar;
                    p.peek[target.uuid] = peekMe;
                });

                //let the involved parties gain peek knowledge
                me.peek[target.uuid] = tarPeekKnowledge;
                target.peek[me.uuid] = mePeekKnowledge;

                return playedCard;
            },

            subvert: function (thought) {
                //note: this card flags the others as unplayable so that the users is simply forced to play this
                let me = findMe(true);
                return discard(me.hand, t.find(me.hand, 'perk', thought.action));
            },

            favor: function (thought) {
                // oddly enough. just makes the user lose.
                let me = findMe(true);
                me.inPlay = false;
                return discard(me.hand, t.find(me.hand, 'perk', thought.action));
            }
        };
    }
};