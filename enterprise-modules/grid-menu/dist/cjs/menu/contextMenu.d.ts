import { Column, IContextMenuFactory, RowNode } from "@ag-grid-community/core";
export declare class ContextMenuFactory implements IContextMenuFactory {
    private context;
    private popupService;
    private gridOptionsWrapper;
    private rowModel;
    private rangeController;
    private columnController;
    private activeMenu;
    private init;
    hideActiveMenu(): void;
    private getMenuItems;
    showMenu(node: RowNode, column: Column, value: any, mouseEvent: MouseEvent | Touch): void;
}
