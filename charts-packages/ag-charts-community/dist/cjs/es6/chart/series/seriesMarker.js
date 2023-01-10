"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeriesMarker = void 0;
const marker_1 = require("../marker/marker");
const circle_1 = require("../marker/circle");
const changeDetectable_1 = require("../../scene/changeDetectable");
const validation_1 = require("../../util/validation");
const MARKER_SHAPES = ['circle', 'cross', 'diamond', 'heart', 'plus', 'square', 'triangle'];
const MARKER_SHAPE = validation_1.predicateWithMessage((v) => MARKER_SHAPES.includes(v) || Object.getPrototypeOf(v) === marker_1.Marker, `expecting a marker shape keyword such as 'circle', 'diamond' or 'square' or an object extending the Marker class`);
class SeriesMarker extends changeDetectable_1.ChangeDetectable {
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
        this.domain = undefined;
        this.fill = undefined;
        this.stroke = undefined;
        this.strokeWidth = 1;
        this.fillOpacity = undefined;
        this.strokeOpacity = undefined;
    }
}
__decorate([
    validation_1.ValidateAndChangeDetection({
        validatePredicate: validation_1.BOOLEAN,
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], SeriesMarker.prototype, "enabled", void 0);
__decorate([
    validation_1.ValidateAndChangeDetection({
        validatePredicate: MARKER_SHAPE,
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], SeriesMarker.prototype, "shape", void 0);
__decorate([
    validation_1.ValidateAndChangeDetection({
        validatePredicate: validation_1.NUMBER(0),
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], SeriesMarker.prototype, "size", void 0);
__decorate([
    validation_1.ValidateAndChangeDetection({
        validatePredicate: validation_1.NUMBER(0),
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], SeriesMarker.prototype, "maxSize", void 0);
__decorate([
    validation_1.ValidateAndChangeDetection({
        validatePredicate: validation_1.OPT_NUMBER_ARRAY,
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], SeriesMarker.prototype, "domain", void 0);
__decorate([
    validation_1.ValidateAndChangeDetection({
        validatePredicate: validation_1.OPT_COLOR_STRING,
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], SeriesMarker.prototype, "fill", void 0);
__decorate([
    validation_1.ValidateAndChangeDetection({
        validatePredicate: validation_1.OPT_COLOR_STRING,
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], SeriesMarker.prototype, "stroke", void 0);
__decorate([
    validation_1.ValidateAndChangeDetection({
        validatePredicate: validation_1.OPT_NUMBER(0),
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], SeriesMarker.prototype, "strokeWidth", void 0);
__decorate([
    validation_1.ValidateAndChangeDetection({
        validatePredicate: validation_1.OPT_NUMBER(0, 1),
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], SeriesMarker.prototype, "fillOpacity", void 0);
__decorate([
    validation_1.ValidateAndChangeDetection({
        validatePredicate: validation_1.OPT_NUMBER(0, 1),
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], SeriesMarker.prototype, "strokeOpacity", void 0);
exports.SeriesMarker = SeriesMarker;
