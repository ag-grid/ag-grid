"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var square_1 = require("./square");
var circle_1 = require("./circle");
var cross_1 = require("./cross");
var diamond_1 = require("./diamond");
var heart_1 = require("./heart");
var plus_1 = require("./plus");
var triangle_1 = require("./triangle");
// This function is in its own file because putting it into SeriesMarker makes the Legend
// suddenly aware of the series (it's an agnostic component), and putting it into Marker
// introduces circular dependencies.
function getMarker(shape) {
    if (shape === void 0) { shape = square_1.Square; }
    if (typeof shape === 'string') {
        switch (shape) {
            case 'circle':
                return circle_1.Circle;
            case 'cross':
                return cross_1.Cross;
            case 'diamond':
                return diamond_1.Diamond;
            case 'heart':
                return heart_1.Heart;
            case 'plus':
                return plus_1.Plus;
            case 'triangle':
                return triangle_1.Triangle;
            default:
                return square_1.Square;
        }
    }
    if (typeof shape === 'function') {
        return shape;
    }
    return square_1.Square;
}
exports.getMarker = getMarker;
//# sourceMappingURL=util.js.map