"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var numberFormatFactory = {
    getTemplate: function (numberFormat) {
        var formatCode = numberFormat.formatCode, numFmtId = numberFormat.numFmtId;
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
