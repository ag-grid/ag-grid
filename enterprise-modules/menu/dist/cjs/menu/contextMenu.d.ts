import { BeanStub, Column, GridPanel, IContextMenuFactory, RowNode } from "@ag-grid-community/core";
export declare class ContextMenuFactory extends BeanStub implements IContextMenuFactory {
    private popupService;
    private rangeController;
    private columnController;
    private activeMenu;
    private gridPanel;
    registerGridComp(gridPanel: GridPanel): void;
    hideActiveMenu(): void;
    private getMenuItems;
    showMenu(node: RowNode, column: Column, value: any, mouseEvent: MouseEvent | Touch, anchorToElement: HTMLElement): boolean;
}
