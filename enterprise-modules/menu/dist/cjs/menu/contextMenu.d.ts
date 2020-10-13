import { BeanStub, Column, IContextMenuFactory, RowNode, GridPanel } from "@ag-grid-community/core";
export declare class ContextMenuFactory extends BeanStub implements IContextMenuFactory {
    private popupService;
    private gridOptionsWrapper;
    private rangeController;
    private columnController;
    private activeMenu;
    private gridPanel;
    registerGridComp(gridPanel: GridPanel): void;
    hideActiveMenu(): void;
    private getMenuItems;
    showMenu(node: RowNode, column: Column, value: any, mouseEvent: MouseEvent | Touch): boolean;
}
