var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { ChartType } from "@ag-grid-community/core";
import { MiniStackedColumn } from "./miniStackedColumn";
var MiniNormalizedColumn = /** @class */ (function (_super) {
    __extends(MiniNormalizedColumn, _super);
    function MiniNormalizedColumn(container, fills, strokes) {
        return _super.call(this, container, fills, strokes, MiniNormalizedColumn.data, [0, 10], "normalizedColumnTooltip") || this;
    }
    MiniNormalizedColumn.chartType = ChartType.NormalizedColumn;
    MiniNormalizedColumn.data = [
        [10, 10, 10],
        [6, 7, 8],
        [2, 4, 6]
    ];
    return MiniNormalizedColumn;
}(MiniStackedColumn));
export { MiniNormalizedColumn };
