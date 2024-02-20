import { MiniChartWithPolarAxes } from '../miniChartWithPolarAxes';
import { ChartType } from 'ag-grid-community';
export declare class MiniNightingale extends MiniChartWithPolarAxes {
    static chartType: ChartType;
    private readonly series;
    private data;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
