"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegend = exports.registerLegend = void 0;
var legend_1 = require("../legend");
var LEGEND_FACTORIES = {
    category: legend_1.Legend,
};
function registerLegend(type, ctr) {
    if (LEGEND_FACTORIES[type]) {
        throw new Error("AG Charts - already registered legend type: " + type);
    }
    LEGEND_FACTORIES[type] = ctr;
}
exports.registerLegend = registerLegend;
function getLegend(type, ctx) {
    if (LEGEND_FACTORIES[type]) {
        return new LEGEND_FACTORIES[type](ctx);
    }
    throw new Error("AG Charts - unknown legend type: " + type);
}
exports.getLegend = getLegend;
//# sourceMappingURL=legendTypes.js.map