"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const circle_1 = require("./circle");
const diamond_1 = require("./diamond");
const square_1 = require("./square");
function getMarker(shape) {
    switch (shape) {
        case 'circle':
            return circle_1.Circle;
        case 'square':
            return square_1.Square;
        case 'diamond':
            return diamond_1.Diamond;
        default:
            return circle_1.Circle;
    }
}
exports.getMarker = getMarker;
