// ag-grid-enterprise v4.1.4
import { IRowNodeStage, RowNode } from "ag-grid/main";
export declare class GroupStage implements IRowNodeStage {
    private selectionController;
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    private eventService;
    private context;
    execute(rowsToGroup: RowNode[]): RowNode[];
    private group(rowNodes, groupedCols, expandByDefault);
    private isExpanded(expandByDefault, level);
}
