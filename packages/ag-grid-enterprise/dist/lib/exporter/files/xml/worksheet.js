// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var column_1 = require("./column");
var row_1 = require("./row");
var worksheet = {
    getTemplate: function (ws) {
        var table = ws.table, name = ws.name;
        var columns = table.columns, rows = table.rows;
        var c = ag_grid_community_1._.map(columns, function (it) { return column_1.default.getTemplate(it); });
        var r = ag_grid_community_1._.map(rows, function (it) { return row_1.default.getTemplate(it); });
        return {
            name: "Worksheet",
            children: [{
                    name: "Table",
                    children: c.concat(r)
                }],
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Name: name
                        }
                    }]
            }
        };
    }
};
exports.default = worksheet;
