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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossLine = void 0;
var node_1 = require("../../scene/node");
var group_1 = require("../../scene/group");
var text_1 = require("../../scene/shape/text");
var continuousScale_1 = require("../../scale/continuousScale");
var id_1 = require("../../util/id");
var angle_1 = require("../../util/angle");
var chartAxis_1 = require("../chartAxis");
var crossLineLabelPosition_1 = require("./crossLineLabelPosition");
var value_1 = require("../../util/value");
var layers_1 = require("../layers");
var range_1 = require("../../scene/shape/range");
var validation_1 = require("../../util/validation");
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
        validation_1.Validate(validation_1.OPT_BOOLEAN)
    ], CrossLineLabel.prototype, "enabled", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], CrossLineLabel.prototype, "text", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_STYLE)
    ], CrossLineLabel.prototype, "fontStyle", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_WEIGHT)
    ], CrossLineLabel.prototype, "fontWeight", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], CrossLineLabel.prototype, "fontSize", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], CrossLineLabel.prototype, "fontFamily", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], CrossLineLabel.prototype, "padding", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], CrossLineLabel.prototype, "color", void 0);
    __decorate([
        validation_1.Validate(OPT_CROSSLINE_LABEL_POSITION)
    ], CrossLineLabel.prototype, "position", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(-360, 360))
    ], CrossLineLabel.prototype, "rotation", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_BOOLEAN)
    ], CrossLineLabel.prototype, "parallel", void 0);
    return CrossLineLabel;
}());
var CrossLine = /** @class */ (function () {
    function CrossLine() {
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
        this.label = new CrossLineLabel();
        this.scale = undefined;
        this.clippedRange = [-Infinity, Infinity];
        this.gridLength = 0;
        this.sideFlag = -1;
        this.parallelFlipRotation = 0;
        this.regularFlipRotation = 0;
        this.direction = chartAxis_1.ChartAxisDirection.X;
        this.group = new group_1.Group({ name: "" + this.id, layer: true, zIndex: CrossLine.LINE_LAYER_ZINDEX });
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
        var _a, _b, _c, _d, _e, _f;
        var _g, _h;
        var _j = this, scale = _j.scale, gridLength = _j.gridLength, sideFlag = _j.sideFlag, direction = _j.direction, _k = _j.label.position, position = _k === void 0 ? 'top' : _k, clippedRange = _j.clippedRange, _l = _j.strokeWidth, strokeWidth = _l === void 0 ? 0 : _l;
        if (!scale) {
            return false;
        }
        var bandwidth = (_g = scale.bandwidth) !== null && _g !== void 0 ? _g : 0;
        var clippedRangeClamper = function (x) {
            return Math.max(Math.min.apply(Math, __spread(clippedRange)), Math.min(Math.max.apply(Math, __spread(clippedRange)), x));
        };
        var xStart, xEnd, yStart, yEnd, clampedYStart, clampedYEnd;
        _a = __read([0, sideFlag * gridLength], 2), xStart = _a[0], xEnd = _a[1];
        _b = __read(this.getRange(), 2), yStart = _b[0], yEnd = _b[1];
        _c = __read([
            Number(scale.convert(yStart, { strict: false })),
            scale.convert(yEnd, { strict: false }) + bandwidth,
        ], 2), clampedYStart = _c[0], clampedYEnd = _c[1];
        clampedYStart = clippedRangeClamper(clampedYStart);
        clampedYEnd = clippedRangeClamper(clampedYEnd);
        _d = __read([Number(scale.convert(yStart)), scale.convert(yEnd) + bandwidth], 2), yStart = _d[0], yEnd = _d[1];
        var validRange = !isNaN(clampedYStart) &&
            !isNaN(clampedYEnd) &&
            (yStart === clampedYStart || yEnd === clampedYEnd || clampedYStart !== clampedYEnd) &&
            Math.abs(clampedYEnd - clampedYStart) > 0;
        if (validRange) {
            var reverse = clampedYStart !== Math.min(clampedYStart, clampedYEnd);
            if (reverse) {
                _e = __read([
                    Math.min(clampedYStart, clampedYEnd),
                    Math.max(clampedYStart, clampedYEnd),
                ], 2), clampedYStart = _e[0], clampedYEnd = _e[1];
                _f = __read([yEnd, yStart], 2), yStart = _f[0], yEnd = _f[1];
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
            var yDirection = direction === chartAxis_1.ChartAxisDirection.Y;
            var _m = ((_h = crossLineLabelPosition_1.labeldDirectionHandling[position]) !== null && _h !== void 0 ? _h : {}).c, c = _m === void 0 ? crossLineLabelPosition_1.POSITION_TOP_COORDINATES : _m;
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
        var labelRotation = rotation ? angle_1.normalizeAngle360(angle_1.toRadians(rotation)) : 0;
        var parallelFlipFlag = !labelRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
        var regularFlipFlag = !labelRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI ? -1 : 1;
        var autoRotation = parallel ? (parallelFlipFlag * Math.PI) / 2 : regularFlipFlag === -1 ? Math.PI : 0;
        crossLineLabel.rotation = autoRotation + labelRotation;
        crossLineLabel.textBaseline = 'middle';
        crossLineLabel.textAlign = 'center';
        var bbox = this.computeLabelBBox();
        if (!bbox) {
            return;
        }
        var yDirection = direction === chartAxis_1.ChartAxisDirection.Y;
        var _j = crossLineLabelPosition_1.calculateLabelTranslation({ yDirection: yDirection, padding: padding, position: position, bbox: bbox }), xTranslation = _j.xTranslation, yTranslation = _j.yTranslation;
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
        var _a;
        var _b = this, value = _b.value, range = _b.range, scale = _b.scale;
        var isContinuous = scale instanceof continuousScale_1.ContinuousScale;
        var _c = __read(range !== null && range !== void 0 ? range : [value, undefined], 2), start = _c[0], end = _c[1];
        if (!isContinuous && end === undefined) {
            end = start;
        }
        _a = __read([value_1.checkDatum(start, isContinuous), value_1.checkDatum(end, isContinuous)], 2), start = _a[0], end = _a[1];
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
    CrossLine.prototype.calculatePadding = function (padding, seriesRect) {
        var _a, _b, _c, _d, _e, _f;
        var _g = this, isRange = _g.isRange, startLine = _g.startLine, endLine = _g.endLine;
        if (!isRange && !startLine && !endLine) {
            return;
        }
        var crossLineLabelBBox = this.computeLabelBBox();
        var labelX = crossLineLabelBBox === null || crossLineLabelBBox === void 0 ? void 0 : crossLineLabelBBox.x;
        var labelY = crossLineLabelBBox === null || crossLineLabelBBox === void 0 ? void 0 : crossLineLabelBBox.y;
        if (labelX == undefined || labelY == undefined) {
            return;
        }
        var labelWidth = (_a = crossLineLabelBBox === null || crossLineLabelBBox === void 0 ? void 0 : crossLineLabelBBox.width) !== null && _a !== void 0 ? _a : 0;
        var labelHeight = (_b = crossLineLabelBBox === null || crossLineLabelBBox === void 0 ? void 0 : crossLineLabelBBox.height) !== null && _b !== void 0 ? _b : 0;
        if (labelX + labelWidth >= seriesRect.x + seriesRect.width) {
            var paddingRight = labelX + labelWidth - (seriesRect.x + seriesRect.width);
            padding.right = ((_c = padding.right) !== null && _c !== void 0 ? _c : 0) >= paddingRight ? padding.right : paddingRight;
        }
        else if (labelX <= seriesRect.x) {
            var paddingLeft = seriesRect.x - labelX;
            padding.left = ((_d = padding.left) !== null && _d !== void 0 ? _d : 0) >= paddingLeft ? padding.left : paddingLeft;
        }
        if (labelY + labelHeight >= seriesRect.y + seriesRect.height) {
            var paddingbottom = labelY + labelHeight - (seriesRect.y + seriesRect.height);
            padding.bottom = ((_e = padding.bottom) !== null && _e !== void 0 ? _e : 0) >= paddingbottom ? padding.bottom : paddingbottom;
        }
        else if (labelY <= seriesRect.y) {
            var paddingTop = seriesRect.y - labelY;
            padding.top = ((_f = padding.top) !== null && _f !== void 0 ? _f : 0) >= paddingTop ? padding.top : paddingTop;
        }
    };
    CrossLine.LINE_LAYER_ZINDEX = layers_1.Layers.SERIES_CROSSLINE_LINE_ZINDEX;
    CrossLine.RANGE_LAYER_ZINDEX = layers_1.Layers.SERIES_CROSSLINE_RANGE_ZINDEX;
    CrossLine.className = 'CrossLine';
    __decorate([
        validation_1.Validate(validation_1.OPT_BOOLEAN)
    ], CrossLine.prototype, "enabled", void 0);
    __decorate([
        validation_1.Validate(OPT_CROSSLINE_TYPE)
    ], CrossLine.prototype, "type", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_ARRAY(2))
    ], CrossLine.prototype, "range", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], CrossLine.prototype, "fill", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0, 1))
    ], CrossLine.prototype, "fillOpacity", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], CrossLine.prototype, "stroke", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER())
    ], CrossLine.prototype, "strokeWidth", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0, 1))
    ], CrossLine.prototype, "strokeOpacity", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_LINE_DASH)
    ], CrossLine.prototype, "lineDash", void 0);
    return CrossLine;
}());
exports.CrossLine = CrossLine;
