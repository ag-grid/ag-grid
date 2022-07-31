"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chart_1 = require("./chart");
const polarSeries_1 = require("./series/polar/polarSeries");
const padding_1 = require("../util/padding");
const bbox_1 = require("../scene/bbox");
class PolarChart extends chart_1.Chart {
    constructor(document = window.document) {
        super(document);
        this.padding = new padding_1.Padding(40);
        this.scene.root.append(this.legend.group);
    }
    get seriesRoot() {
        return this.scene.root;
    }
    performLayout() {
        const shrinkRect = new bbox_1.BBox(0, 0, this.width, this.height);
        const { captionAutoPadding = 0 } = this.positionCaptions();
        this.positionLegend(captionAutoPadding);
        shrinkRect.y += captionAutoPadding;
        shrinkRect.height -= captionAutoPadding;
        if (this.legend.enabled && this.legend.data.length) {
            const legendAutoPadding = this.legendAutoPadding;
            shrinkRect.x += legendAutoPadding.left;
            shrinkRect.y += legendAutoPadding.top;
            shrinkRect.width -= legendAutoPadding.left + legendAutoPadding.right;
            shrinkRect.height -= legendAutoPadding.top + legendAutoPadding.bottom;
            const legendPadding = this.legend.spacing;
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
        const padding = this.padding;
        shrinkRect.x += padding.left;
        shrinkRect.y += padding.top;
        shrinkRect.width -= padding.left + padding.right;
        shrinkRect.height -= padding.top + padding.bottom;
        this.seriesRect = shrinkRect;
        const centerX = shrinkRect.x + shrinkRect.width / 2;
        const centerY = shrinkRect.y + shrinkRect.height / 2;
        const radius = Math.max(0, Math.min(shrinkRect.width, shrinkRect.height) / 2); // radius shouldn't be negative
        this.series.forEach((series) => {
            if (series instanceof polarSeries_1.PolarSeries) {
                series.centerX = centerX;
                series.centerY = centerY;
                series.radius = radius;
            }
        });
    }
}
exports.PolarChart = PolarChart;
PolarChart.className = 'PolarChart';
PolarChart.type = 'polar';
