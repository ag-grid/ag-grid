import { ChartType } from "@ag-grid-community/core";
import { MiniChart } from '../miniChart';

export class MiniRangeBar extends MiniChart {

    static chartType: ChartType = 'rangeBar';

    constructor(container: HTMLElement) {
        super(container, 'rangeBarTooltip');
    }

    override updateColors(fills: string[], strokes: string[]): void {
    }
}

