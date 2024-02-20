import { AgMenuList, BeanStub, Column } from "@ag-grid-community/core";
export declare class ColumnMenuFactory extends BeanStub {
    private readonly menuItemMapper;
    private readonly columnModel;
    private readonly rowModel;
    private readonly filterManager;
    private readonly menuService;
    private static MENU_ITEM_SEPARATOR;
    createMenu(parent: BeanStub, column: Column | undefined, sourceElement: () => HTMLElement): AgMenuList;
    private getMenuItems;
    private getDefaultMenuOptions;
}
