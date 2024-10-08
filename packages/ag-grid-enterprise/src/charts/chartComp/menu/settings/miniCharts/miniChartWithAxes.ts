import { ChartWrapper } from '../../../../chartWrapper';
import type { ChartTranslationKey } from '../../../services/chartTranslationService';
import { MiniChart } from './miniChart';

export abstract class MiniChartWithAxes extends MiniChart {
    private readonly stroke = 'gray';
    private readonly axisOvershoot = 3;

    constructor(container: HTMLElement, tooltipName: ChartTranslationKey) {
        super(container, tooltipName);
    }

    public override postConstruct() {
        const size = this.size;
        const padding = this.padding;

        const leftAxis = new ChartWrapper._Scene.Line();
        leftAxis.x1 = padding;
        leftAxis.y1 = padding;
        leftAxis.x2 = padding;
        leftAxis.y2 = size - padding + this.axisOvershoot;
        leftAxis.stroke = this.stroke;

        const bottomAxis = new ChartWrapper._Scene.Line();
        bottomAxis.x1 = padding - this.axisOvershoot + 1;
        bottomAxis.y1 = size - padding;
        bottomAxis.x2 = size - padding + 1;
        bottomAxis.y2 = size - padding;
        bottomAxis.stroke = this.stroke;

        const root = this.root;

        root.append(leftAxis);
        root.append(bottomAxis);
        super.postConstruct();
    }
}
