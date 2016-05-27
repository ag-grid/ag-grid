// ag-grid-enterprise v4.2.6
import { Column } from "ag-grid/main";
import { AbstractColumnDropPanel } from "./abstractColumnDropPanel";
export declare class PivotColumnsPanel extends AbstractColumnDropPanel {
    private columnController;
    private eventService;
    private gridOptionsWrapper;
    private context;
    private loggerFactory;
    private dragAndDropService;
    constructor(horizontal: boolean);
    private passBeansUp();
    protected isColumnDroppable(column: Column): boolean;
    protected removeColumns(columns: Column[]): void;
    protected addColumns(columns: Column[]): void;
    protected getExistingColumns(): Column[];
}
