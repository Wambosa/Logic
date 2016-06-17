//later: these ideals will be some kind of datasource stored elsewhere in a nosql or json
// these factors can be altered to optimization over iterations of play

var tool = require('./tool');

const guard = 1;
const priest = 2;
const baron = 4;
const handmaiden = 8;
const prince = 16;
const king = 32;
const countess = 64;
const princess = 128;

module.exports = {
    ideals: {
        shon: {
            "accuse": {
                mask: guard,
                t: 2,
                m: [[-1, 2],
                    [128, 32],
                    [3, 8]
                ]
            },
            "spy": {
                mask: priest,
                t: 2,
                m: [
                    [2, -1],
                    [53, 127],
                    [-1, -1]
                ]
            },
            "debate": {
                mask: baron,
                t: 2,
                m: [
                    [2, -1],
                    [240, 15],
                    [3, 8]
                ]
            },
            "protect": {
                mask: handmaiden,
                t: 1,
                m: [
                    [0, 0],
                    [192, 0],
                    [-1, -1]
                ]
            },
            "policy": {
                mask: prince,
                t: 3,
                m: [
                    [0, 2],
                    [99, 224],
                    [3, 8]
                ]
            },
            "mandate": {
                mask: king,
                t: 2,
                m: [
                    [2, -1],
                    [6, 208],
                    [3, 8]
                ]
            },
            "subvert":{
                mask: countess,
                t: 1,
                m: [
                    [2, 0],
                    [48, 49],
                    [0, 0]
                ]
            },
            "favor": {
                mask: princess,
                t: 1,
                m: [
                    [3, -1],
                    [0, 0],
                    [4, 16]
                ]
            }
        },
        atlas: {
            "accuse": {
                mask: guard,
                t: 2,
                m: [[0, 0],
                    [128, 32],
                    [3, 8]
                ]
            },
            "spy": {
                mask: priest,
                t: 2,
                m: [
                    [0, 0],
                    [53, 127],
                    [-1, -1]
                ]
            },
            "debate": {
                mask: baron,
                t: 2,
                m: [
                    [0, 0],
                    [240, 15],
                    [3, 8]
                ]
            },
            "protect": {
                mask: handmaiden,
                t: 1,
                m: [
                    [0, 0],
                    [192, 0],
                    [-1, -1]
                ]
            },
            "policy": {
                mask: prince,
                t: 3,
                m: [
                    [0, 0],
                    [99, 224],
                    [3, 8]
                ]
            },
            "mandate": {
                mask: king,
                t: 2,
                m: [
                    [0, 0],
                    [6, 208],
                    [3, 8]
                ]
            },
            "subvert":{
                mask: countess,
                t: 1,
                m: [
                    [0, 0],
                    [48, 49],
                    [0, 0]
                ]
            },
            "favor": {
                mask: princess,
                t: 1,
                m: [
                    [0, 0],
                    [0, 0],
                    [4, 16]
                ]
            }
        },
        rand: {
            "accuse": {
                mask: guard,
                t: 2,
                m: [[tool.random(3,-1), tool.random(3,-1)],
                    [tool.random(128, 0), tool.random(128, 0)],
                    [tool.random(3, -1), tool.random(8, -1)]
                ]
            },
            "spy": {
                mask: priest,
                t: 2,
                m: [[tool.random(3,-1), tool.random(3,-1)],
                    [tool.random(128, 0), tool.random(128, 0)],
                    [tool.random(3, -1), tool.random(8, -1)]
                ]
            },
            "debate": {
                mask: baron,
                t: 2,
                m: [[tool.random(3,-1), tool.random(3,-1)],
                    [tool.random(128, 0), tool.random(128, 0)],
                    [tool.random(3, -1), tool.random(8, -1)]
                ]
            },
            "protect": {
                mask: handmaiden,
                t: 1,
                m: [[tool.random(3,-1), tool.random(3,-1)],
                    [tool.random(128, 0), tool.random(128, 0)],
                    [tool.random(3, -1), tool.random(8, -1)]
                ]
            },
            "policy": {
                mask: prince,
                t: 3,
                m: [[tool.random(3,-1), tool.random(3,-1)],
                    [tool.random(128, 0), tool.random(128, 0)],
                    [tool.random(3, -1), tool.random(8, -1)]
                ]
            },
            "mandate": {
                mask: king,
                t: 2,
                m: [[tool.random(3,-1), tool.random(3,-1)],
                    [tool.random(128, 0), tool.random(128, 0)],
                    [tool.random(3, -1), tool.random(8, -1)]
                ]
            },
            "subvert":{
                mask: countess,
                t: 1,
                m: [[tool.random(3,-1), tool.random(3,-1)],
                    [tool.random(128, 0), tool.random(128, 0)],
                    [tool.random(3, -1), tool.random(8, -1)]
                ]
            },
            "favor": {
                mask: princess,
                t: 1,
                m: [[tool.random(3,-1), tool.random(3,-1)],
                    [tool.random(128, 0), tool.random(128, 0)],
                    [tool.random(3, -1), tool.random(8, -1)]
                ]
            }
        },
        glen: {
            "accuse": {
                mask: guard,
                t: 2,
                m: [[-1, 2],
                    [128, 32],
                    [0, 0]
                ]
            },
            "spy": {
                mask: priest,
                t: 2,
                m: [
                    [2, -1],
                    [53, 127],
                    [0, 0]
                ]
            },
            "debate": {
                mask: baron,
                t: 2,
                m: [
                    [2, -1],
                    [240, 15],
                    [0, 0]
                ]
            },
            "protect": {
                mask: handmaiden,
                t: 1,
                m: [
                    [0, 0],
                    [192, 0],
                    [0, 0]
                ]
            },
            "policy": {
                mask: prince,
                t: 3,
                m: [
                    [0, 2],
                    [99, 224],
                    [0, 0]
                ]
            },
            "mandate": {
                mask: king,
                t: 2,
                m: [
                    [2, -1],
                    [6, 208],
                    [0, 0]
                ]
            },
            "subvert":{
                mask: countess,
                t: 1,
                m: [
                    [2, 0],
                    [48, 49],
                    [0, 0]
                ]
            },
            "favor": {
                mask: princess,
                t: 1,
                m: [
                    [3, -1],
                    [0, 0],
                    [0, 0]
                ]
            }
        }
    }
};