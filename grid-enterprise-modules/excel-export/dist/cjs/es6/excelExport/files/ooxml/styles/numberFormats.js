"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const numberFormat_1 = require("./numberFormat");
const numberFormatsFactory = {
    getTemplate(numberFormats) {
        return {
            name: "numFmts",
            properties: {
                rawMap: {
                    count: numberFormats.length
                }
            },
            children: numberFormats.map(numberFormat => numberFormat_1.default.getTemplate(numberFormat))
        };
    }
};
exports.default = numberFormatsFactory;
