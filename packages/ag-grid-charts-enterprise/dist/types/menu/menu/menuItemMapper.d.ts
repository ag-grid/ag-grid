import { BeanStub, Column, MenuItemDef } from 'ag-grid-community';
export declare class MenuItemMapper extends BeanStub {
    private readonly columnModel;
    private readonly gridApi;
    private readonly clipboardService;
    private readonly aggFuncService;
    private readonly focusService;
    private readonly rowPositionUtils;
    private readonly chartMenuItemMapper;
    private readonly menuService;
    private readonly sortController;
    mapWithStockItems(originalList: (MenuItemDef | string)[], column: Column | null, sourceElement: () => HTMLElement): (MenuItemDef | string)[];
    private getStockMenuItem;
    private createAggregationSubMenu;
}
