"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var numberFormat_1 = require("./numberFormat");
var numberFormatsFactory = {
    getTemplate: function (numberFormats) {
        return {
            name: "numFmts",
            properties: {
                rawMap: {
                    count: numberFormats.length
                }
            },
            children: numberFormats.map(function (numberFormat) { return numberFormat_1.default.getTemplate(numberFormat); })
        };
    }
};
exports.default = numberFormatsFactory;
