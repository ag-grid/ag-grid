import type { ChartType } from 'ag-grid-community';
import { MiniChartWithPolarAxes } from '../miniChartWithPolarAxes';
export declare class MiniRadarLine extends MiniChartWithPolarAxes {
    static chartType: ChartType;
    private readonly lines;
    private readonly markers;
    private readonly markerSize;
    private data;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
