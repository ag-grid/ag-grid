import { ChartType } from "@ag-grid-community/core";
import { MiniChart } from '../miniChart';

export class MiniBoxPlot extends MiniChart {

    static chartType: ChartType = 'boxPlot';

    constructor(container: HTMLElement) {
        super(container, 'boxPlotTooltip');
    }

    override updateColors(fills: string[], strokes: string[]): void {
    }
}

