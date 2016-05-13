"use strict";

var math = require('mathjs');

// first i need to figure out the game logic loop
// i will run the loop without any network connections.
// AI vs AI, need to store the match results in data folder.

// for now, don't worry about databases at all. just inline all the data and get some quick results
// proof of concept is the most important thing right now.

//for now, everyone will use the same ideals
var ideals = {
    "accuse": {
        mask: 1,
        t: 2,
        m: [[-1, 2],
            [128, 32],
            [3, 8]
        ]
    },
    "spy": {
        mask: 2,
        t: 2,
        m: [
            [2, -1],
            [53, 127],
            [-1, -1]
        ]
    },
    "debate": {
        mask: 4,
        t: 2,
        m: [
            [2, -1],
            [240, 15],
            [3, 8]
        ]
    },
    "protect": {
        mask: 8,
        t: 1,
        m: [
            [0, 0],
            [192, 0],
            [-1, -1]
        ]
    },
    "policy": {
        mask: 16,
        t: 3,
        m: [
            [0, 2],
            [99, 224],
            [3, 8]
        ]
    },
    "mandate": {
        mask: 32,
        t: 2,
        m: [
            [2, -1],
            [6, 208],
            [3, 8]
        ]
    },
    "subvert":{
        mask: 64,
        t: 1,
        m: [
            [2, 0],
            [48, 49],
            [0, 0]
        ]
    },
    "favor": {
        mask: 128,
        t: 1,
        m: [
            [3, -1],
            [0, 0],
            [4, 16]
        ]
    }
};

const startDeck = [
    {mask: 1, name: "Guard", perk: "accuse" },
    {mask: 1, name: "Guard", perk: "accuse" },
    {mask: 1, name: "Guard", perk: "accuse" },
    {name: "Guard", perk: "accuse" },
    {name: "Guard", perk: "accuse" },
    {name: "Priest", perk: "spy" },
    {name: "Priest", perk: "spy" },
    {name: "Baron", perk: "debate" },
    {name: "Baron", perk: "debate" },
    {name: "Handmaid", perk: "protect" },
    {name: "Handmaid", perk: "protect" },
    {name: "Prince", perk: "policy" },
    {name: "Prince", perk: "policy" },
    {name: "King", perk: "mandate" },
    {name: "Countess", perk: "subvert" },
    {name: "Princess", perk: "favor" }
];

function main(){

    let inGame = true;

    let players = [
        {
            uuid: "Lui Kang",
            ideals: ideals,
            wins: 0,
            hand: 0,
            discard: 0
        },{
            uuid: "Scorpion",
            ideals: ideals,
            wins: 0,
            hand: 0,
            discard: 0
        },{
            uuid: "Sub-Zero",
            ideals: ideals,
            wins: 0,
            hand: 0,
            discard: 0
        }, {
            uuid: "Quan Chi",
            ideals: ideals,
            wins: 0,
            hand: 0,
            discard: 0
        }
    ];

    while (inGame){
        let cur = 0;

        let me = players[cur];
        me.isTurn = true;

        let d = players.reduce(function(prev, cur){
            return prev.discard + cur.discard;
        });

        var gameState = players.map(function(p){
            return {
                uuid: p.uuid,
                t: p.isTurn && 1 || 2,
                m: [
                    [me.wins, p.wins],
                    [me.hand, speculate(startDeck, )],
                    [me.discard, d]
                ]
            };
        });

        cur++;
        if(cur === players.length)
            cur = 0;
    }

}


function speculate(deck, discard, hand) {
    let possible = Object.create(deck);
    let known = hand.concat(discard);

    known.forEach(function(k){
        possible.splice(possible.indexOf(k), 1);
    });

    let guess = Math.floor((Math.random() * possible.length) + 0);

    return possible[guess];
}

function computeRisk(target, action){
    target = math.matrix(target);
    action = math.matrix(action);
    let ignorables = math.and(math.ceil(target), math.ceil(action))
    target = math.dotMultiply(target, ignorables)

    //there are 3 ish steps here
    let w = math.index(0, [0,1]); // difference the wins
    let c = math.index(1, [0,1]); // bit compare the cards
    let n = math.index(2, [0,1]); // difference the counts

    let risk = 10; //inherent risk
    risk += math.sum(math.abs(math.subtract(target.subset(w), action.subset(w))));
    risk += math.sum(math.abs(math.subtract(target.subset(n), action.subset(n))));

    // i actually want to do hamming weight for more complex games.
    // The hamming weight can only ever be 1 or 0 for this game.
    // the preferred card decreses risk instead of reduces it.

    let bitAnd = math.bitAnd(target.subset(c), action.subset(c))._data[0]; //todo: hamming weight * impact
    risk += bitAnd[0] && -2;
    risk += bitAnd[1] && -2;

    return risk;
}

main();