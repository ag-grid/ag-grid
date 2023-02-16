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
exports.MiniBar = void 0;
var ag_charts_community_1 = require("ag-charts-community");
var miniChartWithAxes_1 = require("../miniChartWithAxes");
var MiniBar = /** @class */ (function (_super) {
    __extends(MiniBar, _super);
    function MiniBar(container, fills, strokes) {
        var _this = _super.call(this, container, "groupedBarTooltip") || this;
        var padding = _this.padding;
        var size = _this.size;
        var data = [2, 3, 4];
        var yScale = new ag_charts_community_1._Scene.BandScale();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;
        var xScale = new ag_charts_community_1._Scene.LinearScale();
        xScale.domain = [0, 4];
        xScale.range = [size - padding, padding];
        var bottom = xScale.convert(0);
        var height = yScale.bandwidth;
        _this.bars = data.map(function (datum, i) {
            var rect = new ag_charts_community_1._Scene.Rect();
            rect.x = padding;
            rect.y = yScale.convert(i);
            rect.width = bottom - xScale.convert(datum);
            rect.height = height;
            rect.strokeWidth = 1;
            rect.crisp = true;
            return rect;
        });
        _this.updateColors(fills, strokes);
        _this.root.append(_this.bars);
        return _this;
    }
    MiniBar.prototype.updateColors = function (fills, strokes) {
        this.bars.forEach(function (bar, i) {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
    };
    MiniBar.chartType = 'groupedBar';
    return MiniBar;
}(miniChartWithAxes_1.MiniChartWithAxes));
exports.MiniBar = MiniBar;
