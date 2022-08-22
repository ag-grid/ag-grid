"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var node_1 = require("../../scene/node");
var group_1 = require("../../scene/group");
var path_1 = require("../../scene/shape/path");
var text_1 = require("../../scene/shape/text");
var continuousScale_1 = require("../../scale/continuousScale");
var id_1 = require("../../util/id");
var angle_1 = require("../../util/angle");
var chartAxis_1 = require("../chartAxis");
var crossLineLabelPosition_1 = require("./crossLineLabelPosition");
var value_1 = require("../../util/value");
var layers_1 = require("../layers");
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
    return CrossLineLabel;
}());
exports.CrossLineLabel = CrossLineLabel;
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
        this.gridLength = 0;
        this.sideFlag = -1;
        this.parallelFlipRotation = 0;
        this.regularFlipRotation = 0;
        this.direction = chartAxis_1.ChartAxisDirection.X;
        this.group = new group_1.Group({ name: "" + this.id, layer: true, zIndex: CrossLine.LINE_LAYER_ZINDEX });
        this.crossLineLabel = new text_1.Text();
        this.crossLineLine = new path_1.Path();
        this.crossLineRange = new path_1.Path();
        this.labelPoint = undefined;
        this.fillData = undefined;
        this.strokeData = undefined;
        var _a = this, group = _a.group, crossLineLine = _a.crossLineLine, crossLineRange = _a.crossLineRange, crossLineLabel = _a.crossLineLabel;
        group.append([crossLineRange, crossLineLine, crossLineLabel]);
        crossLineLine.fill = undefined;
        crossLineLine.pointerEvents = node_1.PointerEvents.None;
        crossLineRange.pointerEvents = node_1.PointerEvents.None;
    }
    CrossLine.prototype.getZIndex = function (type) {
        if (type === void 0) { type = 'line'; }
        if (type === 'range') {
            return CrossLine.RANGE_LAYER_ZINDEX;
        }
        return CrossLine.LINE_LAYER_ZINDEX;
    };
    CrossLine.prototype.update = function (visible) {
        if (!this.enabled || !this.type) {
            return;
        }
        this.group.visible = visible;
        if (!visible) {
            return;
        }
        this.group.zIndex = this.getZIndex(this.type);
        var dataCreated = this.createNodeData();
        if (!dataCreated) {
            this.group.visible = false;
            return;
        }
        this.updatePaths();
    };
    CrossLine.prototype.updatePaths = function () {
        this.updateLinePath();
        this.updateLineNode();
        if (this.type === 'range') {
            this.updateRangePath();
            this.updateRangeNode();
        }
        if (this.label.enabled) {
            this.updateLabel();
            this.positionLabel();
        }
    };
    CrossLine.prototype.createNodeData = function () {
        var _a, _b, _c, _d;
        var _e, _f;
        var _g = this, scale = _g.scale, gridLength = _g.gridLength, sideFlag = _g.sideFlag, direction = _g.direction, _h = _g.label.position, position = _h === void 0 ? 'top' : _h;
        if (!scale) {
            return false;
        }
        var isContinuous = scale instanceof continuousScale_1.ContinuousScale;
        var bandwidth = (_e = scale.bandwidth, (_e !== null && _e !== void 0 ? _e : 0));
        var xStart, xEnd, yStart, yEnd, clampedYStart, clampedYEnd;
        this.fillData = { points: [] };
        this.strokeData = { points: [] };
        _a = __read([0, sideFlag * gridLength], 2), xStart = _a[0], xEnd = _a[1];
        _b = __read(this.getRange(), 2), yStart = _b[0], yEnd = _b[1];
        var isLine = false;
        if (yStart === undefined) {
            return false;
        }
        else if (yEnd === undefined) {
            isLine = true;
        }
        _c = __read([
            Number(scale.convert(yStart, isContinuous ? continuousScale_1.clamper : undefined)),
            scale.convert(yEnd, isContinuous ? continuousScale_1.clamper : undefined) + bandwidth,
        ], 2), clampedYStart = _c[0], clampedYEnd = _c[1];
        _d = __read([Number(scale.convert(yStart)), scale.convert(yEnd) + bandwidth], 2), yStart = _d[0], yEnd = _d[1];
        var isValidLine = yStart === clampedYStart;
        var isValidRange = yStart === clampedYStart || yEnd === clampedYEnd || clampedYStart !== clampedYEnd;
        if ((isLine && !isValidLine) || (!isLine && !isValidRange)) {
            return false;
        }
        this.strokeData.points.push({
            x: xStart,
            y: yStart,
        }, {
            x: xEnd,
            y: yStart,
        }, {
            x: xEnd,
            y: yEnd,
        }, {
            x: xStart,
            y: yEnd,
        });
        this.fillData.points.push({
            x: xStart,
            y: clampedYStart,
        }, {
            x: xEnd,
            y: clampedYStart,
        }, {
            x: xEnd,
            y: clampedYEnd,
        }, {
            x: xStart,
            y: clampedYEnd,
        });
        if (this.label.enabled) {
            var yDirection = direction === chartAxis_1.ChartAxisDirection.Y;
            var _j = (_f = crossLineLabelPosition_1.labeldDirectionHandling[position], (_f !== null && _f !== void 0 ? _f : {})).c, c = _j === void 0 ? crossLineLabelPosition_1.POSITION_TOP_COORDINATES : _j;
            var _k = c({ yDirection: yDirection, xStart: xStart, xEnd: xEnd, yStart: clampedYStart, yEnd: clampedYEnd }), labelX = _k.x, labelY = _k.y;
            this.labelPoint = {
                x: labelX,
                y: labelY,
            };
        }
        return true;
    };
    CrossLine.prototype.updateLinePath = function () {
        var _a = this, crossLineLine = _a.crossLineLine, _b = _a.strokeData, strokeData = _b === void 0 ? { points: [] } : _b;
        var pathMethods = ['moveTo', 'lineTo', 'moveTo', 'lineTo'];
        var points = strokeData.points;
        var path = crossLineLine.path;
        path.clear({ trackChanges: true });
        pathMethods.forEach(function (method, i) {
            var _a = points[i], x = _a.x, y = _a.y;
            path[method](x, y);
        });
        crossLineLine.checkPathDirty();
    };
    CrossLine.prototype.updateLineNode = function () {
        var _a;
        var _b = this, crossLineLine = _b.crossLineLine, stroke = _b.stroke, strokeWidth = _b.strokeWidth, lineDash = _b.lineDash;
        crossLineLine.stroke = stroke;
        crossLineLine.strokeWidth = (strokeWidth !== null && strokeWidth !== void 0 ? strokeWidth : 1);
        crossLineLine.opacity = (_a = this.strokeOpacity, (_a !== null && _a !== void 0 ? _a : 1));
        crossLineLine.lineDash = lineDash;
    };
    CrossLine.prototype.updateRangeNode = function () {
        var _a = this, crossLineRange = _a.crossLineRange, fill = _a.fill, fillOpacity = _a.fillOpacity;
        crossLineRange.fill = fill;
        crossLineRange.opacity = (fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1);
    };
    CrossLine.prototype.updateRangePath = function () {
        var _a = this, crossLineRange = _a.crossLineRange, _b = _a.fillData, fillData = _b === void 0 ? { points: [] } : _b;
        var points = fillData.points;
        var path = crossLineRange.path;
        path.clear({ trackChanges: true });
        points.forEach(function (point, i) {
            var x = point.x, y = point.y;
            path[i > 0 ? 'lineTo' : 'moveTo'](x, y);
        });
        path.closePath();
        crossLineRange.checkPathDirty();
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
    CrossLine.prototype.getRange = function () {
        var _a;
        var _b = this, value = _b.value, range = _b.range, scale = _b.scale;
        var isContinuous = scale instanceof continuousScale_1.ContinuousScale;
        var _c = __read((range !== null && range !== void 0 ? range : [value, undefined]), 2), start = _c[0], end = _c[1];
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var crossLineLabelBBox = this.computeLabelBBox();
        var labelX = (_a = crossLineLabelBBox) === null || _a === void 0 ? void 0 : _a.x;
        var labelY = (_b = crossLineLabelBBox) === null || _b === void 0 ? void 0 : _b.y;
        if (labelX == undefined || labelY == undefined) {
            return;
        }
        var labelWidth = (_d = (_c = crossLineLabelBBox) === null || _c === void 0 ? void 0 : _c.width, (_d !== null && _d !== void 0 ? _d : 0));
        var labelHeight = (_f = (_e = crossLineLabelBBox) === null || _e === void 0 ? void 0 : _e.height, (_f !== null && _f !== void 0 ? _f : 0));
        if (labelX + labelWidth >= seriesRect.x + seriesRect.width) {
            var paddingRight = labelX + labelWidth - (seriesRect.x + seriesRect.width);
            padding.right = (_g = padding.right, (_g !== null && _g !== void 0 ? _g : 0)) >= paddingRight ? padding.right : paddingRight;
        }
        else if (labelX <= seriesRect.x) {
            var paddingLeft = seriesRect.x - labelX;
            padding.left = (_h = padding.left, (_h !== null && _h !== void 0 ? _h : 0)) >= paddingLeft ? padding.left : paddingLeft;
        }
        if (labelY + labelHeight >= seriesRect.y + seriesRect.height) {
            var paddingbottom = labelY + labelHeight - (seriesRect.y + seriesRect.height);
            padding.bottom = (_j = padding.bottom, (_j !== null && _j !== void 0 ? _j : 0)) >= paddingbottom ? padding.bottom : paddingbottom;
        }
        else if (labelY <= seriesRect.y) {
            var paddingTop = seriesRect.y - labelY;
            padding.top = (_k = padding.top, (_k !== null && _k !== void 0 ? _k : 0)) >= paddingTop ? padding.top : paddingTop;
        }
    };
    CrossLine.LINE_LAYER_ZINDEX = layers_1.Layers.SERIES_CROSSLINE_LINE_ZINDEX;
    CrossLine.RANGE_LAYER_ZINDEX = layers_1.Layers.SERIES_CROSSLINE_RANGE_ZINDEX;
    CrossLine.className = 'CrossLine';
    return CrossLine;
}());
exports.CrossLine = CrossLine;
