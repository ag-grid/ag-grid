import { ExcelOOXMLTemplate, _ } from '@ag-grid-community/core';
import { NumberFormat } from '../../../assets/excelInterfaces';

const numberFormatFactory: ExcelOOXMLTemplate = {
    getTemplate(numberFormat: NumberFormat) {
        let { formatCode, numFmtId } = numberFormat;

        // excel formulas requires $ to be placed between quotes and symbols to be escaped
        if (formatCode.length) {
            formatCode = _.escapeString(formatCode.replace(/\$/g, '"$"'))!;
        }

        return {
            name: "numFmt",
            properties: {
                rawMap: {
                    formatCode,
                    numFmtId
                }
            }
        };
    }
};

export default numberFormatFactory;
