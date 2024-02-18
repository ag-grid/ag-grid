import { _Scene, _Theme } from 'ag-charts-community';
import { accumulateData } from '../miniChartHelpers.mjs';
import { MiniChartWithAxes } from '../miniChartWithAxes.mjs';
export class MiniWaterfall extends MiniChartWithAxes {
    constructor(container, fills, strokes, themeTemplate, isCustomTheme) {
        super(container, 'waterfallTooltip');
        this.data = [4, 3, -3, 6, -3];
        this.bars = this.createWaterfall(this.root, this.data, this.size, this.padding, 'vertical').bars;
        this.updateColors(fills, strokes, themeTemplate, isCustomTheme);
    }
    updateColors(fills, strokes, themeTemplate, isCustomTheme) {
        var _a, _b;
        const { data } = this;
        const { properties } = themeTemplate !== null && themeTemplate !== void 0 ? themeTemplate : {};
        const palettePositive = {
            fill: fills[0],
            stroke: strokes[0],
        };
        const paletteNegative = {
            fill: fills[1],
            stroke: strokes[1],
        };
        const positive = isCustomTheme ? palettePositive : (_a = properties === null || properties === void 0 ? void 0 : properties.get(_Theme.DEFAULT_WATERFALL_SERIES_POSITIVE_COLOURS)) !== null && _a !== void 0 ? _a : palettePositive;
        const negative = isCustomTheme ? paletteNegative : (_b = properties === null || properties === void 0 ? void 0 : properties.get(_Theme.DEFAULT_WATERFALL_SERIES_NEGATIVE_COLOURS)) !== null && _b !== void 0 ? _b : paletteNegative;
        this.bars.forEach((bar, i) => {
            const isPositive = data[i] >= 0;
            bar.fill = isPositive ? positive.fill : negative.fill;
            bar.stroke = isPositive ? positive.stroke : negative.stroke;
        });
    }
    createWaterfall(root, data, size, padding, direction) {
        const scalePadding = 2 * padding;
        const { processedData, min, max } = accumulateData(data.map((d) => [d]));
        const flatData = processedData.reduce((flat, d) => flat.concat(d), []);
        const yScale = new _Scene.LinearScale();
        yScale.domain = [Math.min(min, 0), max];
        yScale.range = [size - scalePadding, scalePadding];
        const xScale = new _Scene.BandScale();
        xScale.domain = data.map((_, index) => index);
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.2;
        xScale.paddingOuter = 0.3;
        const width = xScale.bandwidth;
        const connectorLine = new _Scene.Path();
        connectorLine.stroke = '#575757';
        connectorLine.strokeWidth = 0;
        const pixelAlignmentOffset = (Math.floor(connectorLine.strokeWidth) % 2) / 2;
        const connectorPath = connectorLine.path;
        connectorPath.clear();
        const barAlongX = direction === 'horizontal';
        const bars = flatData.map((datum, i) => {
            const previousDatum = i > 0 ? flatData[i - 1] : 0;
            const rawValue = data[i];
            const isPositive = rawValue > 0;
            const currY = Math.round(yScale.convert(datum));
            const trailY = Math.round(yScale.convert(previousDatum));
            const y = (isPositive ? currY : trailY) - pixelAlignmentOffset;
            const bottomY = (isPositive ? trailY : currY) + pixelAlignmentOffset;
            const height = Math.abs(bottomY - y);
            const x = xScale.convert(i);
            const rect = new _Scene.Rect();
            rect.x = barAlongX ? y : x;
            rect.y = barAlongX ? x : y;
            rect.width = barAlongX ? height : width;
            rect.height = barAlongX ? width : height;
            rect.strokeWidth = 0;
            rect.crisp = true;
            const moveTo = currY + pixelAlignmentOffset;
            const lineTo = trailY + pixelAlignmentOffset;
            if (i > 0) {
                const lineToX = barAlongX ? lineTo : rect.x;
                const lineToY = barAlongX ? rect.y : lineTo;
                connectorPath.lineTo(lineToX, lineToY);
            }
            const moveToX = barAlongX ? moveTo : rect.x;
            const moveToY = barAlongX ? rect.y : moveTo;
            connectorPath.moveTo(moveToX, moveToY);
            return rect;
        });
        root.append([connectorLine, ...bars]);
        return { bars };
    }
}
MiniWaterfall.chartType = 'waterfall';
