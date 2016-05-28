"use strict";

var math = require('mathjs');

// first i need to figure out the game logic loop
// i will run the loop without any network connections.
// AI vs AI, need to store the match results in data folder.

// for now, don't worry about databases at all. just inline all the data and get some quick results
// proof of concept is the most important thing right now.

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

//later: these ideals will be some kind of arg stored elsewhere in a nosql
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

function main(){

    let inGame = true;

    var playPile = shuffle(Object.create(startDeck)); //todo: new Deck()
    stashEvents.push(Object.create(playPile));//todo: stashObject nosql q system
    var discardPile = []; //added property "user" = the person's uuid that used it

    //todo: everyone draw one card shift? pop?
    players.forEach(function(player){
        player.hand.push(playPile.pop());
        player.inPlay = true;
    });

    stashEvents.push(Object.create(players));

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

        let thoughts = think(gameState, me.hand);

        //perhaps it is best to attempt to perform each action starting with the best, if it is illegal, then just try the next action.
        let choice = thoughts.find(function(thought){
            return funcs(gameState, players)[thought.action](thought)
        });

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
            choice: choice
        };
        stashEvents.push(saveData);

        //then: try to end game if only one player left then winner.wins++; round++
        inGame = players.filter(function(p){return p.inPlay;}).length < 2;
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
var funcs = function(gameState, players){
    return {
        player: function(uuid){
            return players.find(function(player){
                return player.uuid === uuid;
            });
        },

        accuse: function(thought) {

            let target = this.player(thought.target);
            let speculation = gameState.find(function(g){return g.uuid === thought.target;}).m[1][1];
            let me = this.player(players.find(function(p){return p.isTurn;}));

            let valid = speculation & guard; //note: cannot accuse another guard

            if(!valid)
                return false;

            let guessCard = me.peek[target.uuid] || speculation;

            target.inPlay = guessCard & target.hand.reduce(function(p,c){return p+c;});//use dedup(hand).toMask()

            for(var i=0; i<me.hand.length;i++){
                if(me.hand[i].perk === thought.action){
                    return me.hand.splice(i, 1);
                }
            }

            return "broken";
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
};

var stashEvents = [];
main();