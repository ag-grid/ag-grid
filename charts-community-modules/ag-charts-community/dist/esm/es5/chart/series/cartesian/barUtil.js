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
import { isNumber } from '../../../util/value';
export function createLabelData(_a) {
    var value = _a.value, rect = _a.rect, placement = _a.placement, seriesId = _a.seriesId, _b = _a.padding, padding = _b === void 0 ? 0 : _b, formatter = _a.formatter, barAlongX = _a.barAlongX, callbackCache = _a.ctx.callbackCache;
    var labelText;
    if (formatter) {
        labelText = callbackCache.call(formatter, {
            value: isNumber(value) ? value : undefined,
            seriesId: seriesId,
        });
    }
    if (labelText === undefined) {
        labelText = isNumber(value) ? value.toFixed(2) : '';
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
export function updateRect(_a) {
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
export function getRectConfig(_a) {
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
export function checkCrisp(visibleRange) {
    if (visibleRange === void 0) { visibleRange = []; }
    var _a = __read(visibleRange, 2), visibleMin = _a[0], visibleMax = _a[1];
    var isZoomed = visibleMin !== 0 || visibleMax !== 1;
    var crisp = !isZoomed;
    return crisp;
}
export function updateLabel(_a) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9zZXJpZXMvY2FydGVzaWFuL2JhclV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFzRC9DLE1BQU0sVUFBVSxlQUFlLENBQUMsRUFrQi9CO1FBakJHLEtBQUssV0FBQSxFQUNMLElBQUksVUFBQSxFQUNKLFNBQVMsZUFBQSxFQUNULFFBQVEsY0FBQSxFQUNSLGVBQVcsRUFBWCxPQUFPLG1CQUFHLENBQUMsS0FBQSxFQUNYLFNBQVMsZUFBQSxFQUNULFNBQVMsZUFBQSxFQUNGLGFBQWEsdUJBQUE7SUFXcEIsSUFBSSxTQUFTLENBQUM7SUFDZCxJQUFJLFNBQVMsRUFBRTtRQUNYLFNBQVMsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUN0QyxLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFDMUMsUUFBUSxVQUFBO1NBQ1gsQ0FBQyxDQUFDO0tBQ047SUFDRCxJQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUU7UUFDekIsU0FBUyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0tBQ3ZEO0lBRUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNyQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBRXRDLElBQUksY0FBYyxHQUFv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