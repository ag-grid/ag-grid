import {ExcelOOXMLTemplate} from 'ag-grid-community';
import fontsFactory from './fonts';
import fillsFactory from './fills';
import bordersFactory from './borders';
import {Border} from './border';
import cellStylesXfsFactory from './cellStyleXfs';
import cellXfsFactory from './cellXfs';
import cellStylesFactory from './cellStyles';

const baseFonts = [{ name: 'Calibri', size: '14', colorTheme: '1', familiy: '2', scheme: 'minor' }];
const baseFills = [{ patternType: 'none', },{ patternType: 'gray125' }];
const baseBorders: Border[] = [{ left: undefined, right: undefined, top: undefined, bottom: undefined, diagonal: undefined }];
const baseCellStyleXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0 }];
const baseCellXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0, xfId: 0 }];
const baseCellStyles =[{ builtinId: 0, name: 'normal', xfId: 0 }];

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
                fontsFactory.getTemplate(baseFonts),
                fillsFactory.getTemplate(baseFills),
                bordersFactory.getTemplate(baseBorders),
                cellStylesXfsFactory.getTemplate(baseCellStyleXfs),
                cellXfsFactory.getTemplate(baseCellXfs),
                cellStylesFactory.getTemplate(baseCellStyles),
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

export default stylesheetFactory;