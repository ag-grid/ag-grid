"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var miniChartWithAxes_1 = require("./miniChartWithAxes");
var rect_1 = require("../../../../../charts/scene/shape/rect");
var linearScale_1 = require("../../../../../charts/scale/linearScale");
var bandScale_1 = require("../../../../../charts/scale/bandScale");
var MiniStackedBar = /** @class */ (function (_super) {
    __extends(MiniStackedBar, _super);
    function MiniStackedBar(parent, fills, strokes, data, xScaleDomain, tooltipName) {
        if (data === void 0) { data = MiniStackedBar.data; }
        if (xScaleDomain === void 0) { xScaleDomain = [0, 16]; }
        if (tooltipName === void 0) { tooltipName = "stackedBarTooltip"; }
        var _this = _super.call(this, parent, tooltipName) || this;
        var size = _this.size;
        var padding = _this.padding;
        var yScale = new bandScale_1.BandScale();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;
        var xScale = linearScale_1.default();
        xScale.domain = xScaleDomain;
        xScale.range = [size - padding, padding];
        var bottom = xScale.convert(0);
        var height = yScale.bandwidth;
        _this.bars = data.map(function (series) {
            return series.map(function (datum, i) {
                var rect = new rect_1.Rect();
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
    MiniStackedBar.chartType = core_1.ChartType.StackedBar;
    MiniStackedBar.data = [
        [8, 12, 16],
        [6, 9, 12],
        [2, 3, 4]
    ];
    return MiniStackedBar;
}(miniChartWithAxes_1.MiniChartWithAxes));
exports.MiniStackedBar = MiniStackedBar;
//# sourceMappingURL=miniStackedBar.js.map