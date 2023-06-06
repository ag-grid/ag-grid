import { BeanStub, Column, MenuItemDef } from '@ag-grid-community/core';
export declare class MenuItemMapper extends BeanStub {
    private readonly columnModel;
    private readonly gridApi;
    private readonly clipboardService;
    private readonly aggFuncService;
    private readonly focusService;
    private readonly rowPositionUtils;
    private readonly chartMenuItemMapper;
    mapWithStockItems(originalList: (MenuItemDef | string)[], column: Column | null): (MenuItemDef | string)[];
    private getStockMenuItem;
    private createAggregationSubMenu;
}
