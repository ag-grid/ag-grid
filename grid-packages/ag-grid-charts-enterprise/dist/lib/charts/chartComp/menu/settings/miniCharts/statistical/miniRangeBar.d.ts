import { ChartType } from 'ag-grid-community';
import { _Scene } from 'ag-charts-community';
import { MiniChartWithAxes } from '../miniChartWithAxes';
export declare class MiniRangeBar extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly bars;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
    createRangeBar(root: _Scene.Group, data: number[], size: number, padding: number, direction: 'horizontal' | 'vertical'): _Scene.Rect[];
}
