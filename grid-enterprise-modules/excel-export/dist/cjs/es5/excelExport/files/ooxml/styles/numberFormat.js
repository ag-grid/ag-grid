"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var numberFormatFactory = {
    getTemplate: function (numberFormat) {
        var formatCode = numberFormat.formatCode, numFmtId = numberFormat.numFmtId;
        // excel formulas requires $ to be placed between quotes and symbols to be escaped
        if (formatCode.length) {
            formatCode = core_1._.escapeString(formatCode.replace(/\$/g, '"$"'));
        }
        return {
            name: "numFmt",
            properties: {
                rawMap: {
                    formatCode: formatCode,
                    numFmtId: numFmtId
                }
            }
        };
    }
};
exports.default = numberFormatFactory;
