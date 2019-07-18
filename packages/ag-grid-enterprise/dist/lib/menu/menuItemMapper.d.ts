// ag-grid-enterprise v21.1.0
import { Column, MenuItemDef } from 'ag-grid-community';
export declare class MenuItemMapper {
    private gridOptionsWrapper;
    private columnController;
    private gridApi;
    private clipboardService;
    private aggFuncService;
    private rangeChartService;
    mapWithStockItems(originalList: (MenuItemDef | string)[], column: Column | null): (MenuItemDef | string)[];
    private getStockMenuItem;
    private createAggregationSubMenu;
}
