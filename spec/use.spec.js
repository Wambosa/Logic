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

        it("returns the removed card", function(){
            let hand = [
                {mask: 64, perk: "subvert"},
                {mask: 32, perk: "mandate"}
            ];

            expect(discard(hand, {mask: 32, perk: "mandate"}))
                .toEqual({mask:32, perk: "mandate"});
        });

    });

    describe("given the player ACCUSEs a target foe", function(){

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

            u.accuse({
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

            u.accuse({
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

            u.accuse({
                risk: 0,
                target: "vegeta",
                action: "accuse"
            });

            expect(players[1].inPlay).toBeTruthy();
        });

        it("when completed successfully, returns the card played", function(){
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
                        [3, 4],
                        [0, 0]
                    ]
                }
            ];
            let players = [
                {
                    uuid: "goku",
                    inPlay: true,
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
                        {mask: 4, perk: "debate"}
                    ],
                    peek: {}
                }
            ];

            let u = use.configure(gameState, players);

            let discard = u.accuse({
                target: "vegeta",
                action: "accuse"
            });

            expect(discard).toEqual({mask:1, perk: "accuse"});
        });

        it("when called, implements unPeek", function(){
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
                        [3, 4],
                        [0, 0]
                    ]
                }
            ];
            let players = [
                {
                    uuid: "goku",
                    inPlay: true,
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
                        {mask: 4, perk: "debate"}
                    ],
                    peek: {
                        goku: 1
                    }
                }
            ];

            let u = use.configure(gameState, players);

            u.accuse({
                target: "vegeta",
                action: "accuse"
            });

            expect(players[1].peek["goku"]).toBeFalsy();
        });
    });

    describe("when player SPYs on target foe", function(){

        it("then update peek knowledge of target foe's hand", function(){

            let players = [
                {
                    uuid: "goku",
                    isTurn: true,
                    hand: [
                        {mask: 1, perk: "accuse"},
                        {mask: 2, perk: "spy"}
                    ],
                    peek: {}
                },
                {
                    uuid: "vegeta",
                    hand: [
                        {mask: 16, perk: "policy"}
                    ],
                    peek: {}
                }
            ];

            //todo: potentially reconsider merging gamestate with players? why did i keep them separate?
            let u = use.configure(null, players);

            u.spy({
                target: "vegeta",
                action: "spy"
            });

            expect(players[0].peek["vegeta"]).toEqual(16);
        });

        it("returns played card", function(){
            let players = [
                {
                    uuid: "goku",
                    isTurn: true,
                    hand: [
                        {mask: 1, perk: "accuse"},
                        {mask: 2, perk: "spy"}
                    ],
                    peek: {}
                },
                {
                    uuid: "vegeta",
                    hand: [
                        {mask: 16, perk: "policy"}
                    ],
                    peek: {}
                }
            ];

            let u = use.configure(null, players);

            let discard = u.spy({
                target: "vegeta",
                action: "spy"
            });

            expect(discard).toEqual({mask: 2, perk: "spy"});
        });

        it("when completed successfully, returns the card played", function(){

            let players = [
                {
                    uuid: "goku",
                    inPlay: true,
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
                        {mask: 4, perk: "debate"}
                    ],
                    peek: {}
                }
            ];

            let u = use.configure(null, players);

            let discard = u.spy({
                target: "vegeta",
                action: "spy"
            });

            expect(discard).toEqual({mask:2, perk: "spy"});
        });

        it("implements unPeek", function(){
            let players = [
                {
                    uuid: "goku",
                    isTurn: true,
                    hand: [
                        {mask: 1, perk: "accuse"},
                        {mask: 2, perk: "spy"}
                    ],
                    peek: {}
                },
                {
                    uuid: "vegeta",
                    hand: [
                        {mask: 16, perk: "policy"}
                    ],
                    peek: {
                        goku: 2
                    }
                }
            ];

            let u = use.configure(null, players);

            u.spy({
                target: "vegeta",
                action: "spy"
            });

            expect(players[1].peek["goku"]).toBeFalsy();
        });
    });

    describe("when player DEBATEs with target foe", function(){

        it("then the player's baron is NOT used in the comparison", function(){
            let players = [
                {
                    uuid: "goku",
                    isTurn: true,
                    inPlay: true,
                    hand: [
                        {mask: 1, perk: "accuse"},
                        {mask: 4, perk: "debate"}
                    ],
                    peek: {}
                },
                {
                    uuid: "vegeta",
                    inPlay: true,
                    hand: [
                        {mask: 2, perk: "spy"}
                    ],
                    peek: {
                        goku: 4
                    }
                }
            ];

            let u = use.configure(null, players);

            u.debate({
                target: "vegeta",
                action: "debate"
            });

            expect(players[0].inPlay).toBeFalsy();
        });

        it("then high card wins", function(){
            let players = [
                {
                    uuid: "goku",
                    isTurn: true,
                    inPlay: true,
                    hand: [
                        {mask: 16, perk: "policy"},
                        {mask: 4, perk: "debate"}
                    ],
                    peek: {}
                },
                {
                    uuid: "vegeta",
                    inPlay: true,
                    hand: [
                        {mask: 2, perk: "spy"}
                    ],
                    peek: {}
                }
            ];

            let u = use.configure(null, players);

            u.debate({
                target: "vegeta",
                action: "debate"
            });

            expect(players[1].inPlay).toBeFalsy();
        });

        it("then only one player survives if NOT a tie...", function(){
            let players = [
                {
                    uuid: "goku",
                    isTurn: true,
                    inPlay: true,
                    hand: [
                        {mask: 1, perk: "accuse"},
                        {mask: 4, perk: "debate"}
                    ],
                    peek: {}
                },
                {
                    uuid: "vegeta",
                    inPlay: true,
                    hand: [
                        {mask: 2, perk: "spy"}
                    ],
                    peek: {
                        goku: 4
                    }
                }
            ];

            let u = use.configure(null, players);

            u.debate({
                target: "vegeta",
                action: "debate"
            });

            expect(players[0].inPlay).not.toBe(players[1].inPlay);
        });

        it("then both player and foe survive if a tie...", function(){
            let players = [
                {
                    uuid: "goku",
                    isTurn: true,
                    inPlay: true,
                    hand: [
                        {mask: 2, perk: "spy"},
                        {mask: 4, perk: "debate"}
                    ],
                    peek: {}
                },
                {
                    uuid: "vegeta",
                    inPlay: true,
                    hand: [
                        {mask: 2, perk: "spy"}
                    ],
                    peek: {
                        goku: 4
                    }
                }
            ];

            let u = use.configure(null, players);

            u.debate({
                target: "vegeta",
                action: "debate"
            });

            expect(players[0].inPlay === true).toBe(players[1].inPlay);
        });

        it("when completed successfully, returns the card played", function(){

            let players = [
                {
                    uuid: "goku",
                    inPlay: true,
                    isTurn: true,
                    hand: [
                        {mask: 1, perk: "accuse"},
                        {mask: 4, perk: "debate"}
                    ],
                    peek: {}
                },
                {
                    uuid: "vegeta",
                    inPlay: true,
                    hand: [
                        {mask: 4, perk: "debate"}
                    ],
                    peek: {}
                }
            ];

            let u = use.configure(null, players);

            let discard = u.debate({
                target: "vegeta",
                action: "debate"
            });

            expect(discard).toEqual({mask:4, perk: "debate"});
        });

        it("implements unPeek", function(){
            let players = [
                {
                    uuid: "goku",
                    isTurn: true,
                    hand: [
                        {mask: 1, perk: "accuse"},
                        {mask: 4, perk: "debate"}
                    ],
                    peek: {}
                },
                {
                    uuid: "vegeta",
                    hand: [
                        {mask: 16, perk: "policy"}
                    ],
                    peek: {
                        goku: 4
                    }
                }
            ];

            let u = use.configure(null, players);

            //todo: only thing that the method does not know is the target. reconsider sending just the target uuid. const the action string in func
            u.debate({
                target: "vegeta",
                action: "debate"
            });

            expect(players[1].peek["goku"]).toBeFalsy();
        });
    });

    describe("when player PROTECTs self", function(){

        it("sets the immunity flag on self", function(){
            let players = [
                {
                    uuid: "goku",
                    inPlay: true,
                    isTurn: true,
                    hand: [
                        {mask: 1, perk: "accuse"},
                        {mask: 8, perk: "protect"}
                    ],
                    peek: {}
                }
            ];

            let u = use.configure(null, players);

            u.protect({
                target: "goku",
                action: "protect"
            });

            expect(players[0].isImmune).toBeTruthy();

        });

        it("when completed successfully, returns the card played", function(){

            let players = [
                {
                    uuid: "goku",
                    inPlay: true,
                    isTurn: true,
                    hand: [
                        {mask: 1, perk: "accuse"},
                        {mask: 8, perk: "protect"}
                    ],
                    peek: {}
                }
            ];

            let u = use.configure(null, players);

            let discard = u.protect({
                target: "goku",
                action: "protect"
            });

            expect(discard).toEqual({mask:8, perk: "protect"});
        });

        it("implements unPeek", function(){
            let players = [
                {
                    uuid: "goku",
                    isTurn: true,
                    hand: [
                        {mask: 1, perk: "accuse"},
                        {mask: 8, perk: "protect"}
                    ],
                    peek: {}
                },
                {
                    uuid: "vegeta",
                    hand: [
                        {mask: 16, perk: "policy"}
                    ],
                    peek: {
                        goku: 8
                    }
                }
            ];

            let u = use.configure(null, players);

            u.debate({
                target: "goku",
                action: "protect"
            });

            expect(players[1].peek["goku"]).toBeFalsy();
        });
    });

    describe("when player POLICYs target foe", function(){

        //todo: new Player(actions) needs a couple of functions(draw, discard) and knowledge of playPile and discardPile

        function Player(uuid, hand){
            var self = {};
            self.uuid = uuid;
            self.inPlay = true;
            self.hand = hand || [];
            self.peek = {};

            self.configure = function(actions){
                actions.forEach(function(a){
                    self[a.name] = a.func.bind(self);
                });
                return self;
            };

            return self;
        }

        var _ = require('ramda');

        var draw = _.curry(function(playPile){
            return function(){
                this.hand.push(playPile.pop());
            };
        });

        //note: only supports a single card discard
        var discard = _.curry(function(discardPile){
            return function() {
                discardPile.push(this.hand.pop());
            };
        });

        //todo: add this test to debate and accuse WHEN !target.inPlay
        it("then target player discards hand to discardPile", function(){

            let playPile = [];
            let discardPile = [];

            let actions = [
                {name: "draw", func: draw(playPile)},
                {name: "discard", func: discard(discardPile)}
            ];

            let players = [
                Player("goku", [{mask: 16, perk: "policy"}]).configure(actions),
                Player("vegeta", [{mask: 128, perk: "favor"}]).configure(actions)
            ];

            let u = use.configure(null, players);

            players[0].isTurn = true;
            u.policy({
                action: "policy",
                target: "vegeta"
            });

            expect(discardPile[0]).toEqual({mask: 128, perk: "favor"});
        });

        it("then target player draws a new card immediately", function(){

            let playPile = [{mask: 32, perk: "mandate"}];
            let discardPile = [];

            let actions = [
                {name: "draw", func: draw(playPile)},
                {name: "discard", func: discard(discardPile)}
            ];

            let players = [
                Player("goku", [{mask: 16, perk: "policy"}]).configure(actions),
                Player("vegeta", [{mask: 64, perk: "subvert"}]).configure(actions)
            ];

            let u = use.configure(null, players);

            players[0].isTurn = true;
            u.policy({
                action: "policy",
                target: "vegeta"
            });

            expect(players[1].hand[0]).toEqual({mask: 32, perk: "mandate"});
        });

        it("then target player's known card is removed from peek", function(){

            let playPile = [{mask: 32, perk: "mandate"}];
            let discardPile = [];

            let actions = [
                {name: "draw", func: draw(playPile)},
                {name: "discard", func: discard(discardPile)}
            ];

            let players = [
                Player("goku", [{mask: 16, perk: "policy"}]).configure(actions),
                Player("vegeta", [{mask: 128, perk: "favor"}]).configure(actions)
            ];

            let u = use.configure(null, players);

            players[0].isTurn = true;
            players[0].peek["vegeta"] = 128;

            u.policy({
                action: "policy",
                target: "vegeta"
            });

            expect(players[0].peek["vegeta"]).toBeFalsy();
        });

        it("then target player loses immediately if princess is discarded", function(){

            let playPile = [{mask: 32, perk: "mandate"}];
            let discardPile = [];

            let actions = [
                {name: "draw", func: draw(playPile)},
                {name: "discard", func: discard(discardPile)}
            ];

            let players = [
                Player("goku", [{mask: 16, perk: "policy"}]).configure(actions),
                Player("vegeta", [{mask: 128, perk: "favor"}]).configure(actions)
            ];

            let u = use.configure(null, players);

            players[0].isTurn = true;

            u.policy({
                action: "policy",
                target: "vegeta"
            });

            expect(players[1].inPlay).toBeFalsy();
        });

        it("then target player does not draw a replacement card if NOT inPlay", function(){

            let playPile = [{mask: 32, perk: "mandate"}];
            let discardPile = [];

            let actions = [
                {name: "draw", func: draw(playPile)},
                {name: "discard", func: discard(discardPile)}
            ];

            let players = [
                Player("goku", [{mask: 16, perk: "policy"}]).configure(actions),
                Player("vegeta", [{mask: 128, perk: "favor"}]).configure(actions)
            ];

            let u = use.configure(null, players);

            players[0].isTurn = true;

            u.policy({
                action: "policy",
                target: "vegeta"
            });

            expect(players[1].hand[0]).toBeFalsy();
        });
    });
});