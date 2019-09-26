// ag-grid-enterprise v21.2.2
import { Column } from "ag-grid-community/main";
import { BaseDropZonePanel } from "../dropZone/baseDropZonePanel";
export declare class RowGroupDropZonePanel extends BaseDropZonePanel {
    private columnController;
    private eventService;
    private gridOptionsWrapper;
    private loggerFactory;
    private dragAndDropService;
    private columnApi;
    private gridApi;
    constructor(horizontal: boolean);
    private passBeansUp;
    protected isColumnDroppable(column: Column): boolean;
    protected updateColumns(columns: Column[]): void;
    protected getIconName(): string;
    protected getExistingColumns(): Column[];
}
