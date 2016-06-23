"use strict";

var root = process.cwd();
var ai = require(`${root}/src/ai`);
var t = require(`${root}/src/tool`);

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

    describe("when thinking about the best choice", function(){

        const tar_self = 1;
        const tar_foe = 2;

        const guard = 1;
        const priest = 2;

        it("does not think about invalid targets", function(){
            let gameState = [
                {
                    uuid: "me",
                    t: tar_self,
                    isImmune: false,
                    m: [
                        [0, 0],
                        [0, 0],
                        [0, 0]
                    ]
                }
            ];

            let myHand = [
                {mask: priest, perk: "spy" }
            ];

            let myIdeals = {
                "spy": {
                    t: 2,
                    m: [[-1, 2],
                        [128, 32],
                        [3, 8]
                    ]
                }
            };

            expect(ai.think(gameState, t.toMind(myHand, myIdeals))).toEqual([]);
        });

        it("does not think about immune* targets", function(){
            //note*: there is a difference. The immune player has an effect that makes them safe for targeting.

            let gameState = [
                {
                    uuid: "foe",
                    t: tar_foe,
                    isImmune: true,
                    m: [
                        [0, 0],
                        [0, 0],
                        [0, 0]
                    ]
                }
            ];

            let myHand = [
                {mask: priest, perk: "spy" }
            ];

            let myIdeals = {
                "spy": {
                    t: 2,
                    m: [[-1, 2],
                        [128, 32],
                        [3, 8]
                    ]
                }
            };

            expect(ai.think(gameState, t.toMind(myHand, myIdeals))).toEqual([]);
        });

        it("orders thoughts by lowest risk first", function(){
            let gameState = [
                {
                    uuid: "foe",
                    t: tar_foe,
                    isImmune: false,
                    inPlay: true,
                    m: [
                        [0, 0],
                        [3, 32],
                        [0, 0]
                    ]
                }
            ];

            let myHand = [
                {mask: priest, perk: "spy" },
                {mask: guard, perk: "accuse" }
            ];

            let myIdeals = {
                "accuse": {
                    t: 2,
                    m: [[-1, 2],
                        [128, 32],
                        [3, 8]
                    ]
                },
                "spy": {
                    t: 2,
                    m: [
                        [2, -1],
                        [53, 127],
                        [-1, -1]
                    ]
                }
            };

            let thoughts = ai.think(gameState, t.toMind(myHand, myIdeals));

            expect(thoughts[0].risk).toBeLessThan(thoughts[1].risk);
        });
    });
});