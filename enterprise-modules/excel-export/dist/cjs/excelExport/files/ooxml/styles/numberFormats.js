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
            children: numberFormats.map(numberFormat_1.default.getTemplate)
        };
    }
};
exports.default = numberFormatsFactory;
//# sourceMappingURL=numberFormats.js.map