// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var numberFormats_1 = require("./numberFormats");
var fonts_1 = require("./fonts");
var fills_1 = require("./fills");
var borders_1 = require("./borders");
var cellStyleXfs_1 = require("./cellStyleXfs");
var cellXfs_1 = require("./cellXfs");
var cellStyles_1 = require("./cellStyles");
var numberFormat_1 = require("./numberFormat");
var font_1 = require("./font");
var border_1 = require("./border");
var stylesMap;
var registeredNumberFmts;
var registeredFonts;
var registeredFills;
var registeredBorders;
var registeredCellStyleXfs;
var registeredCellXfs;
var registeredCellStyles;
var resetStylesheetValues = function () {
    stylesMap = { base: 0 };
    registeredNumberFmts = [];
    registeredFonts = [{ name: 'Calibri', size: 14, colorTheme: '1', family: 2, scheme: 'minor' }];
    registeredFills = [{ patternType: 'none', }, { patternType: 'gray125' }];
    registeredBorders = [{ left: undefined, right: undefined, top: undefined, bottom: undefined, diagonal: undefined }];
    registeredCellStyleXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0 }];
    registeredCellXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0, xfId: 0 }];
    registeredCellStyles = [{ builtinId: 0, name: 'normal', xfId: 0 }];
};
var convertLegacyPattern = function (name) {
    var colorMap = {
        None: 'none',
        Solid: 'solid',
        Gray50: 'mediumGray',
        Gray75: 'darkGray',
        Gray25: 'lightGray',
        HorzStripe: 'darkHorizontal',
        VertStripe: 'darkVertical',
        ReverseDiagStripe: 'darkDown',
        DiagStripe: 'darkUp',
        DiagCross: 'darkGrid',
        ThickDiagCross: 'darkTrellis',
        ThinHorzStripe: 'lightHorizontal',
        ThinVertStripe: 'lightVertical',
        ThinReverseDiagStripe: 'lightDown',
        ThinDiagStripe: 'lightUp',
        ThinHorzCross: 'lightGrid',
        ThinDiagCross: 'lightTrellis',
        Gray125: 'gray125',
        Gray0625: 'gray0625'
    };
    if (!name) {
        return 'none';
    }
    return colorMap[name] || name;
};
exports.convertLegacyColor = function (color) {
    if (color == undefined) {
        return color;
    }
    if (color.charAt(0) === '#') {
        color = color.substr(1);
    }
    return color.length === 6 ? '00' + color : color;
};
var registerFill = function (fill) {
    var convertedPattern = convertLegacyPattern(fill.pattern);
    var convertedFillColor = exports.convertLegacyColor(fill.color);
    var convertedPatternColor = exports.convertLegacyColor(fill.patternColor);
    var pos = ag_grid_community_1._.findIndex(registeredFills, function (currentFill) {
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
    format = ag_grid_community_1._.utf8_encode(format);
    if (numberFormat_1.numberFormatMap[format]) {
        return numberFormat_1.numberFormatMap[format];
    }
    var pos = ag_grid_community_1._.findIndex(registeredNumberFmts, function (currentFormat) { return currentFormat.formatCode === format; });
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
    var bottomStyle, topStyle, leftStyle, rightStyle;
    var bottomColor, topColor, leftColor, rightColor;
    if (borderLeft) {
        leftStyle = border_1.convertLegacyBorder(borderLeft.lineStyle, borderLeft.weight);
        leftColor = exports.convertLegacyColor(borderLeft.color);
    }
    if (borderRight) {
        rightStyle = border_1.convertLegacyBorder(borderRight.lineStyle, borderRight.weight);
        rightColor = exports.convertLegacyColor(borderRight.color);
    }
    if (borderBottom) {
        bottomStyle = border_1.convertLegacyBorder(borderBottom.lineStyle, borderBottom.weight);
        bottomColor = exports.convertLegacyColor(borderBottom.color);
    }
    if (borderTop) {
        topStyle = border_1.convertLegacyBorder(borderTop.lineStyle, borderTop.weight);
        topColor = exports.convertLegacyColor(borderTop.color);
    }
    var pos = ag_grid_community_1._.findIndex(registeredBorders, function (currentBorder) {
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
    var name = font.fontName, color = font.color, size = font.size, bold = font.bold, italic = font.italic, outline = font.outline, shadow = font.shadow, strikeThrough = font.strikeThrough, underline = font.underline, family = font.family;
    var utf8Name = name ? ag_grid_community_1._.utf8_encode(name) : name;
    var convertedColor = exports.convertLegacyColor(color);
    var familyId = font_1.getFamilyId(family);
    var pos = ag_grid_community_1._.findIndex(registeredFonts, function (currentFont) {
        if (currentFont.name != utf8Name ||
            currentFont.color != convertedColor ||
            currentFont.size != size ||
            currentFont.bold != bold ||
            currentFont.italic != italic ||
            currentFont.outline != outline ||
            currentFont.shadow != shadow ||
            currentFont.strike != strikeThrough ||
            currentFont.underline != underline ||
            currentFont.family != familyId) {
            return false;
        }
        return true;
    });
    if (pos === -1) {
        pos = registeredFonts.length;
        registeredFonts.push({
            name: utf8Name,
            color: convertedColor,
            size: size,
            bold: bold,
            italic: italic,
            outline: outline,
            shadow: shadow,
            strike: strikeThrough,
            underline: underline,
            family: familyId
        });
    }
    return pos;
};
var registerStyle = function (config) {
    var id = config.id, alignment = config.alignment, borders = config.borders, font = config.font, interior = config.interior, numberFormat = config.numberFormat, protection = config.protection;
    var currentFill = 0;
    var currentBorder = 0;
    var currentFont = 0;
    var currentNumberFmt = 0;
    if (!id || stylesMap[id] != undefined) {
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
    getTemplate: function () {
        var numberFormats = numberFormats_1.default.getTemplate(registeredNumberFmts);
        var fonts = fonts_1.default.getTemplate(registeredFonts);
        var fills = fills_1.default.getTemplate(registeredFills);
        var borders = borders_1.default.getTemplate(registeredBorders);
        var cellStylesXfs = cellStyleXfs_1.default.getTemplate(registeredCellStyleXfs);
        var cellXfs = cellXfs_1.default.getTemplate(registeredCellXfs);
        var cellStyles = cellStyles_1.default.getTemplate(registeredCellStyles);
        resetStylesheetValues();
        return {
            name: 'styleSheet',
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
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
exports.getStyleId = function (name) {
    return stylesMap[name] || 0;
};
exports.registerStyles = function (styles) {
    resetStylesheetValues();
    styles.forEach(registerStyle);
};
exports.default = stylesheetFactory;
