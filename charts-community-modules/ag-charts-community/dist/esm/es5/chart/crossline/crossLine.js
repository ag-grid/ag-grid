var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { PointerEvents } from '../../scene/node';
import { Group } from '../../scene/group';
import { Text } from '../../scene/shape/text';
import { ContinuousScale } from '../../scale/continuousScale';
import { createId } from '../../util/id';
import { ChartAxisDirection } from '../chartAxisDirection';
import { labeldDirectionHandling, POSITION_TOP_COORDINATES, calculateLabelTranslation, calculateLabelChartPadding, } from './crossLineLabelPosition';
import { checkDatum } from '../../util/value';
import { Layers } from '../layers';
import { Range } from '../../scene/shape/range';
import { OPT_ARRAY, OPT_BOOLEAN, OPT_NUMBER, OPT_STRING, OPT_COLOR_STRING, STRING, Validate, OPT_LINE_DASH, OPT_FONT_STYLE, OPT_FONT_WEIGHT, NUMBER, OPTIONAL, predicateWithMessage, } from '../../util/validation';
import { calculateLabelRotation } from '../label';
var CROSSLINE_LABEL_POSITIONS = [
    'top',
    'left',
    'right',
    'bottom',
    'topLeft',
    'topRight',
    'bottomLeft',
    'bottomRight',
    'inside',
    'insideLeft',
    'insideRight',
    'insideTop',
    'insideBottom',
    'insideTopLeft',
    'insideBottomLeft',
    'insideTopRight',
    'insideBottomRight',
];
var OPT_CROSSLINE_LABEL_POSITION = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, function (v) { return CROSSLINE_LABEL_POSITIONS.includes(v); }); }, "expecting an optional crossLine label position keyword such as 'topLeft', 'topRight' or 'inside'");
var OPT_CROSSLINE_TYPE = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, function (v) { return v === 'range' || v === 'line'; }); }, "expecting a crossLine type keyword such as 'range' or 'line'");
var CrossLineLabel = /** @class */ (function () {
    function CrossLineLabel() {
        this.enabled = undefined;
        this.text = undefined;
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.fontSize = 14;
        this.fontFamily = 'Verdana, sans-serif';
        /**
         * The padding between the label and the line.
         */
        this.padding = 5;
        /**
         * The color of the labels.
         */
        this.color = 'rgba(87, 87, 87, 1)';
        this.position = undefined;
        this.rotation = undefined;
        this.parallel = undefined;
    }
    __decorate([
        Validate(OPT_BOOLEAN)
    ], CrossLineLabel.prototype, "enabled", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], CrossLineLabel.prototype, "text", void 0);
    __decorate([
        Validate(OPT_FONT_STYLE)
    ], CrossLineLabel.prototype, "fontStyle", void 0);
    __decorate([
        Validate(OPT_FONT_WEIGHT)
    ], CrossLineLabel.prototype, "fontWeight", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], CrossLineLabel.prototype, "fontSize", void 0);
    __decorate([
        Validate(STRING)
    ], CrossLineLabel.prototype, "fontFamily", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], CrossLineLabel.prototype, "padding", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING)
    ], CrossLineLabel.prototype, "color", void 0);
    __decorate([
        Validate(OPT_CROSSLINE_LABEL_POSITION)
    ], CrossLineLabel.prototype, "position", void 0);
    __decorate([
        Validate(OPT_NUMBER(-360, 360))
    ], CrossLineLabel.prototype, "rotation", void 0);
    __decorate([
        Validate(OPT_BOOLEAN)
    ], CrossLineLabel.prototype, "parallel", void 0);
    return CrossLineLabel;
}());
var CrossLine = /** @class */ (function () {
    function CrossLine() {
        this.id = createId(this);
        this.enabled = undefined;
        this.type = undefined;
        this.range = undefined;
        this.value = undefined;
        this.fill = undefined;
        this.fillOpacity = undefined;
        this.stroke = undefined;
        this.strokeWidth = undefined;
        this.strokeOpacity = undefined;
        this.lineDash = undefined;
        this.label = new CrossLineLabel();
        this.scale = undefined;
        this.clippedRange = [-Infinity, Infinity];
        this.gridLength = 0;
        this.sideFlag = -1;
        this.parallelFlipRotation = 0;
        this.regularFlipRotation = 0;
        this.direction = ChartAxisDirection.X;
        this.group = new Group({ name: "" + this.id, layer: true, zIndex: CrossLine.LINE_LAYER_ZINDEX });
        this.crossLineRange = new Range();
        this.crossLineLabel = new Text();
        this.labelPoint = undefined;
        this.data = [];
        this.startLine = false;
        this.endLine = false;
        this.isRange = false;
        var _a = this, group = _a.group, crossLineRange = _a.crossLineRange, crossLineLabel = _a.crossLineLabel;
        group.append([crossLineRange, crossLineLabel]);
        crossLineRange.pointerEvents = PointerEvents.None;
    }
    CrossLine.prototype.update = function (visible) {
        if (!this.enabled) {
            return;
        }
        this.group.visible = visible;
        if (!visible) {
            return;
        }
        var dataCreated = this.createNodeData();
        if (!dataCreated) {
            this.group.visible = false;
            return;
        }
        this.updateNodes();
        this.group.zIndex = this.getZIndex(this.isRange);
    };
    CrossLine.prototype.updateNodes = function () {
        this.updateRangeNode();
        if (this.label.enabled) {
            this.updateLabel();
            this.positionLabel();
        }
    };
    CrossLine.prototype.createNodeData = function () {
        var _a, _b, _c;
        var _d, _e;
        var _f = this, scale = _f.scale, gridLength = _f.gridLength, sideFlag = _f.sideFlag, direction = _f.direction, _g = _f.label.position, position = _g === void 0 ? 'top' : _g, clippedRange = _f.clippedRange, _h = _f.strokeWidth, strokeWidth = _h === void 0 ? 0 : _h;
        if (!scale) {
            return false;
        }
        var bandwidth = (_d = scale.bandwidth) !== null && _d !== void 0 ? _d : 0;
        var clippedRangeClamper = function (x) {
            return Math.max(Math.min.apply(Math, __spreadArray([], __read(clippedRange))), Math.min(Math.max.apply(Math, __spreadArray([], __read(clippedRange))), x));
        };
        var _j = __read([0, sideFlag * gridLength], 2), xStart = _j[0], xEnd = _j[1];
        var _k = __read(this.getRange(), 2), yStart = _k[0], yEnd = _k[1];
        var _l = __read([
            Number(scale.convert(yStart, { strict: false })),
            scale.convert(yEnd, { strict: false }) + bandwidth,
        ], 2), clampedYStart = _l[0], clampedYEnd = _l[1];
        clampedYStart = clippedRangeClamper(clampedYStart);
        clampedYEnd = clippedRangeClamper(clampedYEnd);
        _a = __read([Number(scale.convert(yStart)), scale.convert(yEnd) + bandwidth], 2), yStart = _a[0], yEnd = _a[1];
        var validRange = !isNaN(clampedYStart) &&
            !isNaN(clampedYEnd) &&
            (yStart === clampedYStart || yEnd === clampedYEnd || clampedYStart !== clampedYEnd) &&
            Math.abs(clampedYEnd - clampedYStart) > 0;
        if (validRange) {
            var reverse = clampedYStart !== Math.min(clampedYStart, clampedYEnd);
            if (reverse) {
                _b = __read([
                    Math.min(clampedYStart, clampedYEnd),
                    Math.max(clampedYStart, clampedYEnd),
                ], 2), clampedYStart = _b[0], clampedYEnd = _b[1];
                _c = __read([yEnd, yStart], 2), yStart = _c[0], yEnd = _c[1];
            }
        }
        this.isRange = validRange;
        this.startLine = !isNaN(yStart) && strokeWidth > 0 && yStart === clampedYStart;
        this.endLine = !isNaN(yEnd) && strokeWidth > 0 && yEnd === clampedYEnd;
        if (!validRange && !this.startLine && !this.endLine) {
            return false;
        }
        this.data = [clampedYStart, clampedYEnd];
        if (this.label.enabled) {
            var yDirection = direction === ChartAxisDirection.Y;
            var _m = ((_e = labeldDirectionHandling[position]) !== null && _e !== void 0 ? _e : {}).c, c = _m === void 0 ? POSITION_TOP_COORDINATES : _m;
            var _o = c({ yDirection: yDirection, xStart: xStart, xEnd: xEnd, yStart: clampedYStart, yEnd: clampedYEnd }), labelX = _o.x, labelY = _o.y;
            this.labelPoint = {
                x: labelX,
                y: labelY,
            };
        }
        return true;
    };
    CrossLine.prototype.updateRangeNode = function () {
        var _a;
        var _b = this, crossLineRange = _b.crossLineRange, sideFlag = _b.sideFlag, gridLength = _b.gridLength, data = _b.data, startLine = _b.startLine, endLine = _b.endLine, isRange = _b.isRange, fill = _b.fill, fillOpacity = _b.fillOpacity, stroke = _b.stroke, strokeWidth = _b.strokeWidth, lineDash = _b.lineDash;
        crossLineRange.x1 = 0;
        crossLineRange.x2 = sideFlag * gridLength;
        crossLineRange.y1 = data[0];
        crossLineRange.y2 = data[1];
        crossLineRange.startLine = startLine;
        crossLineRange.endLine = endLine;
        crossLineRange.isRange = isRange;
        crossLineRange.fill = fill;
        crossLineRange.fillOpacity = fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1;
        crossLineRange.stroke = stroke;
        crossLineRange.strokeWidth = strokeWidth !== null && strokeWidth !== void 0 ? strokeWidth : 1;
        crossLineRange.strokeOpacity = (_a = this.strokeOpacity) !== null && _a !== void 0 ? _a : 1;
        crossLineRange.lineDash = lineDash;
    };
    CrossLine.prototype.updateLabel = function () {
        var _a = this, crossLineLabel = _a.crossLineLabel, label = _a.label;
        if (!label.text) {
            return;
        }
        crossLineLabel.fontStyle = label.fontStyle;
        crossLineLabel.fontWeight = label.fontWeight;
        crossLineLabel.fontSize = label.fontSize;
        crossLineLabel.fontFamily = label.fontFamily;
        crossLineLabel.fill = label.color;
        crossLineLabel.text = label.text;
    };
    CrossLine.prototype.positionLabel = function () {
        var _a = this, crossLineLabel = _a.crossLineLabel, _b = _a.labelPoint, _c = _b === void 0 ? {} : _b, _d = _c.x, x = _d === void 0 ? undefined : _d, _e = _c.y, y = _e === void 0 ? undefined : _e, _f = _a.label, parallel = _f.parallel, rotation = _f.rotation, _g = _f.position, position = _g === void 0 ? 'top' : _g, _h = _f.padding, padding = _h === void 0 ? 0 : _h, direction = _a.direction, parallelFlipRotation = _a.parallelFlipRotation, regularFlipRotation = _a.regularFlipRotation;
        if (x === undefined || y === undefined) {
            return;
        }
        var _j = calculateLabelRotation({
            rotation: rotation,
            parallel: parallel,
            regularFlipRotation: regularFlipRotation,
            parallelFlipRotation: parallelFlipRotation,
        }), defaultRotation = _j.defaultRotation, configuredRotation = _j.configuredRotation;
        crossLineLabel.rotation = defaultRotation + configuredRotation;
        crossLineLabel.textBaseline = 'middle';
        crossLineLabel.textAlign = 'center';
        var bbox = this.computeLabelBBox();
        if (!bbox) {
            return;
        }
        var yDirection = direction === ChartAxisDirection.Y;
        var _k = calculateLabelTranslation({ yDirection: yDirection, padding: padding, position: position, bbox: bbox }), xTranslation = _k.xTranslation, yTranslation = _k.yTranslation;
        crossLineLabel.translationX = x + xTranslation;
        crossLineLabel.translationY = y + yTranslation;
    };
    CrossLine.prototype.getZIndex = function (isRange) {
        if (isRange === void 0) { isRange = false; }
        if (isRange) {
            return CrossLine.RANGE_LAYER_ZINDEX;
        }
        return CrossLine.LINE_LAYER_ZINDEX;
    };
    CrossLine.prototype.getRange = function () {
        var _a = this, value = _a.value, range = _a.range, scale = _a.scale;
        var isContinuous = scale instanceof ContinuousScale;
        var _b = __read(range !== null && range !== void 0 ? range : [value, undefined], 2), start = _b[0], end = _b[1];
        if (!isContinuous && end === undefined) {
            end = start;
        }
        start = checkDatum(start, isContinuous) != null ? start : undefined;
        end = checkDatum(end, isContinuous) != null ? end : undefined;
        if (isContinuous && start === end) {
            end = undefined;
        }
        if (start === undefined && end !== undefined) {
            start = end;
            end = undefined;
        }
        return [start, end];
    };
    CrossLine.prototype.computeLabelBBox = function () {
        return this.crossLineLabel.computeTransformedBBox();
    };
    CrossLine.prototype.calculatePadding = function (padding) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var _j = this, isRange = _j.isRange, startLine = _j.startLine, endLine = _j.endLine, direction = _j.direction, _k = _j.label, _l = _k.padding, labelPadding = _l === void 0 ? 0 : _l, _m = _k.position, position = _m === void 0 ? 'top' : _m;
        if (!isRange && !startLine && !endLine) {
            return;
        }
        var crossLineLabelBBox = this.computeLabelBBox();
        var labelX = crossLineLabelBBox === null || crossLineLabelBBox === void 0 ? void 0 : crossLineLabelBBox.x;
        var labelY = crossLineLabelBBox === null || crossLineLabelBBox === void 0 ? void 0 : crossLineLabelBBox.y;
        if (!crossLineLabelBBox || labelX == undefined || labelY == undefined) {
            return;
        }
        var chartPadding = calculateLabelChartPadding({
            yDirection: direction === ChartAxisDirection.Y,
            padding: labelPadding,
            position: position,
            bbox: crossLineLabelBBox,
        });
        padding.left = Math.max((_a = padding.left) !== null && _a !== void 0 ? _a : 0, (_b = chartPadding.left) !== null && _b !== void 0 ? _b : 0);
        padding.right = Math.max((_c = padding.right) !== null && _c !== void 0 ? _c : 0, (_d = chartPadding.right) !== null && _d !== void 0 ? _d : 0);
        padding.top = Math.max((_e = padding.top) !== null && _e !== void 0 ? _e : 0, (_f = chartPadding.top) !== null && _f !== void 0 ? _f : 0);
        padding.bottom = Math.max((_g = padding.bottom) !== null && _g !== void 0 ? _g : 0, (_h = chartPadding.bottom) !== null && _h !== void 0 ? _h : 0);
    };
    CrossLine.LINE_LAYER_ZINDEX = Layers.SERIES_CROSSLINE_LINE_ZINDEX;
    CrossLine.RANGE_LAYER_ZINDEX = Layers.SERIES_CROSSLINE_RANGE_ZINDEX;
    CrossLine.className = 'CrossLine';
    __decorate([
        Validate(OPT_BOOLEAN)
    ], CrossLine.prototype, "enabled", void 0);
    __decorate([
        Validate(OPT_CROSSLINE_TYPE)
    ], CrossLine.prototype, "type", void 0);
    __decorate([
        Validate(OPT_ARRAY(2))
    ], CrossLine.prototype, "range", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING)
    ], CrossLine.prototype, "fill", void 0);
    __decorate([
        Validate(OPT_NUMBER(0, 1))
    ], CrossLine.prototype, "fillOpacity", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING)
    ], CrossLine.prototype, "stroke", void 0);
    __decorate([
        Validate(OPT_NUMBER())
    ], CrossLine.prototype, "strokeWidth", void 0);
    __decorate([
        Validate(OPT_NUMBER(0, 1))
    ], CrossLine.prototype, "strokeOpacity", void 0);
    __decorate([
        Validate(OPT_LINE_DASH)
    ], CrossLine.prototype, "lineDash", void 0);
    return CrossLine;
}());
export { CrossLine };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvc3NMaW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2Nyb3NzbGluZS9jcm9zc0xpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFHOUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzlELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDM0QsT0FBTyxFQUVILHVCQUF1QixFQUN2Qix3QkFBd0IsRUFDeEIseUJBQXlCLEVBQ3pCLDBCQUEwQixHQUM3QixNQUFNLDBCQUEwQixDQUFDO0FBQ2xDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRW5DLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNoRCxPQUFPLEVBQ0gsU0FBUyxFQUNULFdBQVcsRUFDWCxVQUFVLEVBQ1YsVUFBVSxFQUNWLGdCQUFnQixFQUNoQixNQUFNLEVBQ04sUUFBUSxFQUNSLGFBQWEsRUFDYixjQUFjLEVBQ2QsZUFBZSxFQUNmLE1BQU0sRUFDTixRQUFRLEVBQ1Isb0JBQW9CLEdBQ3ZCLE1BQU0sdUJBQXVCLENBQUM7QUFFL0IsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRWxELElBQU0seUJBQXlCLEdBQUc7SUFDOUIsS0FBSztJQUNMLE1BQU07SUFDTixPQUFPO0lB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