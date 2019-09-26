// ag-grid-enterprise v21.2.2
import { Column, MenuItemDef } from 'ag-grid-community';
export declare class MenuItemMapper {
    private gridOptionsWrapper;
    private columnController;
    private gridApi;
    private clipboardService;
    private aggFuncService;
    private chartService;
    mapWithStockItems(originalList: (MenuItemDef | string)[], column: Column | null): (MenuItemDef | string)[];
    private getStockMenuItem;
    private getChartItems;
    private createAggregationSubMenu;
}
