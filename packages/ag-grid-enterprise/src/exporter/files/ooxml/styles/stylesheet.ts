import {ExcelOOXMLTemplate, ExcelStyle, ExcelInterior, ExcelBorders, ExcelFont} from 'ag-grid-community';
import numberFormatsFactory from './numberFormats';
import fontsFactory from './fonts';
import fillsFactory from './fills';
import bordersFactory from './borders';
import cellStylesXfsFactory from './cellStyleXfs';
import cellXfsFactory from './cellXfs';
import cellStylesFactory from './cellStyles';

import {NumberFormat, numberFormatMap} from './numberFormat';
import {getFamilyId, Font} from './font';
import {Fill} from './fill';
import {convertLegacyBorder, BorderSet} from './border';
import {Xf} from './xf';
import {CellStyle} from './cellStyle';

const registeredNumberFmts: NumberFormat[] = [];
const registeredFonts: Font[] = [{ name: 'Calibri', size: 14, colorTheme: '1', family: 2, scheme: 'minor' }];
const registeredFills: Fill[] = [{ patternType: 'none', },{ patternType: 'gray125' }];
const registeredBorders: BorderSet[] = [{ left: undefined, right: undefined, top: undefined, bottom: undefined, diagonal: undefined }];
const registeredCellStyleXfs: Xf[] = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0 }];
const registeredCellXfs: Xf[] = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0, xfId: 0 }];
const registeredCellStyles: CellStyle[] =[{ builtinId: 0, name: 'normal', xfId: 0 }];

interface StylesMap {
    [key: string]: number;
}

interface ColorMap {
    [key: string]: string;
}
const stylesMap:StylesMap  = {base: 0};

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

    if (!name) return 'none';

    return colorMap[name] || name;
};

export const convertLegacyColor = (color: string): string => {
    if (color == undefined) return color;

    if (color.charAt(0) === '#') {
        color = color.substr(1);
    }

    return color.length === 6 ? '00' + color : color;
};

const registerFill = (fill: ExcelInterior): number => {
    const convertedPattern =  convertLegacyPattern(fill.pattern);
    const convertedFillColor = convertLegacyColor(fill.color);
    const convertedPatternColor = convertLegacyColor(fill.patternColor);
    const reg = registeredFills.filter(currentFill => {
        if (currentFill.patternType != convertedPattern) return false;
        if (currentFill.fgRgb != convertedFillColor) return false;
        if (currentFill.bgRgb != convertedPatternColor) return false;

        return true;
    });

    let pos = reg.length ? registeredFills.indexOf(reg[0]) : -1;

    if (pos === -1) {
        pos = registeredFills.length;
        registeredFills.push({patternType: convertedPattern, fgRgb: convertedFillColor, bgRgb: convertedPatternColor});
    }

    return pos;
};

const registerNumberFmt = (format: string): number => {
    if (numberFormatMap[format]) return numberFormatMap[format];
    const reg = registeredNumberFmts.filter((currentFmt) => {
        if (currentFmt.formatCode !== format) return false;
    });

    let pos = reg.length ? reg[0].numFmtId : -1;

    if (pos === -1) {
        pos = registeredNumberFmts.length + 164;
        registeredNumberFmts.push({formatCode: format, numFmtId: pos});
    }

    return pos;
};

const registerBorders = (borders: ExcelBorders): number => {
    const {borderBottom, borderTop, borderLeft, borderRight} = borders;
    let bottomStyle: string, topStyle: string, leftStyle:string, rightStyle: string;
    let bottomColor: string, topColor: string, leftColor:string, rightColor: string;

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

    const reg = registeredBorders.filter(currentBorder => {
        const {left, right, top, bottom} = currentBorder;
        if (!left && (leftStyle || leftColor)) return false;
        if (!right && (rightStyle || rightColor)) return false;
        if (!top && (topStyle || topColor)) return false;
        if (!bottom && (bottomStyle || bottomColor)) return false;

        const {style: clS, color: clC} = left;
        const {style: crS, color: crC} = right;
        const {style: ctS, color: ctC} = top;
        const {style: cbS, color: cbC} = bottom;

        if (clS != leftStyle || clC != leftColor) return false;
        if (crS != rightStyle || crC != rightColor) return false;
        if (ctS != topStyle || ctC != topColor) return false;
        if (cbS != bottomStyle || cbC != bottomColor) return false;

        return true;
    });

    let pos = reg.length ? registeredBorders.indexOf(reg[0]) : -1;

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
    const convertedColor = convertLegacyColor(color);
    const familyId = getFamilyId(family);

    const reg = registeredFonts.filter(currentFont => {
        if (currentFont.name != name) return false;
        if (currentFont.color != convertedColor) return false;
        if (currentFont.size != size) return false;
        if (currentFont.bold != bold) return false;
        if (currentFont.italic != italic) return false;
        if (currentFont.outline != outline) return false;
        if (currentFont.shadow != shadow) return false;
        if (currentFont.strike != strikeThrough) return false;
        if (currentFont.underline != underline) return false;
        if (currentFont.family != familyId) return false;

        return true;
    });

    let pos = reg.length ? registeredFonts.indexOf(reg[0]) : -1;

    if (pos === -1) {
        pos = registeredFonts.length;
        registeredFonts.push({
            name,
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
    const {id, alignment, borders, font, interior, numberFormat, protection} = config;
    let currentFill: number;
    let currentBorder: number;
    let currentFont: number;
    let currentNumberFmt: number;

    if (stylesMap[id] != undefined) return;

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

        return {
            name: 'styleSheet',
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
                }
            },
            children: [
                numberFormatsFactory.getTemplate(registeredNumberFmts),
                fontsFactory.getTemplate(registeredFonts),
                fillsFactory.getTemplate(registeredFills),
                bordersFactory.getTemplate(registeredBorders),
                cellStylesXfsFactory.getTemplate(registeredCellStyleXfs),
                cellXfsFactory.getTemplate(registeredCellXfs),
                cellStylesFactory.getTemplate(registeredCellStyles),
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
    styles.forEach(registerStyle);
};

export default stylesheetFactory;