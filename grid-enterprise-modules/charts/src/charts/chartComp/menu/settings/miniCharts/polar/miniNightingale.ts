import { MiniChartWithPolarAxes } from '../miniChartWithPolarAxes';
import { _Scene } from 'ag-charts-community';
import { ChartType } from '@ag-grid-community/core';
import { accumulateData } from '../miniChartHelpers';

export class MiniNightingale extends MiniChartWithPolarAxes {
    static chartType: ChartType = 'radar-line';
    private readonly series: _Scene.Group[];

    private data = [
        [6, 4, 5, 3, 10, 1, 12, 7],
        [2, 3, 4, 5, 2, 5, 4, 2],
    ];

    constructor(container: HTMLElement, fills: string[], strokes: string[], tooltipName = 'radarLineTooltip') {
        super(container, tooltipName);

        this.showRadiusAxisLine = false;

        const radius = (this.size - this.padding * 2) / 2;

        const angleScale = new _Scene.BandScale();
        angleScale.domain = [0, 1, 2, 3, 4];
        angleScale.range = [-Math.PI, Math.PI];
        angleScale.paddingInner = 0;
        angleScale.paddingOuter = 0;
        const bandwidth = angleScale.bandwidth * 0.7;
        
        const { processedData, max } = accumulateData(this.data);
        
        const radiusScale = new _Scene.LinearScale();
        radiusScale.domain = [0, max];
        radiusScale.range = [0, radius];

        const center = this.size / 2;
        this.series = processedData.map((series, index) => {
            const previousSeries = index < 0 ? undefined : processedData[index - 1];

            const seriesGroup = new _Scene.Group({ zIndex: 1000_000 });
            const seriesSectors = series.map((datum: number, i: number) => {
                const previousDatum = previousSeries?.[i];
                const outerRadius = radiusScale.convert(datum);
                const innerRadius = radiusScale.convert(previousDatum ?? 0);
                const startAngle = angleScale.convert(i);
                const endAngle = startAngle + bandwidth;

                const sector = new _Scene.Sector();
                sector.centerX = center;
                sector.centerY = center;
                sector.innerRadius = innerRadius;
                sector.outerRadius = outerRadius;
                sector.startAngle = startAngle;
                sector.endAngle = endAngle;
                sector.stroke = undefined;
                sector.strokeWidth = 1;
                return sector;
            });

            seriesGroup.append(seriesSectors);

            return seriesGroup;
        });

        this.root.append(this.series);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.series.forEach((group, i) => {
            group.children?.forEach((sector: _Scene.Sector) => {
                sector.fill = fills[i % fills.length];
                sector.stroke = strokes[i % strokes.length];
            });
        });
    }
}
