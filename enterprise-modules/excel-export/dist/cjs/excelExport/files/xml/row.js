"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cell_1 = require("./cell");
var row = {
    getTemplate: function (r) {
        var cells = r.cells;
        return {
            name: "Row",
            children: cells.map(function (it) { return cell_1.default.getTemplate(it); })
        };
    }
};
exports.default = row;
//# sourceMappingURL=row.js.map