"use strict";

var root = process.cwd();
var ai = require(`${root}/src/ai`);

describe("the AI module", function(){

    describe("when speculating foeHand", function(){

        it("returns a whole number (bitMask)", function(){
            let deck = [
                {mask: 16},
                {mask: 1}
            ];

            let discard = [];

            let hand = [];

            let guess = ai.speculate(deck, discard, hand);

            expect(guess % 1).toBe(0);
        });

        it("removes discardPile and myHand from possible guess", function(){
            let deck = [
                {mask: 16},
                {mask: 64},
                {mask: 128}
            ];

            let discard = [
                {mask: 128}
            ];

            let hand = [
                {mask: 64}
            ];

            let guess = ai.speculate(deck, discard, hand);

            expect(guess).toEqual(16);
        });
    });

    describe("when computing the risk of an action", function(){

        const baseRisk = 10;

        it("then returns a number", function(){

            let target = [
                [0, 0],
                [0, 0],
                [0, 0]
            ];

            let action = [
                [0, 0],
                [0, 0],
                [0, 0]
            ];

            expect(typeof ai.computeRisk(target, action)).toBe('number');
        });

        it(`then has a base risk of ${baseRisk}`, function(){

            let target = [
                [0, 0],
                [0, 0],
                [0, 0]
            ];

            let action = [
                [0, 0],
                [0, 0],
                [0, 0]
            ];

            expect(ai.computeRisk(target, action)).toEqual(baseRisk);
        });

        it("then increase risk equal to the difference between actual & ideal wins", function(){

            let target = [
                [10, 7],
                [0, 0],
                [0, 0]
            ];

            let action = [
                [7, 10],
                [0, 0],
                [0, 0]
            ];

            expect(ai.computeRisk(target, action)).toEqual(baseRisk + 3 + 3);
        });

        it("then decrease risk if myHand is ideal", function(){

            let target = [
                [0, 0],
                [32, 0],
                [0, 0]
            ];

            let action = [
                [0, 0],
                [32, 0],
                [0, 0]
            ];

            expect(ai.computeRisk(target, action)).toBeLessThan(baseRisk);
        });

        it("then decrease risk if speculated foeHand is ideal", function(){

            let target = [
                [0, 0],
                [0, 128],
                [0, 0]
            ];

            let action = [
                [0, 0],
                [0, 128],
                [0, 0]
            ];

            expect(ai.computeRisk(target, action)).toBeLessThan(baseRisk);
        });

        xit("then decrease risk equivalent to the hamming weight * impact", function(){

            let target = [
                [0, 0],
                [0, 129],
                [0, 0]
            ];

            let action = [
                [0, 0],
                [0, 129],
                [0, 0]
            ];

            expect(ai.computeRisk(target, action)).toEqual(baseRisk - 2 - 2);
        });

        it("then increases risk equal to the difference between actual & ideal discard (known cards) ", function(){

            let target = [
                [0, 0],
                [0, 0],
                [1, 2]
            ];

            let action = [
                [0, 0],
                [0, 0],
                [3, 8]
            ];

            expect(ai.computeRisk(target, action)).toEqual(baseRisk + 2 + 6);
        });

        it("then expect ideal factors equalling zero to be ignored", function(){
            let target = [
                [2, 2],
                [32, 8],
                [1, 2]
            ];

            let action = [
                [0, 0],
                [0, 0],
                [0, 0]
            ];

            expect(ai.computeRisk(target, action)).toEqual(baseRisk);
        });
    });
});