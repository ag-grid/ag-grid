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
import { Line, Path } from "ag-charts-community";
import { createColumnRects, createLinePaths } from "../miniChartHelpers";
import { MiniChart } from "../miniChart";
var MiniCustomCombo = /** @class */ (function (_super) {
    __extends(MiniCustomCombo, _super);
    function MiniCustomCombo(container, fills, strokes) {
        var _this = _super.call(this, container, "customComboTooltip") || this;
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
        var axisStroke = 'grey';
        var axisOvershoot = 3;
        var leftAxis = new Line();
        leftAxis.x1 = padding;
        leftAxis.y1 = padding;
        leftAxis.x2 = padding;
        leftAxis.y2 = size - padding + axisOvershoot;
        leftAxis.stroke = axisStroke;
        var bottomAxis = new Line();
        bottomAxis.x1 = padding - axisOvershoot + 1;
        bottomAxis.y1 = size - padding;
        bottomAxis.x2 = size - padding + 1;
        bottomAxis.y2 = size - padding;
        bottomAxis.stroke = axisStroke;
        var penIcon = new Path();
        penIcon.svgPath = 'M25.76,43.46l5.51,5.07M49.86,22a3.26,3.26,0,0,0-3-.59,6.78,6.78,0,0,0-3.35,2.14l-18,20.25-.08.09-2.42,8-.18.57,8.19-3.6,18-20.34a6.83,6.83,0,0,0,1.73-3.59A3.29,3.29,0,0,0,49.86,22Zm-8.1,3.5,5.58,5m-6.6-3.85,5.51,5.06';
        penIcon.fill = 'whitesmoke';
        penIcon.stroke = 'darkslategrey';
        penIcon.strokeWidth = 1;
        root.append([bottomAxis, leftAxis, penIcon]);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniCustomCombo.prototype.updateColors = function (fills, strokes) {
        this.columns.forEach(function (bar, i) {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
        this.lines.forEach(function (line, i) {
            line.stroke = fills[i + 2];
        });
    };
    MiniCustomCombo.chartType = 'customCombo';
    return MiniCustomCombo;
}(MiniChart));
export { MiniCustomCombo };
//# sourceMappingURL=miniCustomCombo.js.map