import { ChartType } from "@ag-grid-community/core";
import { MiniChart } from '../miniChart';

export class MiniWaterfall extends MiniChart {

    static chartType: ChartType = 'waterfall';

    constructor(container: HTMLElement) {
        super(container, 'waterfallTooltip');
    }

    override updateColors(fills: string[], strokes: string[]): void {
    }
}

