// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var xf_1 = require("./xf");
var cellStylesXfsFactory = {
    getTemplate: function (xf) {
        return {
            name: "cellStyleXfs",
            properties: {
                rawMap: {
                    count: xf.length
                }
            },
            children: ag_grid_community_1._.map(xf, xf_1.default.getTemplate)
        };
    }
};
exports.default = cellStylesXfsFactory;
