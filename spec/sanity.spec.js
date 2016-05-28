"use strict";
var root = process.cwd();

describe("The module.export", function(){

    describe("when calling a method with an object argument", function(){

        it("keeps a reference of the original object passed instead of cloning the object", function(){

            let gameState = {
                uuid: "vegeta",
                m: [
                    [0,1],
                    [1,0]
                ]
            };

            let sanity = require(`${root}/src/test-sanity`).configure(gameState);

            sanity.test(9000); //note: scary mutations

            expect(gameState.uuid).toBe(9000);
        });
    })
});