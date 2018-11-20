// ag-grid-enterprise v19.1.3
import { IContextMenuFactory, RowNode, Column } from "ag-grid-community";
export declare class ContextMenuFactory implements IContextMenuFactory {
    private context;
    private popupService;
    private gridOptionsWrapper;
    private rowModel;
    private activeMenu;
    private init;
    hideActiveMenu(): void;
    private getMenuItems;
    showMenu(node: RowNode, column: Column, value: any, mouseEvent: MouseEvent | Touch): void;
}
//# sourceMappingURL=contextMenu.d.ts.map