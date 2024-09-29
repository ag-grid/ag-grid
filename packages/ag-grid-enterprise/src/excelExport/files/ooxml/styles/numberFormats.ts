import type { ExcelOOXMLTemplate } from 'ag-grid-community';

import type { NumberFormat } from '../../../assets/excelInterfaces';
import numberFormatFactory from './numberFormat';

const numberFormatsFactory: ExcelOOXMLTemplate = {
    getTemplate(numberFormats: NumberFormat[]) {
        return {
            name: 'numFmts',
            properties: {
                rawMap: {
                    count: numberFormats.length,
                },
            },
            children: numberFormats.map((numberFormat) => numberFormatFactory.getTemplate(numberFormat)),
        };
    },
};

export default numberFormatsFactory;
