// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var buildSharedString = function (textNode) { return ({
    name: 'si',
    children: [{
            name: 't',
            textNode: ag_grid_community_1._.utf8_encode(ag_grid_community_1._.escape(textNode.toString()))
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
            children: ag_grid_community_1._.map(strings, buildSharedString)
        };
    }
};
exports.default = sharedStrings;
