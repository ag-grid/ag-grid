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
import { createColumnRects, createLinePaths } from "../miniChartHelpers";
var MiniColumnLineCombo = /** @class */ (function (_super) {
    __extends(MiniColumnLineCombo, _super);
    function MiniColumnLineCombo(container, fills, strokes) {
        var _this = _super.call(this, container, "columnLineComboTooltip") || this;
        _this.columnData = [3, 4];
        _this.lineData = [
            [5, 4, 6, 5, 4]
        ];
        var _a = _this, root = _a.root, columnData = _a.columnData, lineData = _a.lineData, size = _a.size, padding = _a.padding;
        _this.columns = createColumnRects({
            stacked: false,
            root: root,
            data: columnData,
            size: size,
            padding: padding,
            xScaleDomain: [0, 1],
            yScaleDomain: [0, 4],
            xScalePadding: 0.5
        });
        root.append(_this.columns);
        _this.lines = createLinePaths(root, lineData, size, padding);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniColumnLineCombo.prototype.updateColors = function (fills, strokes) {
        this.columns.forEach(function (bar, i) {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
        this.lines.forEach(function (line, i) {
            line.stroke = fills[i + 2];
        });
    };
    MiniColumnLineCombo.chartType = 'columnLineCombo';
    return MiniColumnLineCombo;
}(MiniChartWithAxes));
export { MiniColumnLineCombo };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaUNvbHVtbkxpbmVDb21iby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL21lbnUvc2V0dGluZ3MvbWluaUNoYXJ0cy9jb21iby9taW5pQ29sdW1uTGluZUNvbWJvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBR3pELE9BQU8sRUFBRSxpQkFBaUIsRUFBMkIsZUFBZSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFbEc7SUFBeUMsdUNBQWlCO0lBYXRELDZCQUFZLFNBQXNCLEVBQUUsS0FBZSxFQUFFLE9BQWlCO1FBQXRFLFlBQ0ksa0JBQU0sU0FBUyxFQUFFLHdCQUF3QixDQUFDLFNBb0I3QztRQTNCTyxnQkFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXBCLGNBQVEsR0FBRztZQUNmLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNsQixDQUFDO1FBS1EsSUFBQSxLQUFnRCxLQUFJLEVBQWxELElBQUksVUFBQSxFQUFFLFVBQVUsZ0JBQUEsRUFBRSxRQUFRLGNBQUEsRUFBRSxJQUFJLFVBQUEsRUFBRSxPQUFPLGFBQVMsQ0FBQztRQUUzRCxLQUFJLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDO1lBQzdCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsSUFBSSxNQUFBO1lBQ0osSUFBSSxFQUFFLFVBQVU7WUFDaEIsSUFBSSxNQUFBO1lBQ0osT0FBTyxTQUFBO1lBQ1AsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNwQixZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BCLGFBQWEsRUFBRSxHQUFHO1NBQ00sQ0FBQyxDQUFDO1FBRTlCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTFCLEtBQUksQ0FBQyxLQUFLLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRTVELEtBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDOztJQUN0QyxDQUFDO0lBRUQsMENBQVksR0FBWixVQUFhLEtBQWUsRUFBRSxPQUFpQjtRQUMzQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQWdCLEVBQUUsQ0FBUztZQUM3QyxHQUFHLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixHQUFHLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBaUIsRUFBRSxDQUFTO1lBQzVDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUEzQ00sNkJBQVMsR0FBYyxpQkFBaUIsQ0FBQztJQTRDcEQsMEJBQUM7Q0FBQSxBQTlDRCxDQUF5QyxpQkFBaUIsR0E4Q3pEO1NBOUNZLG1CQUFtQiJ9