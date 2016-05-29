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

});