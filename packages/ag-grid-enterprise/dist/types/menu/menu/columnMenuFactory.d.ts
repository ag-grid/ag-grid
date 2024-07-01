import type { AgColumn, BeanCollection, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import { AgMenuList } from 'ag-grid-enterprise';
export declare class ColumnMenuFactory extends BeanStub implements NamedBean {
    beanName: "columnMenuFactory";
    private menuItemMapper;
    private columnModel;
    private funcColsService;
    private rowModel;
    private menuService;
    wireBeans(beans: BeanCollection): void;
    createMenu(parent: BeanStub<any>, column: AgColumn | undefined, sourceElement: () => HTMLElement): AgMenuList;
    private getMenuItems;
    private getDefaultMenuOptions;
}
