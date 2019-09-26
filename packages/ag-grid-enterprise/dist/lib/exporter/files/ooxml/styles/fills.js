// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var fill_1 = require("./fill");
var fillsFactory = {
    getTemplate: function (fills) {
        return {
            name: "fills",
            properties: {
                rawMap: {
                    count: fills.length
                }
            },
            children: ag_grid_community_1._.map(fills, fill_1.default.getTemplate)
        };
    }
};
exports.default = fillsFactory;
