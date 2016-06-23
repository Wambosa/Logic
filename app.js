"use strict";

var _ = require('ramda');
var ai = require('./src/ai');
var tool = require('./src/tool');
var Use = require('./src/use');
var Player = require('./src/player');
var fakeData = require('./src/fakeData');

var toMask = tool.toMask;
var toMind = tool.toMind;
var shuffle = tool.shuffle;

// first i need to figure out the game logic loop
// i will run the loop without any network connections.
// AI vs AI, need to store the match results in data folder.

// for now, don't worry about databases at all. just inline all the data and get some quick results
// proof of concept is the most important thing right now.

const tar_self = 1;
const tar_foe = 2;
const tar_any = 3;

const guard = 1;
const priest = 2;
const baron = 4;
const handmaiden = 8;
const prince = 16;
const king = 32;
const countess = 64;
const princess = 128;

const startDeck = Object.freeze([
    {mask: guard, name: "Guard", perk: "accuse" },
    {mask: guard, name: "Guard", perk: "accuse" },
    {mask: guard, name: "Guard", perk: "accuse" },
    {mask: guard, name: "Guard", perk: "accuse" },
    {mask: guard, name: "Guard", perk: "accuse" },
    {mask: priest, name: "Priest", perk: "spy" },
    {mask: priest, name: "Priest", perk: "spy" },
    {mask: baron, name: "Baron", perk: "debate" },
    {mask: baron, name: "Baron", perk: "debate" },
    {mask: handmaiden, name: "Handmaid", perk: "protect" },
    {mask: handmaiden, name: "Handmaid", perk: "protect" },
    {mask: prince, name: "Prince", perk: "policy" },
    {mask: prince, name: "Prince", perk: "policy" },
    {mask: king, name: "King", perk: "mandate" },
    {mask: countess, name: "Countess", perk: "subvert" },
    {mask: princess, name: "Princess", perk: "favor" }
]);

var stashEvents = [];

