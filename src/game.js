"use strict";

const t = require('./tool');

//note: don't know if i want AI here... it is stateless though..
const ai = require('./ai'); 


module.exports = function(options){
    
    var self = this;

    var cur = 0; //todo: allow firstTurn rule function
    var turns = 0;
    var round = 0;
    var inGame = true;

    var Use = options.use;
    var deck = options.deck;
    var players = options.players;
    const playerCount = players.length;
    
    //todo: I need to determine if this is truly needed or not. all the tests get along without it except accuse    
    var perspective = [{}, {}];
    
    //think about this
    options.objects.forEach(function(o){
        self[o.name] = o.ref;
    });
    //then i can pass func instructions with this binded to game in order to access the object in proper scope
    // whats more is that if all the instructions are delcared in the same app.js scope, then the objects should be able to reach eachother potentially without binding at all
    
    self = {
        
        //todo: need to stash instructions so that when self.init is called, then it can access stashed instructions
        beginRound: function(instructions){
            console.log("round reset");

            turns = 0;
            
            players.forEach(function(player){
                player.purge('discard');
            });
            
            deck.reset(); //this shuffles as well
            deck.banish(1);
            deck.discard(playerCount === 2 && 3 || 0);

            //todo: stashObject nosql q system
            //preserver.stash(t.simplify(deck.pile));

            players.forEach(function(player){
                player.inPlay = true;
                player.draw();
            });
            
            //todo: convert to test
            console.log("deck:", deck.pile.length, ". discard:", deck.discarded.length, ". players:", players.length);
        },
        
        beginTurn: function(instructions){
            let me = self.nextPlayer();
            
            while(!me.inPlay){
                console.log("turn skip", me.name);
                me = self.nextPlayer();
            }
            
            me.isTurn = true;
            
            //note: hack instruction interp (concat the high level topis player, deck, game etc)
            // potentially just have a flat array with the target as anopther string field
            instructions.player.sort(function(a,b){
                if(a.order < b.order)
                    return 1;
                else if(a.order > b.order)
                    return -1;
                else
                    return 0;
            })
            .forEach(function(step){
                if(step.property)
                    me[step.property] = step.val;
                if(step.func)
                    me[step.func]();
            });

            console.log("turn", turns, me.name, t.simplify(me.hand, "perk"));
        },
        
        turn: function(){
            
            let me = self.player();
            
            let thoughts = ai.think(
                perspective, 
                t.toChoice(me.hand, me.ideals)
            );
            
            //this use module will mutate the players state
            let use = Use.configure(perspective, players);
    
            //perhaps it is best to attempt to perform each action starting with the best, if it is illegal, then just try the next action.
            //this action part needs to be a player method. each personality can have different methods. a personality obj new Personality(ideals, interpreter)
            let playedCard = thoughts.find(function(thought){
                //this might be too clever, the method called will return false if it was not legal
                let result = use[thought.action](thought);
                
                if(result)
                    console.log(JSON.stringify(thought)+'\n');
                    
                return result;
            });
    
            let isLegal = !!playedCard;
            //rule: if there is no legal action, then just discard a card (todo: select smartly using highest risk)
            playedCard = playedCard || me.hand.splice(0, 1); //.sort.splice(0,1)
    
    
            //TODO: the card is never going to reach the discard pile. need to refactor the use module to call player's t.discardTo
            pick up here
    
            if(!isLegal){
                console.log("no legal move", "discarding", playedCard);
                console.log(thoughts);
            }
            
            return isLegal;
        },
        
        endTurn: function(){
            //todo: endTurn(me, playedCard)
            let me = self.player();
            
            me.isTurn = false;
            turns++;

            //todo: just call me.discard() before hand...
            //playedCard.user = me.uuid;
            //sharedDeck.discard(playedCard);
        },

        endRoundTieBreak: function(){
            
            console.log("sharedDeck is empty", "eliminating low card holders...");
            
            let highCardPlayer = t.highCardPlayer(players);

            if(!highCardPlayer)
                throw "there is no highCardPlayer???";

            players.filter(function(p){
                return t.isValidPlayer(p) && p.uuid != highCardPlayer.uuid;
            }).forEach(function(p){
                
                let myCard = t.toMask(p.hand);
                let bossCard = t.toMask(highCardPlayer.hand);

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
                        return deck.history(uuid)
                            .reduce(function(p, c){
                                return p.mask + c.mask;
                            });
                    };

                    let surplus = getSurplusValue(p.uuid);
                    let bossSurplus = getSurplusValue(highCardPlayer.uuid);

                    if(surplus >= bossSurplus)
                        promotePlayer(p);
                    //todo: there is an else edge case == where the younger player wins
                }else{
                    p.inPlay = false;
                }

            });
        },
        
        endRoundWinner: function(){
            //then: try to end game if only one player left OR if there are no cards left in the sharedDeck
            // then winner.wins++; round++

            turns = 0;
            round++;
            let winners = players.filter(t.isValidPlayer);
            
            console.log("ROUND", round-1, "END", t.simplify(winners, "uuid"));
            //todo: tryEndGame()
            
            let finalWinners = [];
            
            winners.forEach(function(p){
                if(++p.wins === 3)
                    finalWinners.push(p);
            });
            
            if(finalWinners.length){
                console.log("GAME OVER", t.simplify(finalWinners, "uuid"));
                //todo: cur = winner.index;
                inGame = false;
            }else{
                self.beginRound();
            }
        },
        
        updatePerspective: function() {
            
            let me = self.player();
            
            let myDis = deck.history(me.uuid).length;
            let foeDis = deck.history(me.uuid, true).length;
            let myCards = t.toMask(me.hand);
    
            perspective = players.map(function(p){
                return {
                    uuid: p.uuid,
                    t: p.isTurn && 1 || 2,
                    isImmune: p.isImmune,
                    inPlay: p.inPlay,
                    m: [
                        [me.wins, p.wins],
                        [myCards, me.peek[p.uuid] || ai.speculate(deck.originals, deck.history(), me.hand)], //todo: dont let speculation results to be the same (personality based f())
                        [myDis, foeDis]
                    ]
                };
            });
            
            return perspective;
        },
        
        nextPlayer: function() {
            cur = ++cur !== players.length && cur || 0;
            return players[cur];
        },
        
        player: function(){
            return players[cur];
        },
        
        isRunning: function(){
            return inGame;
        }
    };
    
    return self;
}