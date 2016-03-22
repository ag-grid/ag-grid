// ag-grid-enterprise v4.0.7
import { IRowNodeStage } from "ag-grid/main";
import { RowNode } from "ag-grid/main";
export declare class GroupStage implements IRowNodeStage {
    private selectionController;
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    private eventService;
    execute(rowsToGroup: RowNode[]): RowNode[];
    private group(rowNodes, groupedCols, expandByDefault);
    private isExpanded(expandByDefault, level);
}
