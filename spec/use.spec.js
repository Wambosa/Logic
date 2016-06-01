"use strict";

var root = process.cwd();
var rewire = require('rewire');
var use = rewire(`${root}/src/use`);

describe("a cardUse instance", function(){

    describe("when removing peek knowledge", function(){

        let removePeek = use.__get__('removePeek');

        it("played card is taken away from all players", function(){

            let players = [
                {
                    peek: {
                        "goku": 64
                    }
                },
                {
                    peek: {
                        "vegeta": 32
                    }
                }
            ];

            removePeek(players, "goku", 64);

            expect(players[0].peek["goku"]).toBeFalsy();
        });

        it("does not remove peek knowledge if the known card is not played", function(){
            let players = [
                {
                    peek: {
                        "goku": 64
                    }
                },
                {
                    peek: {
                        "goku": 32
                    }
                }
            ];

            removePeek(players, "goku", 64);

            expect(players[1].peek["goku"]).toEqual(32);
        });
    });

    describe("when discarding card from my.hand", function(){

        let discard = use.__get__('discard');

        it("throws on failure", function(){

            let hand = [
                {mask: 1, perk: "accuse"},
                {mask: 2, perk: "spy"}
            ];

            expect(function(){discard(hand, {mask: 4, perk: "debate"})})
                .toThrow("FATAL: use.discard must NOT fail to remove a card from the hand.");
        });

        it("removes the specified card", function(){
            let hand = [
                {mask: 1, perk: "accuse"},
                {mask: 2, perk: "spy"}
            ];

            discard(hand, {mask: 1, perk: "accuse"});
            expect(hand[0]).toEqual({mask:2, perk: "spy"});
        });
    });

    describe("given the current player ACCUSEs a target foe", function(){

        it("when the guess is correct, then the target is taken out of play", function(){
            let gameState = [
                {
                    uuid: "goku",
                    m: [
                        [0, 0],
                        [3, 3],
                        [0, 0]
                    ]
                },
                {
                    uuid: "vegeta",
                    m: [
                        [0, 0],
                        [3, 128],
                        [0, 0]
                    ]
                }
            ];

            let players = [
                {
                    uuid: "goku",
                    inPlay: true, //todo:figure out if these bools belongs in gameState
                    isTurn: true,
                    hand: [
                        {mask: 1, perk: "accuse"},
                        {mask: 2, perk: "spy"}
                    ],
                    peek: {}
                },
                {
                    uuid: "vegeta",
                    inPlay: true,
                    hand: [
                        {mask: 128, perk: "favor"}
                    ],
                    peek: {}
                }
            ];

            let u = use.configure(gameState, players);

            let discard = u.accuse({
                risk: 0,
                target: "vegeta",
                action: "accuse"
            });

            expect(players[1].inPlay).toBeFalsy();
        });

        it("when peek knowledge is had, then peek knowledge is used", function(){
            let gameState = [
                {
                    uuid: "goku",
                    m: [
                        [0, 0],
                        [3, 3],
                        [0, 0]
                    ]
                },
                {
                    uuid: "vegeta",
                    m: [
                        [0, 0],
                        [3, 128],
                        [0, 0]
                    ]
                }
            ];

            let players = [
                {
                    uuid: "goku",
                    inPlay: true, //todo:figure out if these bools belongs in gameState
                    isTurn: true,
                    hand: [
                        {mask: 1, perk: "accuse"},
                        {mask: 2, perk: "spy"}
                    ],
                    peek: {
                        vegeta: 128
                    }
                },
                {
                    uuid: "vegeta",
                    inPlay: true,
                    hand: [
                        {mask: 128, perk: "favor"}
                    ],
                    peek: {}
                }
            ];

            let u = use.configure(gameState, players);

            let discard = u.accuse({
                risk: 0,
                target: "vegeta",
                action: "accuse"
            });

            expect(players[1].inPlay).toBeFalsy();
        });

        it("when the guess is GUARD, then the action fails to run", function(){
            let gameState = [
                {
                    uuid: "goku",
                    m: [
                        [0, 0],
                        [3, 3],
                        [0, 0]
                    ]
                },
                {
                    uuid: "vegeta",
                    m: [
                        [0, 0],
                        [3, 1],
                        [0, 0]
                    ]
                }
            ];

            let players = [
                {
                    uuid: "goku",
                    inPlay: true, //todo:figure out if these bools belongs in gameState
                    isTurn: true,
                    hand: [
                        {mask: 1, perk: "accuse"},
                        {mask: 2, perk: "spy"}
                    ],
                    peek: {}
                },
                {
                    uuid: "vegeta",
                    inPlay: true,
                    hand: [
                        {mask: 1, perk: "accuse"}
                    ],
                    peek: {}
                }
            ];

            let u = use.configure(gameState, players);

            let discard = u.accuse({
                risk: 0,
                target: "vegeta",
                action: "accuse"
            });

            expect(discard).toBeFalsy();
        });

        it("when the guess is wrong, then the target foe is still inPlay", function(){
            let gameState = [
                {
                    uuid: "goku",
                    m: [
                        [0, 0],
                        [3, 3],
                        [0, 0]
                    ]
                },
                {
                    uuid: "vegeta",
                    m: [
                        [0, 0],
                        [3, 64],
                        [0, 0]
                    ]
                }
            ];

            let players = [
                {
                    uuid: "goku",
                    inPlay: true, //todo:figure out if these bools belongs in gameState
                    isTurn: true,
                    hand: [
                        {mask: 1, perk: "accuse"},
                        {mask: 2, perk: "spy"}
                    ],
                    peek: {}
                },
                {
                    uuid: "vegeta",
                    inPlay: true,
                    hand: [
                        {mask: 128, perk: "favor"}
                    ],
                    peek: {}
                }
            ];

            let u = use.configure(gameState, players);

            let discard = u.accuse({
                risk: 0,
                target: "vegeta",
                action: "accuse"
            });

            expect(players[1].inPlay).toBeTruthy();
        });
    });


});