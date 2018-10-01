import {ExcelOOXMLTemplate, ExcelStyle, ExcelInterior} from 'ag-grid-community';
import numberFormatsFactory from './numberFormats';
import fontsFactory from './fonts';
import fillsFactory from './fills';
import bordersFactory from './borders';
import cellStylesXfsFactory from './cellStyleXfs';
import cellXfsFactory from './cellXfs';
import cellStylesFactory from './cellStyles';

import {NumberFormat, numberFormatMap} from './numberFormat';
import {Font} from './font';
import {Fill} from './fill';
import {Border} from './border';
import {Xf} from './xf';
import {CellStyle} from './cellStyle';

const registeredNumberFmts: NumberFormat[] = [];
const registeredFonts: Font[] = [{ name: 'Calibri', size: '14', colorTheme: '1', family: '2', scheme: 'minor' }];
const registeredFills: Fill[] = [{ patternType: 'none', },{ patternType: 'gray125' }];
const registeredBorders: Border[] = [{ left: undefined, right: undefined, top: undefined, bottom: undefined, diagonal: undefined }];
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

const convertLegacyColor = (color: string): string => {
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

const registerStyle = (config: ExcelStyle): void => {
    const {id, alignment, borders, font, interior, numberFormat} = config;
    let currentFill: number;
    let currentAlignment: number;
    let currentBorder: number;
    let currentFont: number;
    let currentNumberFmt: number;
    let currentProtection: number;

    if (stylesMap[id] != undefined) return;

    if (interior) {
        currentFill = registerFill(interior);
    }

    // if (alignment) {
    //     currentAlignment = registerAlignment(alignment);
    // }

    // if (borders) {
    //     currentBorder = registerBorders(borders);
    // }

    // if (font) {
    //     currentFont = registerFont(font);
    // }

    if (numberFormat) {
        currentNumberFmt = registerNumberFmt(numberFormat.format);
    }

    stylesMap[id] = registeredCellXfs.length;

    registeredCellXfs.push({
        borderId: currentBorder || 0,
        fillId: currentFill || 0,
        fontId: currentFont || 0,
        numFmtId: currentNumberFmt || 0,
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