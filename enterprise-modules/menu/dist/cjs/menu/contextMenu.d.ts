import { BeanStub, Column, IContextMenuFactory, RowNode } from "@ag-grid-community/core";
export declare class ContextMenuFactory extends BeanStub implements IContextMenuFactory {
    private popupService;
    private gridOptionsWrapper;
    private rangeController;
    private columnController;
    private activeMenu;
    hideActiveMenu(): void;
    private getMenuItems;
    showMenu(node: RowNode, column: Column, value: any, mouseEvent: MouseEvent | Touch): boolean;
}
