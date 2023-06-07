import { _Scene } from "ag-charts-community";
import { ChartType } from 'ag-grid-community';
import { MiniChart } from '../miniChart';
export declare class MiniCustomCombo extends MiniChart {
    static chartType: ChartType;
    private columns;
    private lines;
    private columnData;
    private lineData;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
    buildPenIconPath(penIcon: _Scene.Path): void;
}
