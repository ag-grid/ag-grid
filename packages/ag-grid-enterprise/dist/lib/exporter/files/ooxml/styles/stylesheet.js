// ag-grid-enterprise v19.1.3
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var registeredNumberFmts = [];
var registeredFonts = [{ name: 'Calibri', size: 14, colorTheme: '1', family: 2, scheme: 'minor' }];
var registeredFills = [{ patternType: 'none', }, { patternType: 'gray125' }];
var registeredBorders = [{ left: undefined, right: undefined, top: undefined, bottom: undefined, diagonal: undefined }];
var registeredCellStyleXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0 }];
var registeredCellXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0, xfId: 0 }];
var registeredCellStyles = [{ builtinId: 0, name: 'normal', xfId: 0 }];
var stylesMap = { base: 0 };
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
    if (!name)
        return 'none';
    return colorMap[name] || name;
};
exports.convertLegacyColor = function (color) {
    if (color == undefined)
        return color;
    if (color.charAt(0) === '#') {
        color = color.substr(1);
    }
    return color.length === 6 ? '00' + color : color;
};
var registerFill = function (fill) {
    var convertedPattern = convertLegacyPattern(fill.pattern);
    var convertedFillColor = exports.convertLegacyColor(fill.color);
    var convertedPatternColor = exports.convertLegacyColor(fill.patternColor);
    var reg = registeredFills.filter(function (currentFill) {
        if (currentFill.patternType != convertedPattern)
            return false;
        if (currentFill.fgRgb != convertedFillColor)
            return false;
        if (currentFill.bgRgb != convertedPatternColor)
            return false;
        return true;
    });
    var pos = reg.length ? registeredFills.indexOf(reg[0]) : -1;
    if (pos === -1) {
        pos = registeredFills.length;
        registeredFills.push({ patternType: convertedPattern, fgRgb: convertedFillColor, bgRgb: convertedPatternColor });
    }
    return pos;
};
var registerNumberFmt = function (format) {
    if (numberFormat_1.numberFormatMap[format])
        return numberFormat_1.numberFormatMap[format];
    var reg = registeredNumberFmts.filter(function (currentFmt) {
        if (currentFmt.formatCode !== format)
            return false;
    });
    var pos = reg.length ? reg[0].numFmtId : -1;
    if (pos === -1) {
        pos = registeredNumberFmts.length + 164;
        registeredNumberFmts.push({ formatCode: format, numFmtId: pos });
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
    var reg = registeredBorders.filter(function (currentBorder) {
        var left = currentBorder.left, right = currentBorder.right, top = currentBorder.top, bottom = currentBorder.bottom;
        if (!left && (leftStyle || leftColor))
            return false;
        if (!right && (rightStyle || rightColor))
            return false;
        if (!top && (topStyle || topColor))
            return false;
        if (!bottom && (bottomStyle || bottomColor))
            return false;
        var clS = left.style, clC = left.color;
        var crS = right.style, crC = right.color;
        var ctS = top.style, ctC = top.color;
        var cbS = bottom.style, cbC = bottom.color;
        if (clS != leftStyle || clC != leftColor)
            return false;
        if (crS != rightStyle || crC != rightColor)
            return false;
        if (ctS != topStyle || ctC != topColor)
            return false;
        if (cbS != bottomStyle || cbC != bottomColor)
            return false;
        return true;
    });
    var pos = reg.length ? registeredBorders.indexOf(reg[0]) : -1;
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
    var convertedColor = exports.convertLegacyColor(color);
    var familyId = font_1.getFamilyId(family);
    var reg = registeredFonts.filter(function (currentFont) {
        if (currentFont.name != name)
            return false;
        if (currentFont.color != convertedColor)
            return false;
        if (currentFont.size != size)
            return false;
        if (currentFont.bold != bold)
            return false;
        if (currentFont.italic != italic)
            return false;
        if (currentFont.outline != outline)
            return false;
        if (currentFont.shadow != shadow)
            return false;
        if (currentFont.strike != strikeThrough)
            return false;
        if (currentFont.underline != underline)
            return false;
        if (currentFont.family != familyId)
            return false;
        return true;
    });
    var pos = reg.length ? registeredFonts.indexOf(reg[0]) : -1;
    if (pos === -1) {
        pos = registeredFonts.length;
        registeredFonts.push({
            name: name,
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
    var currentFill;
    var currentBorder;
    var currentFont;
    var currentNumberFmt;
    if (stylesMap[id] != undefined)
        return;
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
        return {
            name: 'styleSheet',
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
                }
            },
            children: [
                numberFormats_1.default.getTemplate(registeredNumberFmts),
                fonts_1.default.getTemplate(registeredFonts),
                fills_1.default.getTemplate(registeredFills),
                borders_1.default.getTemplate(registeredBorders),
                cellStyleXfs_1.default.getTemplate(registeredCellStyleXfs),
                cellXfs_1.default.getTemplate(registeredCellXfs),
                cellStyles_1.default.getTemplate(registeredCellStyles),
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
    styles.forEach(registerStyle);
};
exports.default = stylesheetFactory;
