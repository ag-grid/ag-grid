// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getExcelCellWidth = function (width) { return Math.max(Math.ceil((width - 12) / 7 + 1), 10); };
var columnFactory = {
    getTemplate: function (config) {
        var min = config.min, max = config.max, s = config.s, _a = config.width, width = _a === void 0 ? 10 : _a, hidden = config.hidden, bestFit = config.bestFit;
        var excelWidth = getExcelCellWidth(width);
        return {
            name: 'col',
            properties: {
                rawMap: {
                    min: min,
                    max: max,
                    width: excelWidth,
                    style: s,
                    hidden: hidden ? '1' : '0',
                    bestFit: bestFit ? '1' : '0',
                    customWidth: excelWidth != 10 ? '1' : '0'
                }
            }
        };
    }
};
exports.default = columnFactory;
