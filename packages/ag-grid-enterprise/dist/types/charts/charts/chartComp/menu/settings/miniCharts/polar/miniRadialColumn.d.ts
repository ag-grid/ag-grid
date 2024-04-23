import { ChartType } from 'ag-grid-community';
import { MiniChartWithPolarAxes } from '../miniChartWithPolarAxes';
export declare class MiniRadialColumn extends MiniChartWithPolarAxes {
    static chartType: ChartType;
    private readonly series;
    private data;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
