"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLabel = exports.checkCrisp = exports.getRectConfig = exports.updateRect = exports.createLabelData = void 0;
var value_1 = require("../../../util/value");
function createLabelData(_a) {
    var value = _a.value, rect = _a.rect, placement = _a.placement, seriesId = _a.seriesId, _b = _a.padding, padding = _b === void 0 ? 0 : _b, formatter = _a.formatter, barAlongX = _a.barAlongX, callbackCache = _a.ctx.callbackCache;
    var labelText;
    if (formatter) {
        labelText = callbackCache.call(formatter, {
            value: value_1.isNumber(value) ? value : undefined,
            seriesId: seriesId,
        });
    }
    if (labelText === undefined) {
        labelText = value_1.isNumber(value) ? value.toFixed(2) : '';
    }
    var labelX = rect.x + rect.width / 2;
    var labelY = rect.y + rect.height / 2;
    var labelTextAlign = 'center';
    var labelTextBaseline = 'middle';
    var isPositive = value >= 0;
    switch (placement) {
        case 'start': {
            if (barAlongX) {
                labelX = isPositive ? rect.x - padding : rect.x + rect.width + padding;
                labelTextAlign = isPositive ? 'start' : 'end';
            }
            else {
                labelY = isPositive ? rect.y + rect.height + padding : rect.y - padding;
                labelTextBaseline = isPositive ? 'top' : 'bottom';
            }
            break;
        }
        case 'outside':
        case 'end': {
            if (barAlongX) {
                labelX = isPositive ? rect.x + rect.width + padding : rect.x - padding;
                labelTextAlign = isPositive ? 'start' : 'end';
            }
            else {
                labelY = isPositive ? rect.y - padding : rect.y + rect.height + padding;
                labelTextBaseline = isPositive ? 'bottom' : 'top';
            }
            break;
        }
        case 'inside':
        default: {
            labelTextBaseline = 'middle';
            break;
        }
    }
    return {
        text: labelText,
        textAlign: labelTextAlign,
        textBaseline: labelTextBaseline,
        x: labelX,
        y: labelY,
    };
}
exports.createLabelData = createLabelData;
function updateRect(_a) {
    var rect = _a.rect, config = _a.config;
    var _b = config.crisp, crisp = _b === void 0 ? true : _b, fill = config.fill, stroke = config.stroke, strokeWidth = config.strokeWidth, fillOpacity = config.fillOpacity, strokeOpacity = config.strokeOpacity, lineDash = config.lineDash, lineDashOffset = config.lineDashOffset, fillShadow = config.fillShadow, _c = config.visible, visible = _c === void 0 ? true : _c;
    rect.crisp = crisp;
    rect.fill = fill;
    rect.stroke = stroke;
    rect.strokeWidth = strokeWidth;
    rect.fillOpacity = fillOpacity;
    rect.strokeOpacity = strokeOpacity;
    rect.lineDash = lineDash;
    rect.lineDashOffset = lineDashOffset;
    rect.fillShadow = fillShadow;
    rect.visible = visible;
}
exports.updateRect = updateRect;
function getRectConfig(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var datum = _a.datum, isHighlighted = _a.isHighlighted, style = _a.style, highlightStyle = _a.highlightStyle, formatter = _a.formatter, seriesId = _a.seriesId, stackGroup = _a.stackGroup, callbackCache = _a.ctx.callbackCache, opts = __rest(_a, ["datum", "isHighlighted", "style", "highlightStyle", "formatter", "seriesId", "stackGroup", "ctx"]);
    var itemFill = isHighlighted ? (_b = highlightStyle.fill) !== null && _b !== void 0 ? _b : style.fill : style.fill;
    var itemStroke = isHighlighted ? (_c = highlightStyle.stroke) !== null && _c !== void 0 ? _c : style.stroke : style.stroke;
    var itemStrokeWidth = isHighlighted ? (_d = highlightStyle.strokeWidth) !== null && _d !== void 0 ? _d : style.strokeWidth : style.strokeWidth;
    var fillOpacity = isHighlighted ? (_e = highlightStyle.fillOpacity) !== null && _e !== void 0 ? _e : style.fillOpacity : style.fillOpacity;
    var strokeOpacity = style.strokeOpacity, fillShadow = style.fillShadow, lineDash = style.lineDash, lineDashOffset = style.lineDashOffset;
    var format = undefined;
    if (formatter) {
        format = callbackCache.call(formatter, __assign({ datum: datum.datum, xKey: datum.xKey, yKey: datum.yKey, fill: itemFill, stroke: itemStroke, strokeWidth: itemStrokeWidth, highlighted: isHighlighted, seriesId: seriesId, stackGroup: stackGroup }, opts));
    }
    return {
        fill: (_f = format === null || format === void 0 ? void 0 : format.fill) !== null && _f !== void 0 ? _f : itemFill,
        stroke: (_g = format === null || format === void 0 ? void 0 : format.stroke) !== null && _g !== void 0 ? _g : itemStroke,
        strokeWidth: (_h = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _h !== void 0 ? _h : itemStrokeWidth,
        fillOpacity: fillOpacity,
        strokeOpacity: strokeOpacity,
        lineDash: lineDash,
        lineDashOffset: lineDashOffset,
        fillShadow: fillShadow,
    };
}
exports.getRectConfig = getRectConfig;
function checkCrisp(visibleRange) {
    if (visibleRange === void 0) { visibleRange = []; }
    var _a = __read(visibleRange, 2), visibleMin = _a[0], visibleMax = _a[1];
    var isZoomed = visibleMin !== 0 || visibleMax !== 1;
    var crisp = !isZoomed;
    return crisp;
}
exports.checkCrisp = checkCrisp;
function updateLabel(_a) {
    var labelNode = _a.labelNode, labelDatum = _a.labelDatum, config = _a.config, visible = _a.visible;
    if (labelDatum && config && config.enabled) {
        var x = labelDatum.x, y = labelDatum.y, text = labelDatum.text, textAlign = labelDatum.textAlign, textBaseline = labelDatum.textBaseline;
        var fontStyle = config.fontStyle, fontWeight = config.fontWeight, fontSize = config.fontSize, fontFamily = config.fontFamily, color = config.color;
        labelNode.fontStyle = fontStyle;
        labelNode.fontWeight = fontWeight;
        labelNode.fontSize = fontSize;
        labelNode.fontFamily = fontFamily;
        labelNode.textAlign = textAlign;
        labelNode.textBaseline = textBaseline;
        labelNode.text = text;
        labelNode.x = x;
        labelNode.y = y;
        labelNode.fill = color;
        labelNode.visible = visible;
    }
    else {
        labelNode.visible = false;
    }
}
exports.updateLabel = updateLabel;
//# sourceMappingURL=barUtil.js.map