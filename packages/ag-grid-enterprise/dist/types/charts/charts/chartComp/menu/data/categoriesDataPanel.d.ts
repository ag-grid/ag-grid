import { AutoScrollService } from "ag-grid-community";
import { ChartController } from "../../chartController";
import { ColState } from "../../model/chartDataModel";
import { DragDataPanel } from "./dragDataPanel";
export declare class CategoriesDataPanel extends DragDataPanel {
    private readonly title;
    private dimensionCols;
    private isOpen?;
    private static TEMPLATE;
    private readonly chartMenuService;
    private aggFuncToggle?;
    private aggFuncSelect?;
    constructor(chartController: ChartController, autoScrollService: AutoScrollService, title: string, allowMultipleSelection: boolean, dimensionCols: ColState[], isOpen?: boolean | undefined);
    private init;
    refresh(dimensionCols: ColState[]): void;
    private recreate;
    private createCategoriesGroup;
    private createLegacyCategoriesGroup;
    private createAggFuncControls;
    private refreshAggFuncControls;
    private clearAggFuncControls;
    protected destroy(): void;
}
