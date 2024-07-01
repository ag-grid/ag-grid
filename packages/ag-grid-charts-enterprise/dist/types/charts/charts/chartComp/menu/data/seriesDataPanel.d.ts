import type { ChartController } from '../../chartController';
import type { ColState } from '../../model/chartDataModel';
import type { ChartOptionsService } from '../../services/chartOptionsService';
import { DragDataPanel } from './dragDataPanel';
export declare class SeriesDataPanel extends DragDataPanel {
    private readonly chartOptionsService;
    private readonly title;
    private valueCols;
    private isOpen?;
    constructor(chartController: ChartController, chartOptionsService: ChartOptionsService, title: string, allowMultipleSelect: boolean, maxSelection: number | undefined, valueCols: ColState[], isOpen?: boolean | undefined);
    postConstruct(): void;
    refresh(valueCols: ColState[]): void;
    private generateGetSeriesLabel;
    destroy(): void;
}
