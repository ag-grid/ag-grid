"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarker = void 0;
var ag_charts_community_1 = require("ag-charts-community");
function getMarker(shape) {
    switch (shape) {
        case 'circle':
            return ag_charts_community_1._Scene.Circle;
        case 'square':
            return ag_charts_community_1._Scene.Square;
        case 'diamond':
            return ag_charts_community_1._Scene.Diamond;
        default:
            return ag_charts_community_1._Scene.Circle;
    }
}
exports.getMarker = getMarker;
