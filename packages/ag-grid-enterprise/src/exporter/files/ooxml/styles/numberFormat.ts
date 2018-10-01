import {ExcelOOXMLTemplate} from 'ag-grid-community';

const numberFormatFactory: ExcelOOXMLTemplate = {
    getTemplate(numberFormat: NumberFormat) {
        const {formatCode, numFmtId} = numberFormat;

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

export interface NumberFormat {
    formatCode: string;
    numFmtId: string;
}