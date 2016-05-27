// ag-grid-enterprise v4.2.4
import { IRowNodeStage, RowNode } from "ag-grid/main";
export declare class GroupStage implements IRowNodeStage {
    private selectionController;
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    private eventService;
    private context;
    execute(rowNode: RowNode): void;
    private recursivelyGroup(rowNode, groupColumns, level, expandByDefault, groupId, rowsAlreadyGrouped);
    private setChildrenAfterGroup(rowNode, groupColumn, groupId, expandByDefault, level);
    private createGroup(groupColumn, groupKey, parent, groupId, expandByDefault, level);
    private isExpanded(expandByDefault, level);
}
