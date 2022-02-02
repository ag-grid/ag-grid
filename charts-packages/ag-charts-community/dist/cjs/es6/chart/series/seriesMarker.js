"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const observable_1 = require("../../util/observable");
const circle_1 = require("../marker/circle");
class SeriesMarker extends observable_1.Observable {
    constructor() {
        super(...arguments);
        this.enabled = true;
        /**
         * One of the predefined marker names, or a marker constructor function (for user-defined markers).
         * A series will create one marker instance per data point.
         */
        this.shape = circle_1.Circle;
        this.size = 6;
        /**
         * In case a series has the `sizeKey` set, the `sizeKey` values along with the `size` and `maxSize` configs
         * will be used to determine the size of the marker. All values will be mapped to a marker size
         * within the `[size, maxSize]` range, where the largest values will correspond to the `maxSize`
         * and the lowest to the `size`.
         */
        this.maxSize = 30;
        this.strokeWidth = 1;
    }
}
__decorate([
    observable_1.reactive('change')
], SeriesMarker.prototype, "enabled", void 0);
__decorate([
    observable_1.reactive('change')
], SeriesMarker.prototype, "shape", void 0);
__decorate([
    observable_1.reactive('change')
], SeriesMarker.prototype, "size", void 0);
__decorate([
    observable_1.reactive('change')
], SeriesMarker.prototype, "maxSize", void 0);
__decorate([
    observable_1.reactive('change')
], SeriesMarker.prototype, "domain", void 0);
__decorate([
    observable_1.reactive('change')
], SeriesMarker.prototype, "fill", void 0);
__decorate([
    observable_1.reactive('change')
], SeriesMarker.prototype, "stroke", void 0);
__decorate([
    observable_1.reactive('change')
], SeriesMarker.prototype, "strokeWidth", void 0);
__decorate([
    observable_1.reactive('change')
], SeriesMarker.prototype, "fillOpacity", void 0);
__decorate([
    observable_1.reactive('change')
], SeriesMarker.prototype, "strokeOpacity", void 0);
exports.SeriesMarker = SeriesMarker;
//# sourceMappingURL=seriesMarker.js.map