import { ChartType } from 'ag-grid-community';
import { _Scene } from 'ag-charts-community';
import { MiniChartWithAxes } from '../miniChartWithAxes';
export declare class MiniRangeArea extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly lines;
    private readonly areas;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
    createRangeArea(root: _Scene.Group, data: Array<Array<{
        x: number;
        low: number;
        high: number;
    }>>, size: number, padding: number): {
        lines: _Scene.Path[][];
        areas: _Scene.Path[];
    };
}
