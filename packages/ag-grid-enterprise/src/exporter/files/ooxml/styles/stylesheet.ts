import { ExcelOOXMLTemplate, ExcelStyle, ExcelInterior, ExcelBorders, ExcelFont, _ } from 'ag-grid-community';
import numberFormatsFactory from './numberFormats';
import fontsFactory from './fonts';
import fillsFactory from './fills';
import bordersFactory from './borders';
import cellStylesXfsFactory from './cellStyleXfs';
import cellXfsFactory from './cellXfs';
import cellStylesFactory from './cellStyles';

import { NumberFormat, numberFormatMap } from './numberFormat';
import { getFamilyId, Font } from './font';
import { Fill } from './fill';
import { convertLegacyBorder, BorderSet, Border } from './border';
import { Xf } from './xf';
import { CellStyle } from './cellStyle';

let stylesMap: StylesMap;
let registeredNumberFmts: NumberFormat[];
let registeredFonts: Font[];
let registeredFills: Fill[];
let registeredBorders: BorderSet[];
let registeredCellStyleXfs: Xf[];
let registeredCellXfs: Xf[];
let registeredCellStyles: CellStyle[];

interface StylesMap {
    [key: string]: number;
}

interface ColorMap {
    [key: string]: string;
}
type BorderProperty = string | undefined;

const resetStylesheetValues = (): void => {
    stylesMap = { base: 0 };
    registeredNumberFmts = [];
    registeredFonts = [{ name: 'Calibri', size: 14, colorTheme: '1', family: 2, scheme: 'minor' }];
    registeredFills = [{ patternType: 'none', }, { patternType: 'gray125' }];
    registeredBorders = [{ left: undefined, right: undefined, top: undefined, bottom: undefined, diagonal: undefined }];
    registeredCellStyleXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0 }];
    registeredCellXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0, xfId: 0 }];
    registeredCellStyles = [{ builtinId: 0, name: 'normal', xfId: 0 }];
};

const convertLegacyPattern = (name: string): string => {
    const colorMap: ColorMap = {
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

    if (!name) { return 'none'; }

    return colorMap[name] || name;
};

export const convertLegacyColor = (color: string): string => {
    if (color == undefined) { return color; }

    if (color.charAt(0) === '#') {
        color = color.substr(1);
    }

    return color.length === 6 ? '00' + color : color;
};

const registerFill = (fill: ExcelInterior): number => {
    const convertedPattern =  convertLegacyPattern(fill.pattern);
    const convertedFillColor = convertLegacyColor(fill.color);
    const convertedPatternColor = convertLegacyColor(fill.patternColor);

    let pos = _.findIndex(registeredFills, currentFill => {
        const { patternType, fgRgb, bgRgb } = currentFill;

        if (
            patternType != convertedPattern ||
            fgRgb != convertedFillColor ||
            bgRgb != convertedPatternColor
        ) {
            return false;
        }
        return true;
    });

    if (pos === -1) {
        pos = registeredFills.length;
        registeredFills.push({patternType: convertedPattern, fgRgb: convertedFillColor, bgRgb: convertedPatternColor});
    }

    return pos;
};

const registerNumberFmt = (format: string): number => {
    format = _.utf8_encode(format);
    if (numberFormatMap[format]) { return numberFormatMap[format]; }

    let pos = _.findIndex(registeredNumberFmts, currentFormat => currentFormat.formatCode === format);

    if (pos === -1) {
        pos = registeredNumberFmts.length + 164;
        registeredNumberFmts.push({formatCode: format, numFmtId: pos});
    } else {
        pos = registeredNumberFmts[pos].numFmtId;
    }

    return pos;
};

const registerBorders = (borders: ExcelBorders): number => {
    const {borderBottom, borderTop, borderLeft, borderRight} = borders;
    let bottomStyle: BorderProperty, topStyle: BorderProperty, leftStyle:BorderProperty, rightStyle: BorderProperty;
    let bottomColor: BorderProperty, topColor: BorderProperty, leftColor:BorderProperty, rightColor: BorderProperty;

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

    let pos = _.findIndex(registeredBorders, currentBorder => {
        const { left, right, top, bottom } = currentBorder;
        if (!left && (leftStyle || leftColor)) { return false; }
        if (!right && (rightStyle || rightColor)) { return false; }
        if (!top && (topStyle || topColor)) { return false; }
        if (!bottom && (bottomStyle || bottomColor)) { return false; }

        const { style: clS, color: clC } = left || {} as Border;
        const { style: crS, color: crC } = right || {} as Border;
        const { style: ctS, color: ctC } = top || {} as Border;
        const { style: cbS, color: cbC } = bottom || {} as Border;

        if (clS != leftStyle || clC != leftColor) { return false; }
        if (crS != rightStyle || crC != rightColor) { return false; }
        if (ctS != topStyle || ctC != topColor) { return false; }
        if (cbS != bottomStyle || cbC != bottomColor) { return false; }

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

const registerFont = (font: ExcelFont): number => {
    const {fontName: name, color, size, bold, italic, outline, shadow, strikeThrough, underline, family} = font;
    const utf8Name = name ? _.utf8_encode(name) : name;
    const convertedColor = convertLegacyColor(color);
    const familyId = getFamilyId(family);

    let pos = _.findIndex(registeredFonts, (currentFont) => {
        if (
            currentFont.name != utf8Name ||
            currentFont.color != convertedColor ||
            currentFont.size != size ||
            currentFont.bold != bold ||
            currentFont.italic != italic ||
            currentFont.outline != outline ||
            currentFont.shadow != shadow ||
            currentFont.strike != strikeThrough ||
            currentFont.underline != underline ||
            currentFont.family != familyId
        ) {
            return false;
        }

        return true;
    });

    if (pos === -1) {
        pos = registeredFonts.length;
        registeredFonts.push({
            name: utf8Name,
            color: convertedColor,
            size,
            bold,
            italic,
            outline,
            shadow,
            strike: strikeThrough,
            underline,
            family: familyId
        });
    }

    return pos;
};

const registerStyle = (config: ExcelStyle): void => {
    const { id, alignment, borders, font, interior, numberFormat, protection } = config;
    let currentFill = 0;
    let currentBorder = 0;
    let currentFont = 0;
    let currentNumberFmt = 0;

    if (!id || stylesMap[id] != undefined) { return; }

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

const stylesheetFactory: ExcelOOXMLTemplate = {
    getTemplate() {
        const numberFormats = numberFormatsFactory.getTemplate(registeredNumberFmts);
        const fonts = fontsFactory.getTemplate(registeredFonts);
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

export const getStyleId = (name: string): number => {
    return stylesMap[name] || 0;
};

export const registerStyles = (styles: ExcelStyle[]): void => {
    resetStylesheetValues();
    styles.forEach(registerStyle);
};

export default stylesheetFactory;