//later: the gameLoop/gameMaster should be instantiable and configurable to run from a selection of different game rules
function main(todoArgs){

    let gameState = [{}, {}]; //I need to determine if this is truly needed or not. all the tests get along without it except accuse
    let inGame = true;
    let playerCount = 4;

    let playPile = shuffle(startDeck); //todo: new Deck()
    let banishPile = playPile.splice(0, 1);
    let discardPile = playPile.splice(0, playerCount === 2 && 3 || 0);


    //todo: stashObject nosql q system
    stashEvents.push(playPile.slice(0));
    stashEvents.push(discardPile.slice(0));

    let draw = _.curry(function(playPile, banishPile){
        return function(){
            this.hand.push(playPile.pop() || banishPile.pop());
        };
    });

    //note: only supports a single card discard
    let discard = _.curry(function(discardPile){
        return function() {
            if(this.hand.length) {
                this.hand[this.hand.length - 1].user = this.uuid;
                discardPile.push(this.hand.pop());
            }
        };
    });

    let actions = [
        {name: "draw", func: draw(playPile, banishPile)},
        {name: "discard", func: discard(discardPile)}
    ];

    let players = [
        Player("shon", [], fakeData.ideals.shon).configure(actions),
        Player("atlas", [], fakeData.ideals.atlas).configure(actions),
        Player("jack", [], fakeData.ideals.rand).configure(actions),
        Player("glen", [], fakeData.ideals.glen).configure(actions)
    ];

    players.forEach(function(player){
        player.draw();
    });

    //todo: stashEvents.push(players.map(toReportObject));

    //these three can go in gamestate
    var cur = 0;
    var turns = 0;
    var round = 0;

    function resetRound(){
        players.forEach(function(player){
            player.discard();
        });
        playPile = shuffle(discardPile.slice(0)); //move the discard over
        discardPile = playPile.splice(0, playerCount === 2 && 4 || 1); //make sure discard is terminated
        players.forEach(function(player){
            player.draw();
        });
    }
    //var use = Use.configure(gameState, players);

    while (inGame){

        let me = players[cur];

        while(!me.inPlay)
            me = players[++cur];

        //todo: beginTurn(me)
            me.isTurn = true;
            me.isImmune = false; //immunity ends at the beginning of your turn.
            me.draw();
        //

        //get/prep matrix values
            let myDis = discardPile.filter(function(card){
            return card.user == me.uuid;
        }).length;
            let foeDis = discardPile.filter(function(card){
            return card.user != me.uuid;
        }).length;
            let myCards = toMask(me.hand);

        gameState = players.map(function(p){ //this needs to update the object in place instead of creating a new one via map
            return {
                uuid: p.uuid,
                t: p.isTurn && 1 || 2,
                isImmune: p.isImmune,
                inPlay: p.inPlay,
                m: [
                    [me.wins, p.wins],
                    [myCards, me.peek[p.uuid] || ai.speculate(startDeck, discardPile, me.hand)], //todo: dont let speculation results to be the same (personality based f())
                    [myDis, foeDis]
                ]
            };
        });

        let thoughts = ai.think(gameState, toMind(me.hand, me.ideals));

        var use = Use.configure(gameState, players);

        //perhaps it is best to attempt to perform each action starting with the best, if it is illegal, then just try the next action.
        //this action part needs to be a player method. each personality can have different methods. a personality obj new Personality(ideals, interpreter)
        let playedCard = thoughts.find(function(thought){
            return use[thought.action](thought);
        });

        //should not need this. just checking
        if(typeof playedCard == "array"){
            console.log(thoughts);
            console.log(playedCard);
            throw Error("incorrect return type from find");
        }

        let isLegal = !!playedCard;
        //rule: if there is no legal action, then just discard a card (todo: select smartly using highest risk)
        playedCard = playedCard || me.hand.splice(0, 1); //.sort.splice(0,1)


        //todo: db.stashRound(turnData) (push to q system)
            stashEvents.push({
                round: round,
                turns: turns,
                gameState: gameState.map(function(g){g.m = g.m.toString(); return g;}),
                thoughts: thoughts.slice(0),
                choice: playedCard,
                legal: isLegal
            });


        //todo: endTurn(me, playedCard)
            me.isTurn = false;
            turns++;
            if(++cur === players.length)
                cur = 0;

            //todo: just call me.discard() ??
            playedCard.user = me.uuid;
            discardPile.push(playedCard);

            //if no cards in deck.end game with high card
            if(!playPile.length){

                let highCardPlayer = players.find(function(p){return p.inPlay;});

                players.filter(function(p){
                    return p.inPlay;
                }).forEach(function(p){

                    let highCard = toMask(p.hand);
                    let bossCard = toMask(highCardPlayer.hand);

                    function promotePlayer(player){
                        highCardPlayer.inPlay = false;
                        highCardPlayer = player;
                    }

                    if(highCard > bossCard) {
                        promotePlayer(p);

                    }else if(highCard === bossCard){
                        //then sum up the discardPile
                        //higher number wins the draw

                        let getSurplusValue = function(uuid){
                            return discardPile.filter(function(card){
                                return card.user === uuid;
                            }).reduce(function(p, c){
                                return p.mask + c.mask;
                            });
                        };

                        let surplus = getSurplusValue(p.uuid);
                        let bossSurplus = getSurplusValue(highCardPlayer.uuid);

                        if(surplus > bossSurplus)
                            promotePlayer(p);
                    }
                });
            }


            //then: try to end game if only one player left
            // then winner.wins++; round++
            // (dont just kill the loop unless 3 rounds have been attained by a single player)
            if(players.filter(function(p){return p.inPlay;}).length === 1){
                turns = 0;
                round++;
                let winner = players.find(function(p){return p.inPlay;});
                //todo: tryEndGame()
                    if(++winner.wins === 3)
                        //todo: cur = winner.index;
                        inGame = false;
                resetRound();
            }
    }

    console.log("game has ended!");
    console.log(JSON.stringify(stashEvents, null, ' '));
}

try {
    main();
}catch(e){
    console.log(e);
    console.log(JSON.stringify(stashEvents, null, ' '));
}