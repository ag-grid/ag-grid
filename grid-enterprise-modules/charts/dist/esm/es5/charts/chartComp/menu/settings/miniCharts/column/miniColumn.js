var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { MiniChartWithAxes } from "../miniChartWithAxes";
import { createColumnRects } from "../miniChartHelpers";
var MiniColumn = /** @class */ (function (_super) {
    __extends(MiniColumn, _super);
    function MiniColumn(container, fills, strokes) {
        var _this = _super.call(this, container, "groupedColumnTooltip") || this;
        _this.columnData = [2, 3, 4];
        var _a = _this, root = _a.root, columnData = _a.columnData, size = _a.size, padding = _a.padding;
        _this.columns = createColumnRects({
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
}(MiniChartWithAxes));
export { MiniColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaUNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL21lbnUvc2V0dGluZ3MvbWluaUNoYXJ0cy9jb2x1bW4vbWluaUNvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUd6RCxPQUFPLEVBQUUsaUJBQWlCLEVBQTJCLE1BQU0scUJBQXFCLENBQUM7QUFFakY7SUFBZ0MsOEJBQWlCO0lBTzdDLG9CQUFZLFNBQXNCLEVBQUUsS0FBZSxFQUFFLE9BQWlCO1FBQXRFLFlBQ0ksa0JBQU0sU0FBUyxFQUFFLHNCQUFzQixDQUFDLFNBa0IzQztRQXJCTyxnQkFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUtyQixJQUFBLEtBQXNDLEtBQUksRUFBeEMsSUFBSSxVQUFBLEVBQUUsVUFBVSxnQkFBQSxFQUFFLElBQUksVUFBQSxFQUFFLE9BQU8sYUFBUyxDQUFDO1FBRWpELEtBQUksQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUM7WUFDN0IsT0FBTyxFQUFFLEtBQUs7WUFDZCxJQUFJLE1BQUE7WUFDSixJQUFJLEVBQUUsVUFBVTtZQUNoQixJQUFJLE1BQUE7WUFDSixPQUFPLFNBQUE7WUFDUCxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN2QixZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BCLGFBQWEsRUFBRSxHQUFHO1NBQ00sQ0FBQyxDQUFDO1FBRTlCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTFCLEtBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDOztJQUN0QyxDQUFDO0lBRUQsaUNBQVksR0FBWixVQUFhLEtBQWUsRUFBRSxPQUFpQjtRQUMzQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQW1CLEVBQUUsQ0FBQztZQUN4QyxNQUFNLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixNQUFNLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFoQ00sb0JBQVMsR0FBYyxlQUFlLENBQUM7SUFpQ2xELGlCQUFDO0NBQUEsQUFsQ0QsQ0FBZ0MsaUJBQWlCLEdBa0NoRDtTQWxDWSxVQUFVIn0=