// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var border_1 = require("./border");
var bordersFactory = {
    getTemplate: function (borders) {
        return {
            name: "borders",
            properties: {
                rawMap: {
                    count: borders.length
                }
            },
            children: ag_grid_community_1._.map(borders, border_1.default.getTemplate)
        };
    }
};
exports.default = bordersFactory;
