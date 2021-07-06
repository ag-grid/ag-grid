import { ExcelOOXMLTemplate } from '@ag-grid-community/core';
import { ExcelThemeFont } from '../../../assets/excelInterfaces';
import fontFactory from './font';

const fontsFactory: ExcelOOXMLTemplate = {
    getTemplate(fonts: ExcelThemeFont[]) {
        return {
            name: "fonts",
            properties: {
                rawMap: {
                    count: fonts.length
                }
            },
            children: fonts.map(font => fontFactory.getTemplate(font))
        };
    }
};

export default fontsFactory;
