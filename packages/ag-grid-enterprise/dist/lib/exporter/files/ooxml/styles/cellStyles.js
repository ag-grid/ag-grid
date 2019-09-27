// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var cellStyle_1 = require("./cellStyle");
var cellStylesFactory = {
    getTemplate: function (cellStyles) {
        return {
            name: "cellStyles",
            properties: {
                rawMap: {
                    count: cellStyles.length
                }
            },
            children: ag_grid_community_1._.map(cellStyles, cellStyle_1.default.getTemplate)
        };
    }
};
exports.default = cellStylesFactory;
