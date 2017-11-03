// ag-grid-enterprise v14.0.1
import { IContextMenuFactory, RowNode, Column } from "ag-grid";
export declare class ContextMenuFactory implements IContextMenuFactory {
    private context;
    private popupService;
    private gridOptionsWrapper;
    private rowModel;
    private init();
    private getMenuItems(node, column, value);
    showMenu(node: RowNode, column: Column, value: any, mouseEvent: MouseEvent): void;
}
