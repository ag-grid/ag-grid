import { MiniChart } from "../miniChart";
import { ChartType } from "@ag-grid-community/core";
export declare class MiniDoughnut extends MiniChart {
    static chartType: ChartType;
    private readonly sectors;
    constructor(container: HTMLElement, fills: string[], strokes: string[], centerRadiusScaler?: number, tooltipName?: string);
    updateColors(fills: string[], strokes: string[]): void;
}
