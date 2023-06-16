"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHART_BACKGROUND_MODULE = void 0;
var background_1 = require("./background");
var module_1 = require("../../util/module");
exports.CHART_BACKGROUND_MODULE = {
    type: 'root',
    optionsKey: 'background',
    packageType: 'community',
    chartTypes: ['cartesian', 'polar', 'hierarchy'],
    instanceConstructor: background_1.Background,
};
module_1.registerModule(exports.CHART_BACKGROUND_MODULE);
//# sourceMappingURL=backgroundModule.js.map