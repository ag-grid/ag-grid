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
exports.Color = exports.ticks = exports.tickFormat = exports.extent = void 0;
__exportStar(require("./util/value"), exports);
__exportStar(require("./util/id"), exports);
__exportStar(require("./util/padding"), exports);
var array_1 = require("./util/array");
Object.defineProperty(exports, "extent", { enumerable: true, get: function () { return array_1.extent; } });
var numberFormat_1 = require("./util/numberFormat");
Object.defineProperty(exports, "tickFormat", { enumerable: true, get: function () { return numberFormat_1.tickFormat; } });
var ticks_1 = require("./util/ticks");
exports.ticks = ticks_1.default;
var color_1 = require("./util/color");
Object.defineProperty(exports, "Color", { enumerable: true, get: function () { return color_1.Color; } });
