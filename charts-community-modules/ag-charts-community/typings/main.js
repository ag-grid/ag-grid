"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._ModuleSupport = exports._Util = exports._Scale = exports._Theme = exports._Scene = exports.Marker = exports.VERSION = exports.AgChart = exports.time = void 0;
// Documented APIs.
__exportStar(require("./chart/agChartOptions"), exports);
exports.time = require("./util/time/index");
var agChartV2_1 = require("./chart/agChartV2");
Object.defineProperty(exports, "AgChart", { enumerable: true, get: function () { return agChartV2_1.AgChart; } });
var version_1 = require("./version");
Object.defineProperty(exports, "VERSION", { enumerable: true, get: function () { return version_1.VERSION; } });
// Undocumented APIs used by examples.
var marker_1 = require("./chart/marker/marker");
Object.defineProperty(exports, "Marker", { enumerable: true, get: function () { return marker_1.Marker; } });
// Undocumented APIs used by Integrated Charts.
exports._Scene = require("./integrated-charts-scene");
exports._Theme = require("./integrated-charts-theme");
exports._Scale = require("./sparklines-scale");
exports._Util = require("./sparklines-util");
// Undocumented APIs used by Enterprise Modules.
exports._ModuleSupport = require("./module-support");
//# sourceMappingURL=main.js.map