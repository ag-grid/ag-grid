"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const numberFormats_1 = require("./numberFormats");
const fonts_1 = require("./fonts");
const fills_1 = require("./fills");
const borders_1 = require("./borders");
const cellStyleXfs_1 = require("./cellStyleXfs");
const cellXfs_1 = require("./cellXfs");
const cellStyles_1 = require("./cellStyles");
const excelLegacyConvert_1 = require("../../../assets/excelLegacyConvert");
const excelConstants_1 = require("../../../assets/excelConstants");
const excelUtils_1 = require("../../../assets/excelUtils");
let stylesMap;
let registeredNumberFmts;
let registeredFonts;
let registeredFills;
let registeredBorders;
let registeredCellStyleXfs;
let registeredCellXfs;
let registeredCellStyles;
let currentSheet;
const getStyleName = (name, currentSheet) => {
    if (name.indexOf('mixedStyle') !== -1 && currentSheet > 1) {
        name += `_${currentSheet}`;
    }
    return name;
};
const resetStylesheetValues = () => {
    stylesMap = { base: 0 };
    registeredNumberFmts = [];
    registeredFonts = [{ fontName: 'Calibri', colorTheme: '1', family: '2', scheme: 'minor' }];
    registeredFills = [{ patternType: 'none', }, { patternType: 'gray125' }];
    registeredBorders = [{ left: undefined, right: undefined, top: undefined, bottom: undefined, diagonal: undefined }];
    registeredCellStyleXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0 }];
    registeredCellXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0, xfId: 0 }];
    registeredCellStyles = [{ builtinId: 0, name: 'Normal', xfId: 0 }];
};
const registerFill = (fill) => {
    const convertedPattern = excelLegacyConvert_1.convertLegacyPattern(fill.pattern);
    const convertedFillColor = excelLegacyConvert_1.convertLegacyColor(fill.color);
    const convertedPatternColor = excelLegacyConvert_1.convertLegacyColor(fill.patternColor);
    let pos = registeredFills.findIndex(currentFill => {
        const { patternType, fgRgb, bgRgb } = currentFill;
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
const registerNumberFmt = (format) => {
    format = core_1._.utf8_encode(format);
    if (excelConstants_1.numberFormatMap[format]) {
        return excelConstants_1.numberFormatMap[format];
    }
    let pos = registeredNumberFmts.findIndex(currentFormat => currentFormat.formatCode === format);
    if (pos === -1) {
        pos = registeredNumberFmts.length + 164;
        registeredNumberFmts.push({ formatCode: format, numFmtId: pos });
    }
    else {
        pos = registeredNumberFmts[pos].numFmtId;
    }
    return pos;
};
const registerBorders = (borders) => {
    const { borderBottom, borderTop, borderLeft, borderRight } = borders;
    let bottomStyle;
    let topStyle;
    let leftStyle;
    let rightStyle;
    let bottomColor;
    let topColor;
    let leftColor;
    let rightColor;
    if (borderLeft) {
        leftStyle = excelLegacyConvert_1.convertLegacyBorder(borderLeft.lineStyle, borderLeft.weight);
        leftColor = excelLegacyConvert_1.convertLegacyColor(borderLeft.color);
    }
    if (borderRight) {
        rightStyle = excelLegacyConvert_1.convertLegacyBorder(borderRight.lineStyle, borderRight.weight);
        rightColor = excelLegacyConvert_1.convertLegacyColor(borderRight.color);
    }
    if (borderBottom) {
        bottomStyle = excelLegacyConvert_1.convertLegacyBorder(borderBottom.lineStyle, borderBottom.weight);
        bottomColor = excelLegacyConvert_1.convertLegacyColor(borderBottom.color);
    }
    if (borderTop) {
        topStyle = excelLegacyConvert_1.convertLegacyBorder(borderTop.lineStyle, borderTop.weight);
        topColor = excelLegacyConvert_1.convertLegacyColor(borderTop.color);
    }
    let pos = registeredBorders.findIndex(currentBorder => {
        const { left, right, top, bottom } = currentBorder;
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
        const { style: clS, color: clC } = left || {};
        const { style: crS, color: crC } = right || {};
        const { style: ctS, color: ctC } = top || {};
        const { style: cbS, color: cbC } = bottom || {};
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
const registerFont = (font) => {
    const { fontName: name = 'Calibri', color, size, bold, italic, outline, shadow, strikeThrough, underline, family, verticalAlign } = font;
    const utf8Name = name ? core_1._.utf8_encode(name) : name;
    const convertedColor = excelLegacyConvert_1.convertLegacyColor(color);
    const familyId = excelUtils_1.getFontFamilyId(family);
    const convertedUnderline = underline ? underline.toLocaleLowerCase() : undefined;
    const convertedVerticalAlign = verticalAlign ? verticalAlign.toLocaleLowerCase() : undefined;
    let pos = registeredFonts.findIndex(currentFont => {
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
            size,
            bold,
            italic,
            outline,
            shadow,
            strikeThrough,
            underline: convertedUnderline,
            verticalAlign: convertedVerticalAlign,
            family: familyId != null ? familyId.toString() : undefined
        });
    }
    return pos;
};
const registerStyle = (config) => {
    const { alignment, borders, font, interior, numberFormat, protection } = config;
    let { id } = config;
    let currentFill = 0;
    let currentBorder = 0;
    let currentFont = 0;
    let currentNumberFmt = 0;
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
        alignment,
        borderId: currentBorder || 0,
        fillId: currentFill || 0,
        fontId: currentFont || 0,
        numFmtId: currentNumberFmt || 0,
        protection,
        xfId: 0
    });
};
const stylesheetFactory = {
    getTemplate(defaultFontSize) {
        const numberFormats = numberFormats_1.default.getTemplate(registeredNumberFmts);
        const fonts = fonts_1.default.getTemplate(registeredFonts.map(font => (Object.assign(Object.assign({}, font), { size: font.size != null ? font.size : defaultFontSize }))));
        const fills = fills_1.default.getTemplate(registeredFills);
        const borders = borders_1.default.getTemplate(registeredBorders);
        const cellStylesXfs = cellStyleXfs_1.default.getTemplate(registeredCellStyleXfs);
        const cellXfs = cellXfs_1.default.getTemplate(registeredCellXfs);
        const cellStyles = cellStyles_1.default.getTemplate(registeredCellStyles);
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
exports.getStyleId = (name, currentSheet) => {
    return stylesMap[getStyleName(name, currentSheet)] || 0;
};
exports.registerStyles = (styles, _currentSheet) => {
    currentSheet = _currentSheet;
    if (currentSheet === 1) {
        resetStylesheetValues();
    }
    styles.forEach(registerStyle);
};
exports.default = stylesheetFactory;
