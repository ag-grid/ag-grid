import { _ } from '@ag-grid-community/core';
const numberFormatFactory = {
    getTemplate(numberFormat) {
        let { formatCode, numFmtId } = numberFormat;
        // excel formulas requires $ to be placed between quotes and symbols to be escaped
        if (formatCode.length) {
            formatCode = _.escapeString(formatCode.replace(/\$/g, '"$"'));
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
