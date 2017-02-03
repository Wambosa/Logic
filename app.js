"use strict";

var _ = require('ramda');
var ai = require('./src/ai');
var Use = require('./src/use');
var tool = require('./src/tool');
var Deck = require('./src/deck');
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

    let sharedDeck = new Deck(shuffle(startDeck));
    sharedDeck.banish(1);
    sharedDeck.discard(playerCount === 2 && 3 || 0);


    //todo: stashObject nosql q system
    stashEvents.push(sharedDeck.pile.map(function(c){return c.mask;}));

    let draw = function(){
        if(!sharedDeck.pile.length)
            return false;
            
        this.hand.push(sharedDeck.draw());
        return true;
    };

    //note: only supports a single card discard
    let discard = function() {
        if(this.hand.length) {
            this.hand[this.hand.length - 1].user = this.uuid;
            sharedDeck.discard(this.hand.pop());
        }
    };

    let actions = [
        {name: "draw", func: draw},
        {name: "discard", func: discard}
    ];

    let players = [
        new Player("shon", [], fakeData.ideals.shon).configure(actions),
        new Player("atlas", [], fakeData.ideals.atlas).configure(actions),
        new Player("jack", [], fakeData.ideals.rand).configure(actions),
        new Player("glen", [], fakeData.ideals.glen).configure(actions)
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
        console.log("round reset", "begin");
        
        players.forEach(function(player){
            player.purge('discard');
        });
        
        sharedDeck.reset();
        sharedDeck.banish(1);
        sharedDeck.discard(playerCount === 2 && 3 || 0);
        
        console.log("deck check", sharedDeck.pile.map(function(c){return c.mask;}));
        
        players.forEach(function(player){
            player.inPlay = true;
            player.draw();
            console.log(player.name, "drew", player.hand[0].name);
        });
        
        console.log("deck:", sharedDeck.pile.length, ". discard:", sharedDeck.discarded.length, ". players:", players.length);
    }
    //var use = Use.configure(gameState, players);

    function nextPlayer() {
        cur = ++cur !== players.length && cur || 0;
        return players[cur];
    }

    while (inGame){

        let me = nextPlayer();
        
        while(!me.inPlay){
            console.log("turn skip", me.name);
            me = nextPlayer();
        }

        //todo: beginTurn(me)
            me.isTurn = true;
            me.isImmune = false; //immunity ends at the beginning of your turn.
            me.draw();
            console.log("turn", turns, me.name, me.hand.map(function(c){return c.perk;}));
        //

        //get/prep matrix values
            let myDis = sharedDeck.history(me.uuid).length;
            let foeDis = sharedDeck.history(me.uuid, true).length;
            let myCards = toMask(me.hand);

        gameState = players.map(function(p){ //this needs to update the object in place instead of creating a new one via map
            return {
                uuid: p.uuid,
                t: p.isTurn && 1 || 2,
                isImmune: p.isImmune,
                inPlay: p.inPlay,
                m: [
                    [me.wins, p.wins],
                    [myCards, me.peek[p.uuid] || ai.speculate(startDeck, sharedDeck.history(), me.hand)], //todo: dont let speculation results to be the same (personality based f())
                    [myDis, foeDis]
                ]
            };
        });

        let thoughts = ai.think(gameState, toMind(me.hand, me.ideals));

        var use = Use.configure(gameState, players);

        //perhaps it is best to attempt to perform each action starting with the best, if it is illegal, then just try the next action.
        //this action part needs to be a player method. each personality can have different methods. a personality obj new Personality(ideals, interpreter)
        let playedCard = thoughts.find(function(thought){
            //this might be too clever, the method called will return false if it was not legal
            let result = use[thought.action](thought);
            
            if(result)
                console.log(JSON.stringify(thought)+'\n');
                
            return result;
        });

        //should not need this. just checking
        // convert this to a test
        if(typeof playedCard == "array"){
            console.log(thoughts);
            console.log(playedCard);
            throw Error("incorrect return type from find");
        }

        let isLegal = !!playedCard;
        //rule: if there is no legal action, then just discard a card (todo: select smartly using highest risk)
        playedCard = playedCard || me.hand.splice(0, 1); //.sort.splice(0,1)

        if(!isLegal){
            console.log("no legal move", "discarding", playedCard);
            console.log(thoughts);
        }



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

            //todo: just call me.discard() ??
            playedCard.user = me.uuid;
            sharedDeck.discard(playedCard);

            //if no cards in deck.end game with high card
            if(!sharedDeck.pile.length){
                console.log("sharedDeck is empty", "eliminating low card holders...");
                
                function validPlayer(p){
                    return p.inPlay && p.hand.length;
                }
                
                let highCardPlayer = players
                    .filter(validPlayer)
                        .sort(function(a, b){
                            let aVal = toMask(a.hand);
                            let bVal = toMask(b.hand);
                            if(aVal > bVal)
                                return 1;
                            else if(aVal < bVal)
                                return -1;
                            else
                                return 0;
                        })[0];

                if(!highCardPlayer)
                    throw "there is no highCardPlayer???";

                players.filter(function(p){
                    return validPlayer(p) && p.uuid != highCardPlayer.uuid;
                }).forEach(function(p){
                    
                    let myCard = toMask(p.hand);
                    let bossCard = toMask(highCardPlayer.hand);

                    function promotePlayer(player){
                        console.log("tie eliminated", highCardPlayer.name, bossCard, "<", myCard);
                        highCardPlayer.inPlay = false;
                        highCardPlayer = player;
                    }

                    if(myCard > bossCard) {
                        promotePlayer(p);

                    }else if(myCard === bossCard){
                        //then sum up the sharedDeck discards for the competing players
                        //higher number wins the draw

                        let getSurplusValue = function(uuid){
                            return sharedDeck.history(uuid)
                                .reduce(function(p, c){
                                    return p.mask + c.mask;
                                });
                        };

                        let surplus = getSurplusValue(p.uuid);
                        let bossSurplus = getSurplusValue(highCardPlayer.uuid);

                        if(surplus >= bossSurplus)
                            promotePlayer(p);
                    }else{
                        p.inPlay = false;
                    }

                });
            }


            //then: try to end game if only one player left OR if there are no cards left in the sharedDeck
            // then winner.wins++; round++
            // (dont just kill the loop unless 3 rounds have been attained by a single player)
            let isLastPlayer = players.filter(function(p){return p.inPlay;}).length === 1;
        
            if(isLastPlayer || !sharedDeck.pile.length){
                turns = 0;
                round++;
                let winners = players.filter(function(p){return p.inPlay;});
                
                console.log("ROUND", round-1, "END", winners.map(function(p){return p.name;}));
                //todo: tryEndGame()
                
                let finalWinners = [];
                
                winners.forEach(function(p){
                    if(++p.wins === 3)
                        finalWinners.push(p);
                });
                
                if(finalWinners.length){
                    console.log("GAME OVER", finalWinners.map(function(p){return p.name;}));
                    //todo: cur = winner.index;
                    inGame = false;
                }else{
                    resetRound();
                }
                
            }
    }

    console.log("game has ended!");
    //console.log(JSON.stringify(stashEvents, null, ' '));
}

try {
    main();
}catch(e){
    console.log(e);
    
    let fs = require('fs');
    fs.writeFile('error.json', JSON.stringify(stashEvents, null, ' '));
    console.log('gamestate written to error.json');
}