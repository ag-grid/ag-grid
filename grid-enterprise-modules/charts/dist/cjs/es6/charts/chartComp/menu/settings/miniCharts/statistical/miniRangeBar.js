"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniRangeBar = void 0;
const ag_charts_community_1 = require("ag-charts-community");
const miniChartWithAxes_1 = require("../miniChartWithAxes");
class MiniRangeBar extends miniChartWithAxes_1.MiniChartWithAxes {
    constructor(container, fills, strokes) {
        super(container, 'rangeBarTooltip');
        const data = [3, 3.5, 3];
        this.bars = this.createRangeBar(this.root, data, this.size, this.padding, 'vertical');
        this.updateColors(fills, strokes);
    }
    updateColors(fills, strokes) {
        this.bars.forEach((bar, i) => {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
    }
    createRangeBar(root, data, size, padding, direction) {
        const barAlongX = direction === 'horizontal';
        const scalePadding = 2 * padding;
        const xScale = new ag_charts_community_1._Scene.BandScale();
        xScale.domain = data.map((_, index) => index);
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.3;
        xScale.paddingOuter = 0.3;
        const lowRatio = 0.7;
        const highRatio = 1.3;
        const yScale = new ag_charts_community_1._Scene.LinearScale();
        yScale.domain = [
            data.reduce((a, b) => Math.min(a, b), Infinity) * lowRatio,
            data.reduce((a, b) => Math.max(a, b), 0) * highRatio,
        ];
        yScale.range = [scalePadding, size - scalePadding];
        const width = xScale.bandwidth;
        const bars = data.map((datum, i) => {
            const [low, high] = [datum * lowRatio, datum * highRatio];
            const x = xScale.convert(i);
            const y = yScale.convert(low);
            const height = yScale.convert(high) - y;
            const rect = new ag_charts_community_1._Scene.Rect();
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
    }
}
exports.MiniRangeBar = MiniRangeBar;
MiniRangeBar.chartType = 'rangeBar';
