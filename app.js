"use strict";

var tool = require('src/tool');
var ai = require('src/ai');

var random = tool.random;
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

const startDeck = [
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
];

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
        m: [[random(3,-1), random(3,-1)],
            [random(128, 0), random(128, 0)],
            [random(3, -1), random(8, -1)]
        ]
    },
    "spy": {
        mask: priest,
        t: 2,
        m: [[random(3,-1), random(3,-1)],
            [random(128, 0), random(128, 0)],
            [random(3, -1), random(8, -1)]
        ]
    },
    "debate": {
        mask: baron,
        t: 2,
        m: [[random(3,-1), random(3,-1)],
            [random(128, 0), random(128, 0)],
            [random(3, -1), random(8, -1)]
        ]
    },
    "protect": {
        mask: handmaiden,
        t: 1,
        m: [[random(3,-1), random(3,-1)],
            [random(128, 0), random(128, 0)],
            [random(3, -1), random(8, -1)]
        ]
    },
    "policy": {
        mask: prince,
        t: 3,
        m: [[random(3,-1), random(3,-1)],
            [random(128, 0), random(128, 0)],
            [random(3, -1), random(8, -1)]
        ]
    },
    "mandate": {
        mask: king,
        t: 2,
        m: [[random(3,-1), random(3,-1)],
            [random(128, 0), random(128, 0)],
            [random(3, -1), random(8, -1)]
        ]
    },
    "subvert":{
        mask: countess,
        t: 1,
        m: [[random(3,-1), random(3,-1)],
            [random(128, 0), random(128, 0)],
            [random(3, -1), random(8, -1)]
        ]
    },
    "favor": {
        mask: princess,
        t: 1,
        m: [[random(3,-1), random(3,-1)],
            [random(128, 0), random(128, 0)],
            [random(3, -1), random(8, -1)]
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

//additionally, the player roster will need to be passed to the program in order to initiate a match.
//i do want a npc generator later on however in the case of no human player matches
var players = [
    {
        uuid: "Shon",
        ideals: shon,
        wins: 0,
        hand: [],
        peek: {},
        discard: 0
    },{
        uuid: "Atlas",
        ideals: atlas,
        wins: 0,
        hand: [],
        peek: {},
        discard: 0
    },{
        uuid: "Jack Daniels",
        ideals: rand,
        wins: 0,
        hand: [],
        peek: {},
        discard: 0
    }, {
        uuid: "Glen Levit",
        ideals: glen,
        wins: 0,
        hand: [],
        peek: {},
        discard: 0
    }
];

//later: the gameLoop/gameMaster should be instantiable and configurable to run from a selection of different game rules
function main(){

    let inGame = true;

    var playPile = shuffle(startDeck); //todo: new Deck()
    stashEvents.push(Object.create(playPile));//todo: stashObject nosql q system
    var discardPile = []; //added property "user" = the person's uuid that used it

    players.forEach(function(player){
        player.hand.push(playPile.pop());
        player.inPlay = true;
    });

    stashEvents.push(Object.create(players));

    var cur = 0;
    var turns = 0;
    var round = 0;

    while (inGame){

        //todo: beginTurn()
        let me = players[cur];
        me.isTurn = true;
        me.isImmune = false; //immunity ends at the beginning of your turn.

        //todo: draw card.
        me.hand.push(playPile.pop());

        //todo: getFoeDiscardCount
        let d = players.filter(function(p){return !p.isTurn;})
            .reduce(function(prev, cur){
                return prev.discard + cur.discard;
        });

        let h = toMask(me.hand);

        let gameState = players.map(function(p){
            return {
                uuid: p.uuid,
                t: p.isTurn && 1 || 2,
                isImmune: p.isImmune,
                m: [
                    [me.wins, p.wins],
                    [h, ai.speculate(startDeck, discardPile, me.hand)], //todo: dont let speculation results to be the same (personality based f())
                    [me.discard, d]
                ]
            };
        });

        let thoughts = ai.think(gameState, toMind(me.hand, me.ideals));

        //perhaps it is best to attempt to perform each action starting with the best, if it is illegal, then just try the next action.
        let discard = thoughts.find(function(thought){
            return funcs(gameState, players)[thought.action](thought)
        });

        let isLegal = !!discard;

        //if there is no legal action, then just discard :(
        //todo: noMoveDiscard(me.hand, thoughts[0].action)
        discard = discard || me.hand.splice(t.find(me.hand, "perk", thoughts[0].action), 1);

        discardPile.push(discard);

        //todo: endTurn()
        me.isTurn = false;
        turns++;
        cur++;
        if(cur === players.length)
            cur = 0;

        //todo: async save turn data (push to q system)
        let saveData = {
            round: round,
            turns: turns,
            gameState: gameState,
            thoughts: thoughts,
            choice: discard,
            legal: isLegal
        };
        stashEvents.push(saveData);

        //then: try to end game if only one player left then winner.wins++; round++ (dont just kill the loop unless 3 rounds have been attained by a single player)
        inGame = players.filter(function(p){return p.inPlay;}).length < 2;
    }

    console.log("game has ended!");
}


var stashEvents = [];
main();