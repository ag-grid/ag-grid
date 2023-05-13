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
import { _Scene } from "ag-charts-community";
import { createColumnRects, createLinePaths } from '../miniChartHelpers';
import { MiniChart } from '../miniChart';
var MiniCustomCombo = /** @class */ (function (_super) {
    __extends(MiniCustomCombo, _super);
    function MiniCustomCombo(container, fills, strokes) {
        var _this = _super.call(this, container, 'customComboTooltip') || this;
        _this.columnData = [3, 4];
        _this.lineData = [[5, 4, 6, 5, 4]];
        var _a = _this, root = _a.root, columnData = _a.columnData, lineData = _a.lineData, size = _a.size, padding = _a.padding;
        _this.columns = createColumnRects({
            stacked: false,
            root: root,
            data: columnData,
            size: size,
            padding: padding,
            xScaleDomain: [0, 1],
            yScaleDomain: [0, 4],
            xScalePadding: 0.5,
        });
        root.append(_this.columns);
        _this.lines = createLinePaths(root, lineData, size, padding);
        var axisStroke = 'grey';
        var axisOvershoot = 3;
        var leftAxis = new _Scene.Line();
        leftAxis.x1 = padding;
        leftAxis.y1 = padding;
        leftAxis.x2 = padding;
        leftAxis.y2 = size - padding + axisOvershoot;
        leftAxis.stroke = axisStroke;
        var bottomAxis = new _Scene.Line();
        bottomAxis.x1 = padding - axisOvershoot + 1;
        bottomAxis.y1 = size - padding;
        bottomAxis.x2 = size - padding + 1;
        bottomAxis.y2 = size - padding;
        bottomAxis.stroke = axisStroke;
        var penIcon = new _Scene.Path();
        _this.buildPenIconPath(penIcon);
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
    MiniCustomCombo.prototype.buildPenIconPath = function (penIcon) {
        var path = penIcon.path;
        path.moveTo(25.76, 43.46);
        path.lineTo(31.27, 48.53);
        path.moveTo(49.86, 22);
        path.lineTo(49.86, 22);
        path.cubicCurveTo(49.01994659053345, 21.317514933510974, 47.89593834348529, 21.09645997825817, 46.86, 21.41);
        path.lineTo(46.86, 21.41);
        path.cubicCurveTo(45.55460035985361, 21.77260167850787, 44.38777081121966, 22.517979360321792, 43.51, 23.55);
        path.lineTo(25.51, 43.8);
        path.lineTo(25.43, 43.89);
        path.lineTo(23.01, 51.89);
        path.lineTo(22.83, 52.46);
        path.lineTo(31.02, 48.86);
        path.lineTo(49.02, 28.52);
        path.lineTo(49.02, 28.52);
        path.cubicCurveTo(49.940716461596224, 27.521914221246085, 50.54302631059587, 26.2720342455763, 50.75, 24.93);
        path.lineTo(50.75, 24.93);
        path.cubicCurveTo(50.95363374988308, 23.866379846512814, 50.62080640232334, 22.77066734274871, 49.86, 22.0);
        path.closePath();
        path.moveTo(41.76, 25.5);
        path.lineTo(47.34, 30.5);
        path.moveTo(40.74, 26.65);
        path.lineTo(46.25, 31.71);
    };
    MiniCustomCombo.chartType = 'customCombo';
    return MiniCustomCombo;
}(MiniChart));
export { MiniCustomCombo };
