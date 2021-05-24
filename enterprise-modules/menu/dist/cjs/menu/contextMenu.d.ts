import { BeanStub, Column, GridBodyComp, IContextMenuFactory, RowNode } from "@ag-grid-community/core";
export declare class ContextMenuFactory extends BeanStub implements IContextMenuFactory {
    private popupService;
    private rangeController;
    private columnController;
    private activeMenu;
    private gridBodyComp;
    registerGridComp(gridBodyComp: GridBodyComp): void;
    hideActiveMenu(): void;
    private getMenuItems;
    onContextMenu(mouseEvent: MouseEvent | null, touchEvent: TouchEvent | null, rowNode: RowNode | null, column: Column | null, value: any, anchorToElement: HTMLElement): void;
    private preventDefaultOnContextMenu;
    showMenu(node: RowNode, column: Column, value: any, mouseEvent: MouseEvent | Touch, anchorToElement: HTMLElement): boolean;
}
