"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
function prepareString(str) {
    const split = str.split(/(\[[^\]]*\])/);
    for (let i = 0; i < split.length; i++) {
        // excel formulas require symbols to be escaped. Excel also requires $ to be 
        // placed in quotes but only when the $ is not wrapped inside of square brackets.
        let currentString = split[i];
        if (!currentString.length) {
            continue;
        }
        if (!currentString.startsWith('[')) {
            currentString = currentString.replace(/\$/g, '"$"');
        }
        split[i] = core_1._.escapeString(currentString);
    }
    return split.join('');
}
const numberFormatFactory = {
    getTemplate(numberFormat) {
        let { formatCode, numFmtId } = numberFormat;
        if (formatCode.length) {
            formatCode = prepareString(formatCode);
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
