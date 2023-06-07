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
import { _Scene } from "ag-charts-community";
var MiniStackedBar = /** @class */ (function (_super) {
    __extends(MiniStackedBar, _super);
    function MiniStackedBar(container, fills, strokes, data, xScaleDomain, tooltipName) {
        if (data === void 0) { data = MiniStackedBar.data; }
        if (xScaleDomain === void 0) { xScaleDomain = [0, 16]; }
        if (tooltipName === void 0) { tooltipName = "stackedBarTooltip"; }
        var _this = _super.call(this, container, tooltipName) || this;
        var size = _this.size;
        var padding = _this.padding;
        var yScale = new _Scene.BandScale();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;
        var xScale = new _Scene.LinearScale();
        xScale.domain = xScaleDomain;
        xScale.range = [size - padding, padding];
        var bottom = xScale.convert(0);
        var height = yScale.bandwidth;
        _this.bars = data.map(function (series) {
            return series.map(function (datum, i) {
                var rect = new _Scene.Rect();
                rect.x = padding;
                rect.y = yScale.convert(i);
                rect.width = bottom - xScale.convert(datum);
                rect.height = height;
                rect.strokeWidth = 1;
                rect.crisp = true;
                return rect;
            });
        });
        _this.updateColors(fills, strokes);
        _this.root.append([].concat.apply([], _this.bars));
        return _this;
    }
    MiniStackedBar.prototype.updateColors = function (fills, strokes) {
        this.bars.forEach(function (series, i) {
            return series.forEach(function (bar) {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            });
        });
    };
    MiniStackedBar.chartType = 'stackedBar';
    MiniStackedBar.data = [
        [8, 12, 16],
        [6, 9, 12],
        [2, 3, 4]
    ];
    return MiniStackedBar;
}(MiniChartWithAxes));
export { MiniStackedBar };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaVN0YWNrZWRCYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L3NldHRpbmdzL21pbmlDaGFydHMvYmFyL21pbmlTdGFja2VkQmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUc3QztJQUFvQyxrQ0FBaUI7SUFXakQsd0JBQ0ksU0FBc0IsRUFDdEIsS0FBZSxFQUNmLE9BQWlCLEVBQ2pCLElBQTBCLEVBQzFCLFlBQXNCLEVBQ3RCLFdBQWlDO1FBRmpDLHFCQUFBLEVBQUEsT0FBTyxjQUFjLENBQUMsSUFBSTtRQUMxQiw2QkFBQSxFQUFBLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3RCLDRCQUFBLEVBQUEsaUNBQWlDO1FBTnJDLFlBT0ksa0JBQU0sU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQWtDaEM7UUFoQ0csSUFBTSxJQUFJLEdBQUcsS0FBSSxDQUFDLElBQUksQ0FBQztRQUN2QixJQUFNLE9BQU8sR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDO1FBRTdCLElBQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBVSxDQUFDO1FBQzlDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO1FBRTFCLElBQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLEdBQUcsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXpDLElBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUVoQyxLQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNO1lBQ3ZCLE9BQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNoQixJQUFNLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztnQkFFbEIsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQyxDQUFDO1FBVkYsQ0FVRSxDQUNMLENBQUM7UUFFRixLQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsQyxLQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBRSxFQUFvQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztJQUN4RSxDQUFDO0lBRUQscUNBQVksR0FBWixVQUFhLEtBQWUsRUFBRSxPQUFpQjtRQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3hCLE9BQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7Z0JBQ2QsR0FBRyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLENBQUMsQ0FBQztRQUhGLENBR0UsQ0FDTCxDQUFDO0lBQ04sQ0FBQztJQTNETSx3QkFBUyxHQUFjLFlBQVksQ0FBQztJQUNwQyxtQkFBSSxHQUFHO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ1osQ0FBQztJQXVETixxQkFBQztDQUFBLEFBOURELENBQW9DLGlCQUFpQixHQThEcEQ7U0E5RFksY0FBYyJ9