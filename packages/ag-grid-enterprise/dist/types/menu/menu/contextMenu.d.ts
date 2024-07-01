import type { AgColumn, BeanCollection, IContextMenuFactory, NamedBean, RowNode } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class ContextMenuFactory extends BeanStub implements NamedBean, IContextMenuFactory {
    beanName: "contextMenuFactory";
    private popupService;
    private ctrlsService;
    private columnModel;
    private menuUtils;
    private rangeService?;
    wireBeans(beans: BeanCollection): void;
    private activeMenu;
    hideActiveMenu(): void;
    private getMenuItems;
    onContextMenu(mouseEvent: MouseEvent | null, touchEvent: TouchEvent | null, rowNode: RowNode | null, column: AgColumn | null, value: any, anchorToElement: HTMLElement): void;
    showMenu(node: RowNode | null, column: AgColumn | null, value: any, mouseEvent: MouseEvent | Touch, anchorToElement: HTMLElement): boolean;
    private dispatchVisibleChangedEvent;
}
export type ContextMenuEvent = 'closeMenu';
