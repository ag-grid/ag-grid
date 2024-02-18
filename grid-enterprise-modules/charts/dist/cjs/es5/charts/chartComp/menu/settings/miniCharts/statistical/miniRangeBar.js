"use strict";
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniRangeBar = void 0;
var ag_charts_community_1 = require("ag-charts-community");
var miniChartWithAxes_1 = require("../miniChartWithAxes");
var MiniRangeBar = /** @class */ (function (_super) {
    __extends(MiniRangeBar, _super);
    function MiniRangeBar(container, fills, strokes) {
        var _this = _super.call(this, container, 'rangeBarTooltip') || this;
        var data = [3, 3.5, 3];
        _this.bars = _this.createRangeBar(_this.root, data, _this.size, _this.padding, 'vertical');
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniRangeBar.prototype.updateColors = function (fills, strokes) {
        this.bars.forEach(function (bar, i) {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
    };
    MiniRangeBar.prototype.createRangeBar = function (root, data, size, padding, direction) {
        var barAlongX = direction === 'horizontal';
        var scalePadding = 2 * padding;
        var xScale = new ag_charts_community_1._Scene.BandScale();
        xScale.domain = data.map(function (_, index) { return index; });
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.3;
        xScale.paddingOuter = 0.3;
        var lowRatio = 0.7;
        var highRatio = 1.3;
        var yScale = new ag_charts_community_1._Scene.LinearScale();
        yScale.domain = [
            data.reduce(function (a, b) { return Math.min(a, b); }, Infinity) * lowRatio,
            data.reduce(function (a, b) { return Math.max(a, b); }, 0) * highRatio,
        ];
        yScale.range = [scalePadding, size - scalePadding];
        var width = xScale.bandwidth;
        var bars = data.map(function (datum, i) {
            var _a = __read([datum * lowRatio, datum * highRatio], 2), low = _a[0], high = _a[1];
            var x = xScale.convert(i);
            var y = yScale.convert(low);
            var height = yScale.convert(high) - y;
            var rect = new ag_charts_community_1._Scene.Rect();
            rect.x = barAlongX ? y : x;
            rect.y = barAlongX ? x : y;
            rect.width = barAlongX ? height : width;
            rect.height = barAlongX ? width : height;
            rect.strokeWidth = 0;
            rect.crisp = true;
            return rect;
        });
        root.append(bars);
        return bars;
    };
    MiniRangeBar.chartType = 'rangeBar';
    return MiniRangeBar;
}(miniChartWithAxes_1.MiniChartWithAxes));
exports.MiniRangeBar = MiniRangeBar;
