"use strict";

var root = process.cwd();
var tool = require(`${root}/src/tool`);

describe("the helper tools", function(){

    describe("when generating a random number", function(){

        it("accepts an upper boundary by default", function(){
            expect(typeof tool.random(9000)).toBe('number');
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

            expect(typeof tool.toMask(cards)).toBe('number');
            expect(tool.toMask(cards) % 1).toBeFalsy();
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
    });

    describe("when shuffling an object array", function(){

        it("tool.random is implemented", function(){

            spyOn(tool, 'random');

            tool.shuffle([{a:"t"}, {a:"t"}]);

            expect(tool.random).toHaveBeenCalled();
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

            expect(cards).toNotEqual(playPile);
        });
    });
});