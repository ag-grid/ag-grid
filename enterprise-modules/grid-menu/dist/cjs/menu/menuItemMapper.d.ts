import { Column, MenuItemDef } from '@ag-grid-community/core';
export declare class MenuItemMapper {
    private gridOptionsWrapper;
    private columnController;
    private gridApi;
    private clipboardService;
    private aggFuncService;
    private chartService;
    private context;
    mapWithStockItems(originalList: (MenuItemDef | string)[], column: Column | null): (MenuItemDef | string)[];
    private getStockMenuItem;
    private getChartItems;
    private createAggregationSubMenu;
}
