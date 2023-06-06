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
import { _ } from '@ag-grid-community/core';
import numberFormatsFactory from './numberFormats';
import fontsFactory from './fonts';
import fillsFactory from './fills';
import bordersFactory from './borders';
import cellStylesXfsFactory from './cellStyleXfs';
import cellXfsFactory from './cellXfs';
import cellStylesFactory from './cellStyles';
import { convertLegacyBorder, convertLegacyColor, convertLegacyPattern } from '../../../assets/excelLegacyConvert';
import { numberFormatMap } from '../../../assets/excelConstants';
import { getFontFamilyId } from '../../../assets/excelUtils';
var stylesMap;
var registeredNumberFmts;
var registeredFonts;
var registeredFills;
var registeredBorders;
var registeredCellStyleXfs;
var registeredCellXfs;
var registeredCellStyles;
var currentSheet;
var getStyleName = function (name, currentSheet) {
    if (name.indexOf('mixedStyle') !== -1 && currentSheet > 1) {
        name += "_" + currentSheet;
    }
    return name;
};
var resetStylesheetValues = function () {
    stylesMap = { base: 0 };
    registeredNumberFmts = [];
    registeredFonts = [{ fontName: 'Calibri', colorTheme: '1', family: '2', scheme: 'minor' }];
    registeredFills = [{ patternType: 'none', }, { patternType: 'gray125' }];
    registeredBorders = [{ left: undefined, right: undefined, top: undefined, bottom: undefined, diagonal: undefined }];
    registeredCellStyleXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0 }];
    registeredCellXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0, xfId: 0 }];
    registeredCellStyles = [{ builtinId: 0, name: 'Normal', xfId: 0 }];
};
var registerFill = function (fill) {
    var convertedPattern = convertLegacyPattern(fill.pattern);
    var convertedFillColor = convertLegacyColor(fill.color);
    var convertedPatternColor = convertLegacyColor(fill.patternColor);
    var pos = registeredFills.findIndex(function (currentFill) {
        var patternType = currentFill.patternType, fgRgb = currentFill.fgRgb, bgRgb = currentFill.bgRgb;
        if (patternType != convertedPattern ||
            fgRgb != convertedFillColor ||
            bgRgb != convertedPatternColor) {
            return false;
        }
        return true;
    });
    if (pos === -1) {
        pos = registeredFills.length;
        registeredFills.push({ patternType: convertedPattern, fgRgb: convertedFillColor, bgRgb: convertedPatternColor });
    }
    return pos;
};
var registerNumberFmt = function (format) {
    format = _.utf8_encode(format);
    if (numberFormatMap[format]) {
        return numberFormatMap[format];
    }
    var pos = registeredNumberFmts.findIndex(function (currentFormat) { return currentFormat.formatCode === format; });
    if (pos === -1) {
        pos = registeredNumberFmts.length + 164;
        registeredNumberFmts.push({ formatCode: format, numFmtId: pos });
    }
    else {
        pos = registeredNumberFmts[pos].numFmtId;
    }
    return pos;
};
var registerBorders = function (borders) {
    var borderBottom = borders.borderBottom, borderTop = borders.borderTop, borderLeft = borders.borderLeft, borderRight = borders.borderRight;
    var bottomStyle;
    var topStyle;
    var leftStyle;
    var rightStyle;
    var bottomColor;
    var topColor;
    var leftColor;
    var rightColor;
    if (borderLeft) {
        leftStyle = convertLegacyBorder(borderLeft.lineStyle, borderLeft.weight);
        leftColor = convertLegacyColor(borderLeft.color);
    }
    if (borderRight) {
        rightStyle = convertLegacyBorder(borderRight.lineStyle, borderRight.weight);
        rightColor = convertLegacyColor(borderRight.color);
    }
    if (borderBottom) {
        bottomStyle = convertLegacyBorder(borderBottom.lineStyle, borderBottom.weight);
        bottomColor = convertLegacyColor(borderBottom.color);
    }
    if (borderTop) {
        topStyle = convertLegacyBorder(borderTop.lineStyle, borderTop.weight);
        topColor = convertLegacyColor(borderTop.color);
    }
    var pos = registeredBorders.findIndex(function (currentBorder) {
        var left = currentBorder.left, right = currentBorder.right, top = currentBorder.top, bottom = currentBorder.bottom;
        if (!left && (leftStyle || leftColor)) {
            return false;
        }
        if (!right && (rightStyle || rightColor)) {
            return false;
        }
        if (!top && (topStyle || topColor)) {
            return false;
        }
        if (!bottom && (bottomStyle || bottomColor)) {
            return false;
        }
        var _a = left || {}, clS = _a.style, clC = _a.color;
        var _b = right || {}, crS = _b.style, crC = _b.color;
        var _c = top || {}, ctS = _c.style, ctC = _c.color;
        var _d = bottom || {}, cbS = _d.style, cbC = _d.color;
        if (clS != leftStyle || clC != leftColor) {
            return false;
        }
        if (crS != rightStyle || crC != rightColor) {
            return false;
        }
        if (ctS != topStyle || ctC != topColor) {
            return false;
        }
        if (cbS != bottomStyle || cbC != bottomColor) {
            return false;
        }
        return true;
    });
    if (pos === -1) {
        pos = registeredBorders.length;
        registeredBorders.push({
            left: {
                style: leftStyle, color: leftColor
            },
            right: {
                style: rightStyle, color: rightColor
            },
            top: {
                style: topStyle, color: topColor
            },
            bottom: {
                style: bottomStyle, color: bottomColor
            },
            diagonal: {
                style: undefined,
                color: undefined
            }
        });
    }
    return pos;
};
var registerFont = function (font) {
    var _a = font.fontName, name = _a === void 0 ? 'Calibri' : _a, color = font.color, size = font.size, bold = font.bold, italic = font.italic, outline = font.outline, shadow = font.shadow, strikeThrough = font.strikeThrough, underline = font.underline, family = font.family, verticalAlign = font.verticalAlign;
    var utf8Name = name ? _.utf8_encode(name) : name;
    var convertedColor = convertLegacyColor(color);
    var familyId = getFontFamilyId(family);
    var convertedUnderline = underline ? underline.toLocaleLowerCase() : undefined;
    var convertedVerticalAlign = verticalAlign ? verticalAlign.toLocaleLowerCase() : undefined;
    var pos = registeredFonts.findIndex(function (currentFont) {
        if (currentFont.fontName != utf8Name ||
            currentFont.color != convertedColor ||
            currentFont.size != size ||
            currentFont.bold != bold ||
            currentFont.italic != italic ||
            currentFont.outline != outline ||
            currentFont.shadow != shadow ||
            currentFont.strikeThrough != strikeThrough ||
            currentFont.underline != convertedUnderline ||
            currentFont.verticalAlign != convertedVerticalAlign ||
            // @ts-ignore
            currentFont.family != familyId) {
            return false;
        }
        return true;
    });
    if (pos === -1) {
        pos = registeredFonts.length;
        registeredFonts.push({
            fontName: utf8Name,
            color: convertedColor,
            size: size,
            bold: bold,
            italic: italic,
            outline: outline,
            shadow: shadow,
            strikeThrough: strikeThrough,
            underline: convertedUnderline,
            verticalAlign: convertedVerticalAlign,
            family: familyId != null ? familyId.toString() : undefined
        });
    }
    return pos;
};
var registerStyle = function (config) {
    var alignment = config.alignment, borders = config.borders, font = config.font, interior = config.interior, numberFormat = config.numberFormat, protection = config.protection;
    var id = config.id;
    var currentFill = 0;
    var currentBorder = 0;
    var currentFont = 0;
    var currentNumberFmt = 0;
    if (!id) {
        return;
    }
    id = getStyleName(id, currentSheet);
    if (stylesMap[id] != undefined) {
        return;
    }
    if (interior) {
        currentFill = registerFill(interior);
    }
    if (borders) {
        currentBorder = registerBorders(borders);
    }
    if (font) {
        currentFont = registerFont(font);
    }
    if (numberFormat) {
        currentNumberFmt = registerNumberFmt(numberFormat.format);
    }
    stylesMap[id] = registeredCellXfs.length;
    registeredCellXfs.push({
        alignment: alignment,
        borderId: currentBorder || 0,
        fillId: currentFill || 0,
        fontId: currentFont || 0,
        numFmtId: currentNumberFmt || 0,
        protection: protection,
        xfId: 0
    });
};
var stylesheetFactory = {
    getTemplate: function (defaultFontSize) {
        var numberFormats = numberFormatsFactory.getTemplate(registeredNumberFmts);
        var fonts = fontsFactory.getTemplate(registeredFonts.map(function (font) { return (__assign(__assign({}, font), { size: font.size != null ? font.size : defaultFontSize })); }));
        var fills = fillsFactory.getTemplate(registeredFills);
        var borders = bordersFactory.getTemplate(registeredBorders);
        var cellStylesXfs = cellStylesXfsFactory.getTemplate(registeredCellStyleXfs);
        var cellXfs = cellXfsFactory.getTemplate(registeredCellXfs);
        var cellStyles = cellStylesFactory.getTemplate(registeredCellStyles);
        resetStylesheetValues();
        return {
            name: 'styleSheet',
            properties: {
                rawMap: {
                    'mc:Ignorable': 'x14ac x16r2 xr',
                    'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                    'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
                    'xmlns:x14ac': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac',
                    'xmlns:x16r2': 'http://schemas.microsoft.com/office/spreadsheetml/2015/02/main',
                    'xmlns:xr': 'http://schemas.microsoft.com/office/spreadsheetml/2014/revision'
                }
            },
            children: [
                numberFormats,
                fonts,
                fills,
                borders,
                cellStylesXfs,
                cellXfs,
                cellStyles,
                {
                    name: 'tableStyles',
                    properties: {
                        rawMap: {
                            count: 0,
                            defaultPivotStyle: 'PivotStyleLight16',
                            defaultTableStyle: 'TableStyleMedium2'
                        }
                    }
                }
            ]
        };
    }
};
export var getStyleId = function (name, currentSheet) {
    return stylesMap[getStyleName(name, currentSheet)] || 0;
};
export var registerStyles = function (styles, _currentSheet) {
    currentSheet = _currentSheet;
    if (currentSheet === 1) {
        resetStylesheetValues();
    }
    styles.forEach(registerStyle);
};
export default stylesheetFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVzaGVldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9zdHlsZXMvc3R5bGVzaGVldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBMEUsQ0FBQyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDcEgsT0FBTyxvQkFBb0IsTUFBTSxpQkFBaUIsQ0FBQztBQUNuRCxPQUFPLFlBQVksTUFBTSxTQUFTLENBQUM7QUFDbkMsT0FBTyxZQUFZLE1BQU0sU0FBUyxDQUFDO0FBQ25DLE9BQU8sY0FBYyxNQUFNLFdBQVcsQ0FBQztBQUN2QyxPQUFPLG9CQUFvQixNQUFNLGdCQUFnQixDQUFDO0FBQ2xELE9BQU8sY0FBYyxNQUFNLFdBQVcsQ0FBQztBQUN2QyxPQUFPLGlCQUFpQixNQUFNLGNBQWMsQ0FBQztBQUs3QyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUNuSCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDakUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTdELElBQUksU0FBb0IsQ0FBQztBQUN6QixJQUFJLG9CQUFvQyxDQUFDO0FBQ3pDLElBQUksZUFBaUMsQ0FBQztBQUN0QyxJQUFJLGVBQXVCLENBQUM7QUFDNUIsSUFBSSxpQkFBOEIsQ0FBQztBQUNuQyxJQUFJLHNCQUE0QixDQUFDO0FBQ2pDLElBQUksaUJBQXVCLENBQUM7QUFDNUIsSUFBSSxvQkFBaUMsQ0FBQztBQUN0QyxJQUFJLFlBQW9CLENBQUM7QUFFekIsSUFBTSxZQUFZLEdBQUcsVUFBQyxJQUFZLEVBQUUsWUFBb0I7SUFDcEQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJ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