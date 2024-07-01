import type { ChartType } from 'ag-grid-community';
import { MiniChartWithAxes } from '../miniChartWithAxes';
export declare class MiniBar extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly bars;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
