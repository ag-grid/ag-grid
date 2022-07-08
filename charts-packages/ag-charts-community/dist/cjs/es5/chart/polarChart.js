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
var chart_1 = require("./chart");
var polarSeries_1 = require("./series/polar/polarSeries");
var padding_1 = require("../util/padding");
var bbox_1 = require("../scene/bbox");
var PolarChart = /** @class */ (function (_super) {
    __extends(PolarChart, _super);
    function PolarChart(document) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this, document) || this;
        _this.padding = new padding_1.Padding(40);
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
        var shrinkRect = new bbox_1.BBox(0, 0, this.width, this.height);
        var _a = this.positionCaptions().captionAutoPadding, captionAutoPadding = _a === void 0 ? 0 : _a;
        this.positionLegend(captionAutoPadding);
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
        var radius = Math.max(0, Math.min(shrinkRect.width, shrinkRect.height) / 2); // radius shouldn't be negative
        this.series.forEach(function (series) {
            if (series instanceof polarSeries_1.PolarSeries) {
                series.centerX = centerX;
                series.centerY = centerY;
                series.radius = radius;
            }
        });
    };
    PolarChart.className = 'PolarChart';
    PolarChart.type = 'polar';
    return PolarChart;
}(chart_1.Chart));
exports.PolarChart = PolarChart;
