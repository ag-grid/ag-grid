import { ChartType } from "@ag-grid-community/core";
import { MiniChart } from '../miniChart';

export class MiniRadarArea extends MiniChart {

    static chartType: ChartType = 'radarArea';

    constructor(container: HTMLElement) {
        super(container, 'radarAreaTooltip');
    }

    override updateColors(fills: string[], strokes: string[]): void {
    }
}
