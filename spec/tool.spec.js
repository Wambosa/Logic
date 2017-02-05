"use strict";

const tool = require('../src/tool');
const Deck = require('../src/deck');
const Player = require('../src/player');

describe("the helper tool", function(){

    describe("when generating a random number", function(){

        it("accepts an upper boundary by default", function(){
            expect(typeof tool.random(9000)).toBe('number');
        });

        it("honors max bounds", function(){
            expect(tool.random(1)).toBeLessThan(2);
        });

        it("honors min bounds", function(){
            expect(tool.random(3, 2)).toBeGreaterThan(1);
        });

        it("honors min/max range bounds", function(){
            expect(tool.random(9000, 9000)).toEqual(9000);
        });
    });

    describe("when simplify-ing an object array", function(){

        it("reduces to the mask property by default", function(){

            let arr = [
                {name: "broli", mask: 1},
                {name: "raditz", mask: 1},
                {name: "nappa", mask: 2}
            ];

            expect(tool.simplify(arr)).toEqual([1,1,2]);
        });

        it("reduces to the specified property if given", function(){

            let arr = [
                {name: "broli", m: 1},
                {name: "raditz", m: 1},
                {name: "nappa", m: 2}
            ];

            expect(tool.simplify(arr, 'm')).toEqual([1,1,2]);
        });
    });

    describe("when de-duplicating object arrays", function(){

        it("does not taint the original array reference", function(){
            let cards = [
                {name: "goku", mask: 1},
                {name: "ssj goku", mask: 1},
                {name: "vegeta", mask: 2}
            ];

            tool.dedup(cards);

            expect(cards.length).toBe(3);
        });

        it("sorts properly before de-duplicatin", function(){
            let cards = [
                {name: "saibaman", mask: 1},
                {name: "saibaman", mask: 2},
                {name: "saibaman", mask: 1}
            ];

            expect(tool.dedup(cards)).toEqual(cards.splice(0,2));
        });

        it("de-duplicates mask property by default", function(){
            let cards = [
                {name: "goku", mask: 1},
                {name: "ssj goku", mask: 1},
                {name: "vegeta", mask: 2}
            ];

            expect(tool.dedup(cards).length).toBe(2);
        });

        it("de-duplicates specified property if given", function(){
            let cards = [
                {name: "cooler", mask: 1},
                {name: "frieza", mask: 1},
                {name: "frieza", mask: 1}
            ];

            expect(tool.dedup(cards, 'name').length).toBe(2);
        });

        it("returns same array format", function(){
            let cards = [
                {name: "goku", mask: 1},
                {name: "goku", mask: 1},
                {name: "vegeta", mask: 2}
            ];

            expect(tool.dedup(cards)).toEqual(cards.splice(1,2));
        });
    });

    describe("when converting complex list toMask", function(){

        it("returns a whole number (bitMask)", function(){
            let cards = [
                {name: "janemba", mask: 1},
                {name: "bojack", mask: 1},
                {name: "android13", mask: 2}
            ];

            expect(tool.toMask(cards) % 1).toBe(0);
        });

        it("always de-duplicates", function(){
            let cards = [
                {name: "janemba", mask: 1},
                {name: "bojack", mask: 1},
                {name: "android13", mask: 2}
            ];

            //spyOn(tool, 'dedup'); //this breaks the test :(
            //expect(tool.dedup).toHaveBeenCalled();

            expect(tool.toMask(cards)).toBe(3);
        });

        it("converts a single item", function(){
            let cards = [
                {name: "janemba", mask: 128}
            ];

            expect(tool.toMask(cards)).toBe(128);
        });
    });

    describe("when shuffling an object array", function(){

        it("does not remove items from the new list", function(){
            let cards = [
                {name: "goku"},
                {name: "yamcha"},
                {name: "krillin"}
            ];

            let playPile = tool.shuffle(cards);

            function quickFind(arr, name){
                return arr.find(function(c){
                    return c.name == name;
                });
            }

            let isGokuThere = !!quickFind(playPile, 'goku');
            let isYamchaThere = !!quickFind(playPile, 'yamcha');
            let isKrillinThere = !!quickFind(playPile, 'krillin');

            expect(true == isGokuThere == isYamchaThere == isKrillinThere).toBeTruthy();
        });

        it("does not taint the original array reference", function(){
            let cards = [
                {name: "goku"},
                {name: "yamcha"},
                {name: "krillin"},
                {name: "vegeta"},
                {name: "roshi"},
                {name: "bulma"},
                {name: "launch"},
                {name: "turtle"},
                {name: "korin"},
                {name: "piccolo"}
            ];

            let playPile = tool.shuffle(cards);
            playPile.push({name:"taint!"});

            expect(cards[10]).toBeFalsy();
        });

        it("does not remove items from the original list", function(){
            let cards = [
                {name: "goku"},
                {name: "yamcha"},
                {name: "krillin"},
                {name: "vegeta"},
                {name: "roshi"}
            ];

            let playPile = tool.shuffle(cards);

            expect(cards.length).toBe(playPile.length);
        });
    });

    //note: this format is still a work in progress
    // i suspect that this will take an even more generic flat form later on
    // especially considering the uuid can be converted back to bitmask form
    describe("when mapping hand to choice list format", function(){
        
        it("then expected properties are returned", function(){
            
            let hand = [{perk: 'power'}];
            
            let ideals = {
                "power": {
                    mask: 0,
                    t: 2,
                    m: [[-1, 2],
                        [128, 32],
                        [3, 8]
                    ]
                }
            };
            
            let choices = tool.toChoice(hand, ideals);
            
            expect(choices[0].uuid).toBeTruthy();
            expect(choices[0].t).toBeTruthy();
            expect(choices[0].m.length).toBeTruthy();
        });
    });
    
    describe("when finding an object by property from a list", function(){
        
        it("then returns falsy on failure", function(){
            
            let list = [
                {name: "vu"}
            ];
            
            expect(tool.find(list, "name", "ross")).toBeFalsy();
        });
        
        it("then returns a reference of the object", function(){
            
            let list = [
                {name: "vu"},
                {name: "ross"}
            ];
            
            tool.find(list, "name", "vu").status = "M.I.A.";
            
            expect(list[0].status).toBe("M.I.A.");
        });
    });
    
    describe("given tool.drawFrom is binded to a Player", function(){
        
        describe("when Player action draw() is called", function(){
            
            it("then cards are taken from Deck.pile", function(){
               
               let deck = new Deck([3,4,5]);
               
               let player = new Player("vugeta").configure([{
                   name: "draw", func: tool.drawFrom(deck)
               }]);
               
               player.draw();
               
               expect(deck.pile.length).toBe(2);
            });
            
            it("then cards are added to Player.hand", function(){
               let deck = new Deck([3,4,5]);
        
               let player = new Player("vugeta").configure([
                    {name: "draw", func: tool.drawFrom(deck)}
                ]);
               
               player.draw();
               expect(player.hand[0]).toBe(5);
            });
            
            it("then only 1 card is drawn", function(){
               let deck = new Deck([3,4,5]);
        
               let player = new Player("vugeta").configure([
                    {name: "draw", func: tool.drawFrom(deck)}
                ]);
               
               player.draw(2);
               expect(player.hand.length).toBe(1);
            });            
        });
    });
    
    describe("given tool.discardTo is binded to a Player", function(){
       
       describe("when Player action discard() is called", function(){
           
           it("then cards are taken from Player.hand", function(){
               
                let deck = new Deck([1]);
               
                let player = new Player("vugeta", [{mask: 4}]).configure([
                    {name: "discard", func: tool.discardTo(deck)}
                ]);
                
                player.discard();
                
                expect(player.hand.length).toBeFalsy();
           });

           it("then cards are placed in Deck.discarded", function(){
               
                let deck = new Deck([1]);
               
                let player = new Player("vugeta", [{mask: 4}]).configure([
                    {name: "discard", func: tool.discardTo(deck)}
                ]);
                
                player.discard();
                
                expect(deck.history()[0]).toEqual({user: "vugeta", mask: 4});
           });
           
            it("then only the top 1 card is discarded", function(){
               
                let deck = new Deck([1]);
               
                let player = new Player("vugeta", [{mask: 4}, {mask: 8}]).configure([
                    {name: "discard", func: tool.discardTo(deck)}
                ]);
                
                player.discard(2);
                
                expect(deck.history().length).toBe(1);
                expect(deck.history()[0]).toEqual({user: "vugeta", mask: 8});
           });
           
           
       });
    });

});