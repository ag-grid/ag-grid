// ag-grid-enterprise v4.0.7
import { RenderedItem } from "./renderedItem";
import { Column } from "ag-grid/main";
export declare class RenderedColumn extends RenderedItem {
    private static TEMPLATE;
    private columnController;
    private dragAndDropService;
    private gridPanel;
    private column;
    private columnDept;
    private eColumnVisibleIcon;
    private eColumnHiddenIcon;
    private allowDragging;
    constructor(column: Column, columnDept: number, allowDragging: boolean);
    init(): void;
    private setupVisibleIcons();
    private addDragSource();
    private onColumnStateChangedListener();
    private setIconVisibility();
    onColumnVisibilityChanged(): void;
}
