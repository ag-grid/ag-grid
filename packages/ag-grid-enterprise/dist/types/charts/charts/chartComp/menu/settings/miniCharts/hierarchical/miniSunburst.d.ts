import { MiniChartWithPolarAxes } from '../miniChartWithPolarAxes';
import { ChartType } from 'ag-grid-community';
export declare class MiniSunburst extends MiniChartWithPolarAxes {
    static chartType: ChartType;
    private readonly series;
    private data;
    private angleOffset;
    private innerRadiusRatio;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
