import { ChartType } from "@ag-grid-community/core";
import { MiniChart } from '../miniChart';

export class MiniRadarLine extends MiniChart {

    static chartType: ChartType = 'radarLine';

    constructor(container: HTMLElement) {
        super(container, 'radarLineTooltip');
    }

    override updateColors(fills: string[], strokes: string[]): void {
    }
}
