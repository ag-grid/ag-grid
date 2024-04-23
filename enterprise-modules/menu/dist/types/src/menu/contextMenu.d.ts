import { BeanStub, Column, IContextMenuFactory, RowNode } from "@ag-grid-community/core";
export declare class ContextMenuFactory extends BeanStub implements IContextMenuFactory {
    private popupService;
    private ctrlsService;
    private columnModel;
    private menuUtils;
    private rangeService?;
    private activeMenu;
    hideActiveMenu(): void;
    private getMenuItems;
    onContextMenu(mouseEvent: MouseEvent | null, touchEvent: TouchEvent | null, rowNode: RowNode | null, column: Column | null, value: any, anchorToElement: HTMLElement): void;
    showMenu(node: RowNode | null, column: Column | null, value: any, mouseEvent: MouseEvent | Touch, anchorToElement: HTMLElement): boolean;
    private dispatchVisibleChangedEvent;
}
