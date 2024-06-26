import type { ChartType } from 'ag-grid-community';
import { MiniChartWithAxes } from '../miniChartWithAxes';
export declare class MiniScatter extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly points;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
