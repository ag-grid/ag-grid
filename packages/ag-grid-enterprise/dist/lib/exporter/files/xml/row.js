// ag-grid-enterprise v19.1.3
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var cell_1 = require("./cell");
var row = {
    getTemplate: function (r) {
        var cells = r.cells;
        return {
            name: "Row",
            children: ag_grid_community_1.Utils.map(cells, function (it) {
                return cell_1.default.getTemplate(it);
            })
        };
    }
};
exports.default = row;
