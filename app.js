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
    {mask: 1, name: "Guard", perk: "accuse" },
    {mask: 1, name: "Guard", perk: "accuse" },
    {mask: 2, name: "Priest", perk: "spy" },
    {mask: 2, name: "Priest", perk: "spy" },
    {mask: 4, name: "Baron", perk: "debate" },
    {mask: 4, name: "Baron", perk: "debate" },
    {mask: 8, name: "Handmaid", perk: "protect" },
    {mask: 8, name: "Handmaid", perk: "protect" },
    {mask: 16, name: "Prince", perk: "policy" },
    {mask: 16, name: "Prince", perk: "policy" },
    {mask: 32, name: "King", perk: "mandate" },
    {mask: 64, name: "Countess", perk: "subvert" },
    {mask: 128, name: "Princess", perk: "favor" }
];

var players = [
    {
        uuid: "Lui Kang",
        ideals: ideals,
        wins: 0,
        hand: [],
        peek: {},
        discard: 0
    },{
        uuid: "Scorpion",
        ideals: ideals,
        wins: 0,
        hand: [],
        peek: {},
        discard: 0
    },{
        uuid: "Sub-Zero",
        ideals: ideals,
        wins: 0,
        hand: [],
        peek: {},
        discard: 0
    }, {
        uuid: "Quan Chi",
        ideals: ideals,
        wins: 0,
        hand: [],
        peek: {},
        discard: 0
    }
];

function main(){

    let inGame = true;

    var playPile = shuffle(Object.create(startDeck)); //todo: new Deck()
    var discardPile = []; //added property "user" = the person's uuid that used it

    //todo: everyone draw one card shift? pop?
    players.forEach(function(player){
        player.hand.push(playPile.pop());
    });

    var cur = 0;
    var turns = 0;
    var round = 0;

    while (inGame){

        let me = players[cur];
        me.isTurn = true;

        //todo: draw card.
        me.hand.push(playPile.pop());

        let d = players.reduce(function(prev, cur){
            return prev.discard + cur.discard;
        });

        let h = dedup(me.hand).reduce(function(prev, cur){
            return prev.mask + cur.mask;
        });

        let gameState = players.map(function(p){
            return {
                uuid: p.uuid,
                t: p.isTurn && 1 || 2,
                m: [
                    [me.wins, p.wins],
                    [h, speculate(startDeck, discardPile, me.hand)], //todo: dont let speculation results to be the same (personality based f())
                    [me.discard, d]
                ]
            };
        });

        let actions = think(gameState, me.hand);

        //todo: PICK UP HERE
        //for now choose only the best action.
        actions[0].f(); //figure a way to have self knowledge. apply(f, actions[0])

        //todo: endTurn()
        me.isTurn = false;
        turns++;
        cur++;
        if(cur === players.length)
            cur = 0;
        //then: try to end game if only one player left then winner.wins++; round++

        //todo: async save turn data (push to q system)
        let saveData = {
            round: round,
            turns: turns,
            gameState: gameState,
            actions: actions,
            choice: 0
        };
    }

}


function speculate(deck, discard, hand) {
    //todo: toMask()
    let possible = deck.map(function(d){
        return d.mask;
    });
    let known = hand.concat(discard).map(function(k){
        return k.mask;
    });

    known.forEach(function(k){
        possible.splice(possible.indexOf(k), 1);
    });

    let guess = random(possible.length);

    return possible[guess];
}

function think(targets, choices) {
    var actions = [];

    choices.forEach(function(c){
        targets.filter(function(tar){
            return !tar.isImmune && tar.t & c.t;
        }).forEach(function(tar){
            actions.push({
                risk: computeRisk(tar.m, c.m),
                target: tar.uuid,
                action: c.uuid
            });
        });
    });

    return actions.sort(function(a, b){
        return a.risk > b.risk;
    });
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

function dedup(list) {
    return Object.create(list).sort().filter(function(item, pos, ary) {
        return !pos || item.mask != ary[pos - 1].mask;
    })
}

function shuffle(list){
    let count = list.length;
    let swap = 0;

    for (let i=count; i>0; i--){
        swap = random(i);
        let temp = list[i]; //warn: might need object.create
        list[i] = list[swap];
        list[swap] = temp;
    }

    return list;
}

function random(upper, lower){
    return Math.floor((Math.random() * upper) + lower || 0);
}

//todo: think about where this belongs
//potentially create funcs(players) let self.players = players return {f...} instead of globals.. so i can test
var funcs = {
    accuse: function(gameState, tar) {
        //todo: disallow guess of guard per rules
        let guessCard = gameState[tar.index].m[1][1];
        let target = players[tar.index];

        return target.inPlay = guessCard & target.hand.reduce(function(p,c){return p+c;});//use dedup(hand).toMask()
    },
    spy: function(gameState, tar){
        //todo: reveal card to current player
        let me = players.find(function(p){return p.isTurn;});
        let target = players[tar.index];
        me.peek[target.uuid] = target.hand; //todo: toMask && init the peek object on players

        return target.hand;//todo: toMask
    },
    debate: function(gameState, tar){
        //compare the highest card. hig card wins. low card loses
    },
    protect: function(gameState, tar){
        //trigger isImmune Flag on player
    },
    policy: function(gameState, tar){
        //make target discard
        //for now, check for princess card. later, each card will have a event/discard handler
    },
    mandate: function(gameState, tar){
        // switch cards with target
        // move your hand to temp
        // set me.hand to target.hand
        // set me.peek to temp
        // set target.hand to temp
    },
    subvert: function(gameState, tar){
        //this one requires an event handler of sorts?
        // maybe this card flags the others as unplayable so that the users is simply forced to play this
        // i dont want to "auto" play this card. otherwise, the lack of delay is telling
    },
    favor: function(gameState, tar){
        // oddly enough. just makes the user lose.
        // if this card is played, then set me.inPlay = false
    }
};

main();