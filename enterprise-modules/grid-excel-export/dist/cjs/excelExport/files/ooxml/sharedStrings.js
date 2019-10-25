"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-community/grid-core");
var buildSharedString = function (textNode) { return ({
    name: 'si',
    children: [{
            name: 't',
            textNode: grid_core_1._.utf8_encode(grid_core_1._.escape(textNode.toString()))
        }]
}); };
var sharedStrings = {
    getTemplate: function (strings) {
        return {
            name: "sst",
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                    count: strings.length,
                    uniqueCount: strings.length
                }
            },
            children: strings.map(buildSharedString)
        };
    }
};
exports.default = sharedStrings;
