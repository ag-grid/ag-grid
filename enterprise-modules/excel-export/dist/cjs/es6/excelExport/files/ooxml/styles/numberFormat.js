"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const numberFormatFactory = {
    getTemplate(numberFormat) {
        const { formatCode, numFmtId } = numberFormat;
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
