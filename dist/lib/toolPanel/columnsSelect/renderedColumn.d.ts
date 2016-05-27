// ag-grid-enterprise v4.2.5
import { Component, Column } from "ag-grid/main";
export declare class RenderedColumn extends Component {
    private static TEMPLATE;
    private columnController;
    private dragAndDropService;
    private gridPanel;
    private column;
    private columnDept;
    private eColumnVisibleIcon;
    private eColumnHiddenIcon;
    private allowDragging;
    private displayName;
    constructor(column: Column, columnDept: number, allowDragging: boolean);
    init(): void;
    private setupVisibleIcons();
    private addDragSource();
    private onColumnStateChangedListener();
    private setIconVisibility();
    onColumnVisibilityChanged(): void;
}
