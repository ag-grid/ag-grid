"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const numberFormatFactory = {
    getTemplate(numberFormat) {
        let { formatCode, numFmtId } = numberFormat;
        // excel formulas requires $ to be placed between quotes and symbols to be escaped
        if (formatCode.length) {
            formatCode = core_1._.escapeString(formatCode.replace(/\$/g, '"$"'));
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
exports.default = numberFormatFactory;
