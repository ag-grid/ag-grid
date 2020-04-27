"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var worksheet_1 = require("./worksheet");
var cell_1 = require("./cell");
var addEmptyCells = function (cells, rowIdx) {
    var mergeMap = [];
    var posCounter = 0;
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        if (cell.mergeAcross) {
            mergeMap.push({
                pos: i,
                excelPos: posCounter
            });
            posCounter += cells[i].mergeAcross;
        }
        posCounter++;
    }
    if (mergeMap.length) {
        for (var i = mergeMap.length - 1; i >= 0; i--) {
            var mergedCells = [];
            var cell = cells[mergeMap[i].pos];
            for (var j = 1; j <= cell.mergeAcross; j++) {
                mergedCells.push({
                    ref: "" + worksheet_1.getExcelColumnName(mergeMap[i].excelPos + 1 + j) + (rowIdx + 1),
                    styleId: cell.styleId,
                    data: { type: 'empty', value: null }
                });
            }
            if (mergedCells.length) {
                cells.splice.apply(cells, __spreadArrays([mergeMap[i].pos + 1, 0], mergedCells));
            }
        }
    }
};
var rowFactory = {
    getTemplate: function (config, idx) {
        var index = config.index, collapsed = config.collapsed, hidden = config.hidden, height = config.height, s = config.s, _a = config.cells, cells = _a === void 0 ? [] : _a;
        addEmptyCells(cells, idx);
        var children = cells.map(cell_1.default.getTemplate);
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
//# sourceMappingURL=row.js.map