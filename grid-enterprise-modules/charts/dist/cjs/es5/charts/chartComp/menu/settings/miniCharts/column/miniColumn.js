"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniColumn = void 0;
var miniChartWithAxes_1 = require("../miniChartWithAxes");
var miniChartHelpers_1 = require("../miniChartHelpers");
var MiniColumn = /** @class */ (function (_super) {
    __extends(MiniColumn, _super);
    function MiniColumn(container, fills, strokes) {
        var _this = _super.call(this, container, "groupedColumnTooltip") || this;
        _this.columnData = [2, 3, 4];
        var _a = _this, root = _a.root, columnData = _a.columnData, size = _a.size, padding = _a.padding;
        _this.columns = miniChartHelpers_1.createColumnRects({
            stacked: false,
            root: root,
            data: columnData,
            size: size,
            padding: padding,
            xScaleDomain: [0, 1, 2],
            yScaleDomain: [0, 4],
            xScalePadding: 0.3
        });
        root.append(_this.columns);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniColumn.prototype.updateColors = function (fills, strokes) {
        this.columns.forEach(function (column, i) {
            column.fill = fills[i];
            column.stroke = strokes[i];
        });
    };
    MiniColumn.chartType = 'groupedColumn';
    return MiniColumn;
}(miniChartWithAxes_1.MiniChartWithAxes));
exports.MiniColumn = MiniColumn;
