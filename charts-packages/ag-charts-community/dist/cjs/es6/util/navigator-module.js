"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHART_NAVIGATOR_MODULE = void 0;
const navigator_1 = require("../chart/navigator/navigator");
const module_1 = require("./module");
exports.CHART_NAVIGATOR_MODULE = {
    optionsKey: 'navigator',
    chartTypes: ['cartesian'],
    initialiseModule(ctx) {
        return {
            instance: new navigator_1.Navigator(ctx),
        };
    },
};
module_1.registerModule(exports.CHART_NAVIGATOR_MODULE);
