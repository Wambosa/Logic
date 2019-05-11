"use strict";

var _ = require('ramda');
var ai = require('./src/ai');
var Use = require('./src/use');
var t = require('./src/tool');
var Deck = require('./src/deck');
var Game = require('./src/game');
var Player = require('./src/player');
var fakeData = require('./src/fakeData');

var toMask = t.toMask;

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

    let sharedDeck = new Deck(startDeck);

    let playerActions = [
        {name: "draw", func: t.drawFrom(sharedDeck)},
        {name: "discard", func: t.discardTo(sharedDeck)}
    ];

    //todo: find some way to give knowledge of which deck is his. currently they all share a deck.
    let players = [
        new Player("shon", [], fakeData.ideals.shon).configure(playerActions),
        new Player("atlas", [], fakeData.ideals.atlas).configure(playerActions),
        new Player("jack", [], fakeData.ideals.rand).configure(playerActions),
        new Player("glen", [], fakeData.ideals.glen).configure(playerActions)
    ];

    let game = new Game({
        guid: 123456789000,
        name: 'LoveLetter',
        use: Use,
        deck: sharedDeck,
        players: players
    });

    //todo: stashEvents.push(game.report() || game.report('players'));

    // try this idea out. for now, just assume all instructions apply the player
    // turn handler will order and envoke methods or set values on common objects
    let turnInstructions = {
        game: [],
        deck: [],
        player: [
            {order: 1, property: 'isImmune', val: false}, //note: immunity ends at the beginning of your turn. (consider passing in turn func in options)
            {order: 2, func: 'draw'}
        ]
    };

    game.beginRound();

    while (game.isRunning()){

        //finds the next player, draws a card and removes immunity
        game.beginTurn(turnInstructions);

        //mutates the gamestate for this* turn
        game.updatePerspective();

        //uses the card and its actions take whatever effect
        game.turn();

        //todo: db.stashRound(turnData) (push to q system)
            // stashEvents.push({
            //     round: round,
            //     turns: turns,
            //     gameState: gameState.map(function(g){g.m = g.m.toString(); return g;}),
            //     thoughts: thoughts.slice(0),
            //     choice: playedCard,
            //     legal: isLegal
            // });

        //the instructions are most complicated here for love letter. scope is the biggest enemy right now
        //ends the turn and potentiallty the round or game. needs more refactoring. but is at least more testable at the moment
        game.endTurn();
        
        let isLastPlayer = players.filter(t.isValidPlayer).length === 1;
        
        //if no cards in deck.end game with high card
        if(!sharedDeck.pile.length)
            game.endRoundTieBreak();
        
        //this is valid because two people can win in a deckOut
        if(isLastPlayer || !sharedDeck.pile.length)
            game.endRoundWinner();
    }

    console.log("game has ended!");
}

try {
    main();
}catch(e){
    console.log(e);
    
    let fs = require('fs');
    fs.writeFile('error.json', JSON.stringify(stashEvents, null, ' '));
    console.log('gamestate written to error.json');
}