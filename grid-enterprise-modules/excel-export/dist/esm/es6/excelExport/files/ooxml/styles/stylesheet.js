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
    const convertedPattern = convertLegacyPattern(fill.pattern);
    const convertedFillColor = convertLegacyColor(fill.color);
    const convertedPatternColor = convertLegacyColor(fill.patternColor);
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
    format = _.utf8_encode(format);
    if (numberFormatMap[format]) {
        return numberFormatMap[format];
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
    const utf8Name = name ? _.utf8_encode(name) : name;
    const convertedColor = convertLegacyColor(color);
    const familyId = getFontFamilyId(family);
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
        const numberFormats = numberFormatsFactory.getTemplate(registeredNumberFmts);
        const fonts = fontsFactory.getTemplate(registeredFonts.map(font => (Object.assign(Object.assign({}, font), { size: font.size != null ? font.size : defaultFontSize }))));
        const fills = fillsFactory.getTemplate(registeredFills);
        const borders = bordersFactory.getTemplate(registeredBorders);
        const cellStylesXfs = cellStylesXfsFactory.getTemplate(registeredCellStyleXfs);
        const cellXfs = cellXfsFactory.getTemplate(registeredCellXfs);
        const cellStyles = cellStylesFactory.getTemplate(registeredCellStyles);
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
export const getStyleId = (name, currentSheet) => {
    return stylesMap[getStyleName(name, currentSheet)] || 0;
};
export const registerStyles = (styles, _currentSheet) => {
    currentSheet = _currentSheet;
    if (currentSheet === 1) {
        resetStylesheetValues();
    }
    styles.forEach(registerStyle);
};
export default stylesheetFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVzaGVldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9zdHlsZXMvc3R5bGVzaGVldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQTBFLENBQUMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3BILE9BQU8sb0JBQW9CLE1BQU0saUJBQWlCLENBQUM7QUFDbkQsT0FBTyxZQUFZLE1BQU0sU0FBUyxDQUFDO0FBQ25DLE9BQU8sWUFBWSxNQUFNLFNBQVMsQ0FBQztBQUNuQyxPQUFPLGNBQWMsTUFBTSxXQUFXLENBQUM7QUFDdkMsT0FBTyxvQkFBb0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRCxPQUFPLGNBQWMsTUFBTSxXQUFXLENBQUM7QUFDdkMsT0FBTyxpQkFBaUIsTUFBTSxjQUFjLENBQUM7QUFLN0MsT0FBTyxFQUFFLG1CQUFtQixFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDbkgsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUU3RCxJQUFJLFNBQW9CLENBQUM7QUFDekIsSUFBSSxvQkFBb0MsQ0FBQztBQUN6QyxJQUFJLGVBQWlDLENBQUM7QUFDdEMsSUFBSSxlQUF1QixDQUFDO0FBQzVCLElBQUksaUJBQThCLENBQUM7QUFDbkMsSUFBSSxzQkFBNEIsQ0FBQztBQUNqQyxJQUFJLGlCQUF1QixDQUFDO0FBQzVCLElBQUksb0JBQWlDLENBQUM7QUFDdEMsSUFBSSxZQUFvQixDQUFDO0FBRXpCLE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBWSxFQUFFLFlBQW9CLEVBQVUsRUFBRTtJQUNoRSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUks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