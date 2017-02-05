"use strict";

const root = process.cwd();
const Deck = require('../src/deck');

describe("a Deck instance", function(){

    describe("when instantiated", function(){

        it("stashes an original immutable card list", function(){
            
            let deck = new Deck([1, 2, 3]);
            
            try{ deck.originals.unshift(4); }catch(e){}
            
            expect(deck.originals[0]).toEqual(1);
        });
    });
    
    describe("when drawing a card", function(){

        it("returns the top card in the pile", function(){

            let deck = new Deck([1,2,3]);

            expect(deck.draw()).toBe(3);
        });
        
        //note: because policy can trigger a legitimate card draw on the last turn
        //we use the extra unknown banished card as a failsafe measure
        // this kind of behavior is not generic, 
        // so i will eventually have to remedy this by moving the rule into the Use.policy itself
        it("returns the banished card after pile is depleted", function(){

            let deck = new Deck([1,2,3, {mask:64}]);
            deck.banish(1);
            deck.draw();
            deck.draw();
            deck.draw();

            expect(deck.draw()).toEqual({mask:64});
        });
    });
    
    describe("when banishing", function(){

        it("takes top card from pile", function(){
            
            let deck = new Deck([1, 2, 3]);
            
            deck.banish(1);
            
            expect(deck.banished[0]).toEqual(3);
        });
        
        it("then honors n count removal", function(){
            
            let deck = new Deck([1, 2, 3]);
            
            deck.banish(3);
            
            expect(deck.banished.length).toBe(3);
        });
    });
    
    describe("when discarding", function(){

        it("then takes top card from pile", function(){
            
            let deck = new Deck([1, 2, 3]);
            
            deck.discard(1);
            
            expect(deck.history()[0]).toEqual(3);
        });
        
        it("honors n count removal", function(){
            
            let deck = new Deck([1, 2, 3]);
            
            deck.discard(3);
            
            expect(deck.history().length).toBe(3);
        });
        
        it("accepts foreign objects", function(){
            
            let deck = new Deck([1]);
            
            deck.discard({mask: 64});
            
            expect(deck.history()[0]).toEqual({mask: 64});
        });

        //note: the return codes are not used anywhere, but the next card game will most likely need this
        it("then utilizes return codes", function(){
            
            let deck = new Deck([1]);
            expect(deck.discard(1)).toBe(1);
            expect(deck.discard(1)).toBe(0);
            expect(deck.discard({mask: 64})).toBe(2);
        });
        
    });

    //note: currently discard history is the only relevant history. banish may become relevant later
    describe("when viewing discard history", function(){

        it("returns all cards in the discarded pile", function(){
            
            let deck = new Deck([1, 2, 3]);
            deck.discard(3);
            expect(deck.history().toString()).toEqual("3,2,1");
        });
        
        it("respects filter by user", function(){
            
            let deck = new Deck([{user: "vu"}, {user: "ross"}, {user: "vu"}]);
            deck.discard(3);
            expect(deck.history("vu").length).toBe(2);
        });

        it("respects filter inversion", function(){
            
            let deck = new Deck([{user: "vu"}, {user: "ross"}, {user: "vu"}]);
            deck.discard(3);
            expect(deck.history("ross", true).length).toBe(2);
        });
        
    });

        
    //note: another function can be used to preserve history. 
    //Deck.reset is a hard reset where we don't care about the lost data, 
    //we just want the original state back
    describe("when reset", function(){

        it("purges the discarded pile", function(){
            
            let deck = new Deck([1, 2, 3]);
            deck.discard(3);
            deck.reset();
            expect(deck.discarded.length).toBe(0);
        });
        
        it("purges the banished pile", function(){
            
            let deck = new Deck([1, 2, 3]);
            deck.banish(3);
            deck.reset();
            expect(deck.banished.length).toBe(0);
        });
        
        it("restores the originals to pile", function(){
            
            let deck = new Deck([9]);
            deck.banish(1);
            deck.reset();
            expect(deck.pile[0]).toBe(9);
        });
        
        it("then shuffles originals", function(){
            
            let deck = new Deck([9,8,7,6,5,4,3,2,1,0]);
            deck.reset();
            expect(deck.pile.toString()).not.toBe("9,8,7,6,5,4,3,2,1,0");
        });
    });

    //note: this scenario does not exist yet
    describe("when placing card on top of deck", function(){

        it("then expect that card to be drawn next", function(){
            
            let deck = new Deck([1, 2, 3]);
            deck.top(4);
            expect(deck.draw()).toBe(4);
        });
    });
});