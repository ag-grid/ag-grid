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
