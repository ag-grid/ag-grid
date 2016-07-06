// ag-grid-enterprise v5.0.0-alpha.6
import { Component, Column } from "ag-grid/main";
export declare class RenderedColumn extends Component {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private columnController;
    private eventService;
    private dragAndDropService;
    private gridPanel;
    private context;
    private eText;
    private eIndent;
    private cbSelect;
    private eIcon;
    private column;
    private columnDept;
    private allowDragging;
    private displayName;
    private processingColumnStateChange;
    constructor(column: Column, columnDept: number, allowDragging: boolean);
    init(): void;
    private loadIcon();
    private onClick();
    private onChange();
    private actionUnChecked();
    private actionChecked();
    private addDragSource();
    private onColumnStateChanged();
}
