import type { AgColumn, BeanCollection, ColumnEventType, MenuItemDef, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class MenuItemMapper extends BeanStub implements NamedBean {
    beanName: "menuItemMapper";
    private columnModel;
    private columnNameService;
    private columnApplyStateService;
    private funcColsService;
    private focusService;
    private rowPositionUtils;
    private chartMenuItemMapper;
    private menuService;
    private sortController;
    private columnAutosizeService;
    private expansionService;
    private clipboardService?;
    private aggFuncService?;
    private csvCreator?;
    private excelCreator?;
    wireBeans(beans: BeanCollection): void;
    mapWithStockItems(originalList: (MenuItemDef | string)[], column: AgColumn | null, sourceElement: () => HTMLElement, source: ColumnEventType): (MenuItemDef | string)[];
    private getStockMenuItem;
    private createAggregationSubMenu;
}
