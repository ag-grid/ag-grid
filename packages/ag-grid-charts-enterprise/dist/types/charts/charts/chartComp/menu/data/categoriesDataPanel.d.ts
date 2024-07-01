import type { ChartController } from '../../chartController';
import type { ColState } from '../../model/chartDataModel';
import { DragDataPanel } from './dragDataPanel';
export declare class CategoriesDataPanel extends DragDataPanel {
    private readonly title;
    private dimensionCols;
    private isOpen?;
    private aggFuncToggle?;
    private aggFuncSelect?;
    constructor(chartController: ChartController, title: string, allowMultipleSelection: boolean, dimensionCols: ColState[], isOpen?: boolean | undefined);
    postConstruct(): void;
    refresh(dimensionCols: ColState[]): void;
    private createAggFuncControls;
    private refreshAggFuncControls;
    private clearAggFuncControls;
    destroy(): void;
}
