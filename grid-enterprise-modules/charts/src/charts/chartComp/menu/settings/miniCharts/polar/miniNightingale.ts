import { ChartType } from "@ag-grid-community/core";
import { MiniChart } from '../miniChart';

export class MiniNightingale extends MiniChart {

    static chartType: ChartType = 'nightingale';

    constructor(container: HTMLElement) {
        super(container, 'nightingaleTooltip');
    }

    override updateColors(fills: string[], strokes: string[]): void {
    }
}
