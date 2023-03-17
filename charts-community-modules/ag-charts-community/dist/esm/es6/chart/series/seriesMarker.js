var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Marker } from '../marker/marker';
import { Circle } from '../marker/circle';
import { ChangeDetectable, RedrawType, SceneChangeDetection } from '../../scene/changeDetectable';
import { BOOLEAN, NUMBER, OPT_COLOR_STRING, OPT_NUMBER, OPT_NUMBER_ARRAY, predicateWithMessage, Validate, } from '../../util/validation';
const MARKER_SHAPES = ['circle', 'cross', 'diamond', 'heart', 'plus', 'square', 'triangle'];
const MARKER_SHAPE = predicateWithMessage((v) => MARKER_SHAPES.includes(v) || Object.getPrototypeOf(v) === Marker, `expecting a marker shape keyword such as 'circle', 'diamond' or 'square' or an object extending the Marker class`);
export class SeriesMarker extends ChangeDetectable {
    constructor() {
        super(...arguments);
        this.enabled = true;
        /**
         * One of the predefined marker names, or a marker constructor function (for user-defined markers).
         * A series will create one marker instance per data point.
         */
        this.shape = Circle;
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
    Validate(BOOLEAN),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], SeriesMarker.prototype, "enabled", void 0);
__decorate([
    Validate(MARKER_SHAPE),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], SeriesMarker.prototype, "shape", void 0);
__decorate([
    Validate(NUMBER(0)),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], SeriesMarker.prototype, "size", void 0);
__decorate([
    Validate(NUMBER(0)),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], SeriesMarker.prototype, "maxSize", void 0);
__decorate([
    Validate(OPT_NUMBER_ARRAY),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], SeriesMarker.prototype, "domain", void 0);
__decorate([
    Validate(OPT_COLOR_STRING),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], SeriesMarker.prototype, "fill", void 0);
__decorate([
    Validate(OPT_COLOR_STRING),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], SeriesMarker.prototype, "stroke", void 0);
__decorate([
    Validate(OPT_NUMBER(0)),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], SeriesMarker.prototype, "strokeWidth", void 0);
__decorate([
    Validate(OPT_NUMBER(0, 1)),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], SeriesMarker.prototype, "fillOpacity", void 0);
__decorate([
    Validate(OPT_NUMBER(0, 1)),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], SeriesMarker.prototype, "strokeOpacity", void 0);
