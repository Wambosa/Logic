"use strict";

var _ = require('ramda');
var ai = require('./src/ai');
var tool = require('./src/tool');
var Use = require('./src/use');
var Player = require('./src/player');

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

//later: these ideals will be some kind of datasource stored elsewhere in a nosql or json
var shon = {
    "accuse": {
        mask: guard,
        t: 2,
        m: [[-1, 2],
            [128, 32],
            [3, 8]
        ]
    },
    "spy": {
        mask: priest,
        t: 2,
        m: [
            [2, -1],
            [53, 127],
            [-1, -1]
        ]
    },
    "debate": {
        mask: baron,
        t: 2,
        m: [
            [2, -1],
            [240, 15],
            [3, 8]
        ]
    },
    "protect": {
        mask: handmaiden,
        t: 1,
        m: [
            [0, 0],
            [192, 0],
            [-1, -1]
        ]
    },
    "policy": {
        mask: prince,
        t: 3,
        m: [
            [0, 2],
            [99, 224],
            [3, 8]
        ]
    },
    "mandate": {
        mask: king,
        t: 2,
        m: [
            [2, -1],
            [6, 208],
            [3, 8]
        ]
    },
    "subvert":{
        mask: countess,
        t: 1,
        m: [
            [2, 0],
            [48, 49],
            [0, 0]
        ]
    },
    "favor": {
        mask: princess,
        t: 1,
        m: [
            [3, -1],
            [0, 0],
            [4, 16]
        ]
    }
};
var atlas = {
    "accuse": {
        mask: guard,
        t: 2,
        m: [[0, 0],
            [128, 32],
            [3, 8]
        ]
    },
    "spy": {
        mask: priest,
        t: 2,
        m: [
            [0, 0],
            [53, 127],
            [-1, -1]
        ]
    },
    "debate": {
        mask: baron,
        t: 2,
        m: [
            [0, 0],
            [240, 15],
            [3, 8]
        ]
    },
    "protect": {
        mask: handmaiden,
        t: 1,
        m: [
            [0, 0],
            [192, 0],
            [-1, -1]
        ]
    },
    "policy": {
        mask: prince,
        t: 3,
        m: [
            [0, 0],
            [99, 224],
            [3, 8]
        ]
    },
    "mandate": {
        mask: king,
        t: 2,
        m: [
            [0, 0],
            [6, 208],
            [3, 8]
        ]
    },
    "subvert":{
        mask: countess,
        t: 1,
        m: [
            [0, 0],
            [48, 49],
            [0, 0]
        ]
    },
    "favor": {
        mask: princess,
        t: 1,
        m: [
            [0, 0],
            [0, 0],
            [4, 16]
        ]
    }
};
var rand = {
    "accuse": {
        mask: guard,
        t: 2,
        m: [[tool.random(3,-1), tool.random(3,-1)],
            [tool.random(128, 0), tool.random(128, 0)],
            [tool.random(3, -1), tool.random(8, -1)]
        ]
    },
    "spy": {
        mask: priest,
        t: 2,
        m: [[tool.random(3,-1), tool.random(3,-1)],
            [tool.random(128, 0), tool.random(128, 0)],
            [tool.random(3, -1), tool.random(8, -1)]
        ]
    },
    "debate": {
        mask: baron,
        t: 2,
        m: [[tool.random(3,-1), tool.random(3,-1)],
            [tool.random(128, 0), tool.random(128, 0)],
            [tool.random(3, -1), tool.random(8, -1)]
        ]
    },
    "protect": {
        mask: handmaiden,
        t: 1,
        m: [[tool.random(3,-1), tool.random(3,-1)],
            [tool.random(128, 0), tool.random(128, 0)],
            [tool.random(3, -1), tool.random(8, -1)]
        ]
    },
    "policy": {
        mask: prince,
        t: 3,
        m: [[tool.random(3,-1), tool.random(3,-1)],
            [tool.random(128, 0), tool.random(128, 0)],
            [tool.random(3, -1), tool.random(8, -1)]
        ]
    },
    "mandate": {
        mask: king,
        t: 2,
        m: [[tool.random(3,-1), tool.random(3,-1)],
            [tool.random(128, 0), tool.random(128, 0)],
            [tool.random(3, -1), tool.random(8, -1)]
        ]
    },
    "subvert":{
        mask: countess,
        t: 1,
        m: [[tool.random(3,-1), tool.random(3,-1)],
            [tool.random(128, 0), tool.random(128, 0)],
            [tool.random(3, -1), tool.random(8, -1)]
        ]
    },
    "favor": {
        mask: princess,
        t: 1,
        m: [[tool.random(3,-1), tool.random(3,-1)],
            [tool.random(128, 0), tool.random(128, 0)],
            [tool.random(3, -1), tool.random(8, -1)]
        ]
    }
};
var glen = {
    "accuse": {
        mask: guard,
        t: 2,
        m: [[-1, 2],
            [128, 32],
            [0, 0]
        ]
    },
    "spy": {
        mask: priest,
        t: 2,
        m: [
            [2, -1],
            [53, 127],
            [0, 0]
        ]
    },
    "debate": {
        mask: baron,
        t: 2,
        m: [
            [2, -1],
            [240, 15],
            [0, 0]
        ]
    },
    "protect": {
        mask: handmaiden,
        t: 1,
        m: [
            [0, 0],
            [192, 0],
            [0, 0]
        ]
    },
    "policy": {
        mask: prince,
        t: 3,
        m: [
            [0, 2],
            [99, 224],
            [0, 0]
        ]
    },
    "mandate": {
        mask: king,
        t: 2,
        m: [
            [2, -1],
            [6, 208],
            [0, 0]
        ]
    },
    "subvert":{
        mask: countess,
        t: 1,
        m: [
            [2, 0],
            [48, 49],
            [0, 0]
        ]
    },
    "favor": {
        mask: princess,
        t: 1,
        m: [
            [3, -1],
            [0, 0],
            [0, 0]
        ]
    }
};

