import { ExcelOOXMLTemplate, _ } from 'ag-grid-community';
import numberFormatFactory, { NumberFormat } from './numberFormat';

const numberFormatsFactory: ExcelOOXMLTemplate = {
    getTemplate(numberFormats: NumberFormat[]) {
        return {
            name: "numFmts",
            properties: {
                rawMap: {
                    count: numberFormats.length
                }
            },
            children: _.map(numberFormats, numberFormatFactory.getTemplate)
        };
    }
};

export default numberFormatsFactory;
