// ag-grid-enterprise v19.1.3
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var cell_1 = require("./cell");
var rowFactory = {
    getTemplate: function (config) {
        var index = config.index, collapsed = config.collapsed, hidden = config.hidden, height = config.height, outlineLevel = config.outlineLevel, s = config.s, _a = config.cells, cells = _a === void 0 ? [] : _a;
        var children = ag_grid_community_1._.map(cells, cell_1.default.getTemplate);
        return {
            name: "row",
            properties: {
                rawMap: {
                    r: index,
                    collapsed: collapsed,
                    hidden: hidden ? '1' : '0',
                    ht: height,
                    customHeight: height != null ? '1' : '0',
                    s: s,
                    customFormat: s != null ? '1' : '0'
                }
            },
            children: children
        };
    }
};
exports.default = rowFactory;
