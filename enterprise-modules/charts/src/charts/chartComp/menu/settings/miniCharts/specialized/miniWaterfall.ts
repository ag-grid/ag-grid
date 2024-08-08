import type { ChartType } from '@ag-grid-community/core';
import { _Scene, _Theme } from 'ag-charts-community';

import type { ThemeTemplateParameters } from '../../miniChartsContainer';
import { accumulateData } from '../miniChartHelpers';
import { MiniChartWithAxes } from '../miniChartWithAxes';

export class MiniWaterfall extends MiniChartWithAxes {
    static chartType: ChartType = 'waterfall';

    private readonly bars: _Scene.Rect[];

    private data = [4, 3, -3, 6, -3];

    constructor(
        container: HTMLElement,
        fills: string[],
        strokes: string[],
        themeTemplate: ThemeTemplateParameters,
        isCustomTheme: boolean
    ) {
        super(container, 'waterfallTooltip');

        this.bars = this.createWaterfall(this.root, this.data, this.size, this.padding, 'vertical').bars;
        this.updateColors(fills, strokes, themeTemplate, isCustomTheme);
    }

    updateColors(fills: string[], strokes: string[], themeTemplate?: ThemeTemplateParameters, isCustomTheme?: boolean) {
        const { data } = this;
        const positive = {
            fill: isCustomTheme ? fills[0] : themeTemplate?.get(_Theme.PALETTE_ALT_UP_FILL),
            stroke: isCustomTheme ? strokes[0] : themeTemplate?.get(_Theme.PALETTE_ALT_UP_STROKE),
        };
        const negative = {
            fill: isCustomTheme ? fills[1] : themeTemplate?.get(_Theme.PALETTE_ALT_DOWN_FILL),
            stroke: isCustomTheme ? strokes[1] : themeTemplate?.get(_Theme.PALETTE_ALT_DOWN_STROKE),
        };
        this.bars.forEach((bar, i) => {
            const isPositive = data[i] >= 0;
            bar.fill = isPositive ? positive.fill : negative.fill;
            bar.stroke = isPositive ? positive.stroke : negative.stroke;
        });
    }

    createWaterfall(
        root: _Scene.Group,
        data: number[],
        size: number,
        padding: number,
        direction: 'horizontal' | 'vertical'
    ): { bars: _Scene.Rect[] } {
        const scalePadding = 2 * padding;

        const { processedData, min, max } = accumulateData(data.map((d) => [d]));
        const flatData = processedData.reduce((flat, d) => flat.concat(d), []);

        const yScale = new _Scene.LinearScale();
        yScale.domain = [Math.min(min, 0), max];
        yScale.range = [size - scalePadding, scalePadding];

        const xScale = new _Scene.BandScale<number>();
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
