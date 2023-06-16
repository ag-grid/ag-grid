"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHART_NAVIGATOR_MODULE = void 0;
var navigator_1 = require("../chart/navigator/navigator");
var module_1 = require("./module");
exports.CHART_NAVIGATOR_MODULE = {
    type: 'root',
    optionsKey: 'navigator',
    packageType: 'community',
    chartTypes: ['cartesian'],
    instanceConstructor: navigator_1.Navigator,
    themeTemplate: {
        navigator: {
            enabled: false,
            height: 30,
            mask: {
                fill: '#999999',
                stroke: '#999999',
                strokeWidth: 1,
                fillOpacity: 0.2,
            },
            minHandle: {
                fill: '#f2f2f2',
                stroke: '#999999',
                strokeWidth: 1,
                width: 8,
                height: 16,
                gripLineGap: 2,
                gripLineLength: 8,
            },
            maxHandle: {
                fill: '#f2f2f2',
                stroke: '#999999',
                strokeWidth: 1,
                width: 8,
                height: 16,
                gripLineGap: 2,
                gripLineLength: 8,
            },
        },
    },
};
module_1.registerModule(exports.CHART_NAVIGATOR_MODULE);
//# sourceMappingURL=navigator-module.js.map