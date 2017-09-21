// ag-grid-enterprise v13.2.0
import { Column, Component } from "ag-grid/main";
export declare class RenderedColumn extends Component {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private columnController;
    private eventService;
    private dragAndDropService;
    private gridPanel;
    private context;
    private columnApi;
    private gridApi;
    private eText;
    private eIndent;
    private cbSelect;
    private column;
    private columnDept;
    private allowDragging;
    private displayName;
    private processingColumnStateChange;
    constructor(column: Column, columnDept: number, allowDragging: boolean);
    init(): void;
    private addTap();
    private onClick();
    private onChange(event);
    private actionUnCheckedPivotMode();
    private actionCheckedPivotMode();
    private addDragSource();
    private createDragItem();
    private onColumnStateChanged();
}
