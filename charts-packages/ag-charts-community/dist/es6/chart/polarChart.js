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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Chart } from "./chart";
import { PolarSeries } from "./series/polar/polarSeries";
import { reactive } from "../util/observable";
import { Padding } from "../util/padding";
import { BBox } from "../scene/bbox";
var PolarChart = /** @class */ (function (_super) {
    __extends(PolarChart, _super);
    function PolarChart(document) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this, document) || this;
        _this.padding = new Padding(40);
        _this.scene.root.append(_this.legend.group);
        return _this;
    }
    Object.defineProperty(PolarChart.prototype, "seriesRoot", {
        get: function () {
            return this.scene.root;
        },
        enumerable: true,
        configurable: true
    });
    PolarChart.prototype.performLayout = function () {
        var shrinkRect = new BBox(0, 0, this.width, this.height);
        this.positionCaptions();
        this.positionLegend();
        var captionAutoPadding = this.captionAutoPadding;
        shrinkRect.y += captionAutoPadding;
        shrinkRect.height -= captionAutoPadding;
        if (this.legend.enabled && this.legend.data.length) {
            var legendAutoPadding = this.legendAutoPadding;
            shrinkRect.x += legendAutoPadding.left;
            shrinkRect.y += legendAutoPadding.top;
            shrinkRect.width -= legendAutoPadding.left + legendAutoPadding.right;
            shrinkRect.height -= legendAutoPadding.top + legendAutoPadding.bottom;
            var legendPadding = this.legend.spacing;
            switch (this.legend.position) {
                case 'right':
                    shrinkRect.width -= legendPadding;
                    break;
                case 'bottom':
                    shrinkRect.height -= legendPadding;
                    break;
                case 'left':
                    shrinkRect.x += legendPadding;
                    shrinkRect.width -= legendPadding;
                    break;
                case 'top':
                    shrinkRect.y += legendPadding;
                    shrinkRect.height -= legendPadding;
                    break;
            }
        }
        var padding = this.padding;
        shrinkRect.x += padding.left;
        shrinkRect.y += padding.top;
        shrinkRect.width -= padding.left + padding.right;
        shrinkRect.height -= padding.top + padding.bottom;
        this.seriesRect = shrinkRect;
        var centerX = shrinkRect.x + shrinkRect.width / 2;
        var centerY = shrinkRect.y + shrinkRect.height / 2;
        var radius = Math.min(shrinkRect.width, shrinkRect.height) / 2;
        this.series.forEach(function (series) {
            if (series instanceof PolarSeries) {
                series.centerX = centerX;
                series.centerY = centerY;
                series.radius = radius;
                series.update();
            }
        });
    };
    PolarChart.className = 'PolarChart';
    PolarChart.type = 'polar';
    __decorate([
        reactive('layoutChange')
    ], PolarChart.prototype, "padding", void 0);
    return PolarChart;
}(Chart));
export { PolarChart };
