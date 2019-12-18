"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var column_1 = require("./column");
var row_1 = require("./row");
var worksheet = {
    getTemplate: function (ws) {
        var table = ws.table, name = ws.name;
        var columns = table.columns, rows = table.rows;
        var c = columns.map(function (it) { return column_1.default.getTemplate(it); });
        var r = rows.map(function (it) { return row_1.default.getTemplate(it); });
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
//# sourceMappingURL=worksheet.js.map