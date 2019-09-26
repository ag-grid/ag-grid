// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
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
            children: ag_grid_community_1._.map(numberFormats, numberFormat_1.default.getTemplate)
        };
    }
};
exports.default = numberFormatsFactory;
