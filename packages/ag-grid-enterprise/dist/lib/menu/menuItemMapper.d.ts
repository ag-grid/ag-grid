// ag-grid-enterprise v20.2.0
import { MenuItemDef, Column } from 'ag-grid-community';
export declare class MenuItemMapper {
    private gridOptionsWrapper;
    private columnController;
    private gridApi;
    private clipboardService;
    private aggFuncService;
    private chartingService;
    mapWithStockItems(originalList: (MenuItemDef | string)[], column: Column | null): (MenuItemDef | string)[];
    private getStockMenuItem;
    private createAggregationSubMenu;
}
