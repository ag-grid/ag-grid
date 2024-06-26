import type { ChartType } from 'ag-grid-community';
import { MiniChartWithPolarAxes } from '../miniChartWithPolarAxes';
export declare class MiniSunburst extends MiniChartWithPolarAxes {
    static chartType: ChartType;
    private readonly series;
    private data;
    private angleOffset;
    private innerRadiusRatio;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
