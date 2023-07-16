"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartesianCrossLine = void 0;
var node_1 = require("../../scene/node");
var group_1 = require("../../scene/group");
var text_1 = require("../../scene/shape/text");
var continuousScale_1 = require("../../scale/continuousScale");
var id_1 = require("../../util/id");
var chartAxisDirection_1 = require("../chartAxisDirection");
var crossLineLabelPosition_1 = require("./crossLineLabelPosition");
var value_1 = require("../../util/value");
var layers_1 = require("../layers");
var range_1 = require("../../scene/shape/range");
var validation_1 = require("../../util/validation");
var label_1 = require("../label");
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
var OPT_CROSSLINE_LABEL_POSITION = validation_1.predicateWithMessage(function (v, ctx) { return validation_1.OPTIONAL(v, ctx, function (v) { return CROSSLINE_LABEL_POSITIONS.includes(v); }); }, "expecting an optional crossLine label position keyword such as 'topLeft', 'topRight' or 'inside'");
var OPT_CROSSLINE_TYPE = validation_1.predicateWithMessage(function (v, ctx) { return validation_1.OPTIONAL(v, ctx, function (v) { return v === 'range' || v === 'line'; }); }, "expecting a crossLine type keyword such as 'range' or 'line'");
var CartesianCrossLineLabel = /** @class */ (function () {
    function CartesianCrossLineLabel() {
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
        validation_1.Validate(validation_1.OPT_BOOLEAN)
    ], CartesianCrossLineLabel.prototype, "enabled", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], CartesianCrossLineLabel.prototype, "text", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_STYLE)
    ], CartesianCrossLineLabel.prototype, "fontStyle", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_WEIGHT)
    ], CartesianCrossLineLabel.prototype, "fontWeight", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], CartesianCrossLineLabel.prototype, "fontSize", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], CartesianCrossLineLabel.prototype, "fontFamily", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], CartesianCrossLineLabel.prototype, "padding", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], CartesianCrossLineLabel.prototype, "color", void 0);
    __decorate([
        validation_1.Validate(OPT_CROSSLINE_LABEL_POSITION)
    ], CartesianCrossLineLabel.prototype, "position", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(-360, 360))
    ], CartesianCrossLineLabel.prototype, "rotation", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_BOOLEAN)
    ], CartesianCrossLineLabel.prototype, "parallel", void 0);
    return CartesianCrossLineLabel;
}());
var CartesianCrossLine = /** @class */ (function () {
    function CartesianCrossLine() {
        this.id = id_1.createId(this);
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
        this.label = new CartesianCrossLineLabel();
        this.scale = undefined;
        this.clippedRange = [-Infinity, Infinity];
        this.gridLength = 0;
        this.sideFlag = -1;
        this.parallelFlipRotation = 0;
        this.regularFlipRotation = 0;
        this.direction = chartAxisDirection_1.ChartAxisDirection.X;
        this.group = new group_1.Group({ name: "" + this.id, layer: true, zIndex: CartesianCrossLine.LINE_LAYER_ZINDEX });
        this.crossLineRange = new range_1.Range();
        this.crossLineLabel = new text_1.Text();
        this.labelPoint = undefined;
        this.data = [];
        this.startLine = false;
        this.endLine = false;
        this.isRange = false;
        var _a = this, group = _a.group, crossLineRange = _a.crossLineRange, crossLineLabel = _a.crossLineLabel;
        group.append([crossLineRange, crossLineLabel]);
        crossLineRange.pointerEvents = node_1.PointerEvents.None;
    }
    CartesianCrossLine.prototype.update = function (visible) {
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
    CartesianCrossLine.prototype.updateNodes = function () {
        this.updateRangeNode();
        if (this.label.enabled) {
            this.updateLabel();
            this.positionLabel();
        }
    };
    CartesianCrossLine.prototype.createNodeData = function () {
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
            var yDirection = direction === chartAxisDirection_1.ChartAxisDirection.Y;
            var _m = ((_e = crossLineLabelPosition_1.labeldDirectionHandling[position]) !== null && _e !== void 0 ? _e : {}).c, c = _m === void 0 ? crossLineLabelPosition_1.POSITION_TOP_COORDINATES : _m;
            var _o = c({ yDirection: yDirection, xStart: xStart, xEnd: xEnd, yStart: clampedYStart, yEnd: clampedYEnd }), labelX = _o.x, labelY = _o.y;
            this.labelPoint = {
                x: labelX,
                y: labelY,
            };
        }
        return true;
    };
    CartesianCrossLine.prototype.updateRangeNode = function () {
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
    CartesianCrossLine.prototype.updateLabel = function () {
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
    CartesianCrossLine.prototype.positionLabel = function () {
        var _a = this, crossLineLabel = _a.crossLineLabel, _b = _a.labelPoint, _c = _b === void 0 ? {} : _b, _d = _c.x, x = _d === void 0 ? undefined : _d, _e = _c.y, y = _e === void 0 ? undefined : _e, _f = _a.label, parallel = _f.parallel, rotation = _f.rotation, _g = _f.position, position = _g === void 0 ? 'top' : _g, _h = _f.padding, padding = _h === void 0 ? 0 : _h, direction = _a.direction, parallelFlipRotation = _a.parallelFlipRotation, regularFlipRotation = _a.regularFlipRotation;
        if (x === undefined || y === undefined) {
            return;
        }
        var _j = label_1.calculateLabelRotation({
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
        var yDirection = direction === chartAxisDirection_1.ChartAxisDirection.Y;
        var _k = crossLineLabelPosition_1.calculateLabelTranslation({ yDirection: yDirection, padding: padding, position: position, bbox: bbox }), xTranslation = _k.xTranslation, yTranslation = _k.yTranslation;
        crossLineLabel.translationX = x + xTranslation;
        crossLineLabel.translationY = y + yTranslation;
    };
    CartesianCrossLine.prototype.getZIndex = function (isRange) {
        if (isRange === void 0) { isRange = false; }
        if (isRange) {
            return CartesianCrossLine.RANGE_LAYER_ZINDEX;
        }
        return CartesianCrossLine.LINE_LAYER_ZINDEX;
    };
    CartesianCrossLine.prototype.getRange = function () {
        var _a = this, value = _a.value, range = _a.range, scale = _a.scale;
        var isContinuous = scale instanceof continuousScale_1.ContinuousScale;
        var _b = __read(range !== null && range !== void 0 ? range : [value, undefined], 2), start = _b[0], end = _b[1];
        if (!isContinuous && end === undefined) {
            end = start;
        }
        start = value_1.checkDatum(start, isContinuous) != null ? start : undefined;
        end = value_1.checkDatum(end, isContinuous) != null ? end : undefined;
        if (isContinuous && start === end) {
            end = undefined;
        }
        if (start === undefined && end !== undefined) {
            start = end;
            end = undefined;
        }
        return [start, end];
    };
    CartesianCrossLine.prototype.computeLabelBBox = function () {
        return this.crossLineLabel.computeTransformedBBox();
    };
    CartesianCrossLine.prototype.calculatePadding = function (padding) {
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
        var chartPadding = crossLineLabelPosition_1.calculateLabelChartPadding({
            yDirection: direction === chartAxisDirection_1.ChartAxisDirection.Y,
            padding: labelPadding,
            position: position,
            bbox: crossLineLabelBBox,
        });
        padding.left = Math.max((_a = padding.left) !== null && _a !== void 0 ? _a : 0, (_b = chartPadding.left) !== null && _b !== void 0 ? _b : 0);
        padding.right = Math.max((_c = padding.right) !== null && _c !== void 0 ? _c : 0, (_d = chartPadding.right) !== null && _d !== void 0 ? _d : 0);
        padding.top = Math.max((_e = padding.top) !== null && _e !== void 0 ? _e : 0, (_f = chartPadding.top) !== null && _f !== void 0 ? _f : 0);
        padding.bottom = Math.max((_g = padding.bottom) !== null && _g !== void 0 ? _g : 0, (_h = chartPadding.bottom) !== null && _h !== void 0 ? _h : 0);
    };
    CartesianCrossLine.LINE_LAYER_ZINDEX = layers_1.Layers.SERIES_CROSSLINE_LINE_ZINDEX;
    CartesianCrossLine.RANGE_LAYER_ZINDEX = layers_1.Layers.SERIES_CROSSLINE_RANGE_ZINDEX;
    CartesianCrossLine.className = 'CrossLine';
    __decorate([
        validation_1.Validate(validation_1.OPT_BOOLEAN)
    ], CartesianCrossLine.prototype, "enabled", void 0);
    __decorate([
        validation_1.Validate(OPT_CROSSLINE_TYPE)
    ], CartesianCrossLine.prototype, "type", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_ARRAY(2))
    ], CartesianCrossLine.prototype, "range", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], CartesianCrossLine.prototype, "fill", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0, 1))
    ], CartesianCrossLine.prototype, "fillOpacity", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], CartesianCrossLine.prototype, "stroke", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER())
    ], CartesianCrossLine.prototype, "strokeWidth", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0, 1))
    ], CartesianCrossLine.prototype, "strokeOpacity", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_LINE_DASH)
    ], CartesianCrossLine.prototype, "lineDash", void 0);
    return CartesianCrossLine;
}());
exports.CartesianCrossLine = CartesianCrossLine;
//# sourceMappingURL=cartesianCrossLine.js.map