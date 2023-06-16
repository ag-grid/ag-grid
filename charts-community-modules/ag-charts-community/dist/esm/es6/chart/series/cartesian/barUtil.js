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
import { isNumber } from '../../../util/value';
export function createLabelData({ value, rect, placement, seriesId, padding = 0, formatter, barAlongX, ctx: { callbackCache }, }) {
    let labelText;
    if (formatter) {
        labelText = callbackCache.call(formatter, {
            value: isNumber(value) ? value : undefined,
            seriesId,
        });
    }
    if (labelText === undefined) {
        labelText = isNumber(value) ? value.toFixed(2) : '';
    }
    let labelX = rect.x + rect.width / 2;
    let labelY = rect.y + rect.height / 2;
    let labelTextAlign = 'center';
    let labelTextBaseline = 'middle';
    const isPositive = value >= 0;
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
export function updateRect({ rect, config }) {
    const { crisp = true, fill, stroke, strokeWidth, fillOpacity, strokeOpacity, lineDash, lineDashOffset, fillShadow, visible = true, } = config;
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
    var { datum, isHighlighted, style, highlightStyle, formatter, seriesId, stackGroup, ctx: { callbackCache } } = _a, opts = __rest(_a, ["datum", "isHighlighted", "style", "highlightStyle", "formatter", "seriesId", "stackGroup", "ctx"]);
    const itemFill = isHighlighted ? (_b = highlightStyle.fill) !== null && _b !== void 0 ? _b : style.fill : style.fill;
    const itemStroke = isHighlighted ? (_c = highlightStyle.stroke) !== null && _c !== void 0 ? _c : style.stroke : style.stroke;
    const itemStrokeWidth = isHighlighted ? (_d = highlightStyle.strokeWidth) !== null && _d !== void 0 ? _d : style.strokeWidth : style.strokeWidth;
    const fillOpacity = isHighlighted ? (_e = highlightStyle.fillOpacity) !== null && _e !== void 0 ? _e : style.fillOpacity : style.fillOpacity;
    const { strokeOpacity, fillShadow, lineDash, lineDashOffset } = style;
    let format = undefined;
    if (formatter) {
        format = callbackCache.call(formatter, Object.assign({ datum: datum.datum, xKey: datum.xKey, yKey: datum.yKey, fill: itemFill, stroke: itemStroke, strokeWidth: itemStrokeWidth, highlighted: isHighlighted, seriesId,
            stackGroup }, opts));
    }
    return {
        fill: (_f = format === null || format === void 0 ? void 0 : format.fill) !== null && _f !== void 0 ? _f : itemFill,
        stroke: (_g = format === null || format === void 0 ? void 0 : format.stroke) !== null && _g !== void 0 ? _g : itemStroke,
        strokeWidth: (_h = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _h !== void 0 ? _h : itemStrokeWidth,
        fillOpacity,
        strokeOpacity,
        lineDash,
        lineDashOffset,
        fillShadow,
    };
}
export function checkCrisp(visibleRange = []) {
    const [visibleMin, visibleMax] = visibleRange;
    const isZoomed = visibleMin !== 0 || visibleMax !== 1;
    const crisp = !isZoomed;
    return crisp;
}
export function updateLabel({ labelNode, labelDatum, config, visible, }) {
    if (labelDatum && config && config.enabled) {
        const { x, y, text, textAlign, textBaseline } = labelDatum;
        const { fontStyle, fontWeight, fontSize, fontFamily, color } = config;
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
