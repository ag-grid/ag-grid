import type { ChartType } from 'ag-grid-community';
import { MiniChartWithAxes } from '../miniChartWithAxes';
export declare class MiniColumn extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly columns;
    private columnData;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
