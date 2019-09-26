// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var sheet_1 = require("./sheet");
var sheetsFactory = {
    getTemplate: function (names) {
        return {
            name: "sheets",
            children: ag_grid_community_1._.map(names, sheet_1.default.getTemplate)
        };
    }
};
exports.default = sheetsFactory;