//later: the gameLoop/gameMaster should be instantiable and configurable to run from a selection of different game rules
function main(todoArgs){

    var stashEvents = [];
    let gameState = {}; //I need to determine if this is truly needed or not. all the tests get along without it except accuse
    let inGame = true;
    let playerCount = 4;

    let playPile = shuffle(startDeck); //todo: new Deck()
    let discardPile = playPile.splice(0, playerCount === 2 && 4 || 1);

    //todo: stashObject nosql q system
    stashEvents.push(Object.create(playPile));
    stashEvents.push(Object.create(discardPile));

    let draw = _.curry(function(playPile){
        return function(){
            this.hand.push(playPile.pop());
        };
    });

    //note: only supports a single card discard
    let discard = _.curry(function(discardPile){
        return function() {
            this.hand[this.hand.length-1].user = this.uuid;
            discardPile.push(this.hand.pop());
        };
    });

    let actions = [
        {name: "draw", func: draw(playPile)},
        {name: "discard", func: discard(discardPile)}
    ];

    let players = [
        Player("shon", [], shon).configure(actions),
        Player("atlas", [], atlas).configure(actions),
        Player("jack", [], rand).configure(actions),
        Player("glen", [], glen).configure(actions)
    ];

    players.forEach(function(player){
        player.draw();
    });

    stashEvents.push(Object.create(players));

    //these three can go in gamestate
    var cur = 0;
    var turns = 0;
    var round = 0;

    var use = Use.configure(gameState, players);

    while (inGame){

        let me = players[cur];

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
            let h = toMask(me.hand);

        gameState = players.map(function(p){
            return {
                uuid: p.uuid,
                t: p.isTurn && 1 || 2,
                isImmune: p.isImmune,
                m: [
                    [me.wins, p.wins],
                    [h, ai.speculate(startDeck, discardPile, me.hand)], //todo: dont let speculation results to be the same (personality based f())
                    [myDis, foeDis]
                ]
            };
        });

        let thoughts = ai.think(gameState, toMind(me.hand, me.ideals));

        //perhaps it is best to attempt to perform each action starting with the best, if it is illegal, then just try the next action.
        let playedCard = thoughts.find(function(thought){
            return use[thought.action](thought);
        });

        let isLegal = !!playedCard;
        //rule: if there is no legal action, then just discard a card (todo: select smartly)
        playedCard = playedCard || me.hand.splice(0, 1);


        //todo: db.stashRound(turnData) (push to q system)
            stashEvents.push({
                round: round,
                turns: turns,
                gameState: gameState,
                thoughts: thoughts,
                choice: playedCard,
                legal: isLegal
            });


        //todo: endTurn(me, playedCard)
            me.isTurn = false;
            turns++;
            if(cur++ === players.length)
                cur = 0;

            //todo: just call me.discard() ??
            playedCard.user = me.uuid;
            discardPile.push(playedCard);

            //then: try to end game if only one player left
            // then winner.wins++; round++
            // (dont just kill the loop unless 3 rounds have been attained by a single player)
            if(players.filter(function(p){return p.inPlay;}).length === 1){
                turns = 0;
                round++;
                let winner = players.find(function(p){return p.inPlay;});
                //todo: tryEndGame()
                    if(winner.wins++ === 3)
                        inGame = false;
            }
    }

    console.log("game has ended!");
    console.log(JSON.stringify(stashEvents, null, ' '));
}

main();