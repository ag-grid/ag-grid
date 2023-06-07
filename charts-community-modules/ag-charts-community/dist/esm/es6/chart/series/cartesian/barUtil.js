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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9zZXJpZXMvY2FydGVzaWFuL2JhclV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFzRC9DLE1BQU0sVUFBVSxlQUFlLENBQUMsRUFDNUIsS0FBSyxFQUNMLElBQUksRUFDSixTQUFTLEVBQ1QsUUFBUSxFQUNSLE9BQU8sR0FBRyxDQUFDLEVBQ1gsU0FBUyxFQUNULFNBQVMsRUFDVCxHQUFHLEVBQUUsRUFBRSxhQUFhLEVBQUUsR0FVekI7SUFDRyxJQUFJLFNBQVMsQ0FBQztJQUNkLElBQUksU0FBUyxFQUFFO1FBQ1gsU0FBUyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ3RDLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUztZQUMxQyxRQUFRO1NBQ1gsQ0FBQyxDQUFDO0tBQ047SUFDRCxJQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUU7UUFDekIsU0FBUyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0tBQ3ZEO0lBRUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNyQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBRXRDLElBQUksY0FBYyxHQUFvQixRQUFRLENBQUM7SUFDL0MsSUFBSSxpQkFBaUIsR0FBdUIsUUFBUSxDQUFDO0lBRXJELE1BQU0sVUFBVSxHQUFH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Q3RFLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQ2hDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQ2xDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzlCLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQ2xDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQ2hDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ3RDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLFNBQVMsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLFNBQVMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0tBQy9CO1NBQU07UUFDSCxTQUFTLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztLQUM3QjtBQUNMLENBQUMifQ==