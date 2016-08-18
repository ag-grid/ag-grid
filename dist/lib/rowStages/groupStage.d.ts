// ag-grid-enterprise v5.2.0
import { IRowNodeStage, RowNode } from "ag-grid/main";
export declare class GroupStage implements IRowNodeStage {
    private selectionController;
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    private eventService;
    private context;
    execute(rowNode: RowNode): void;
    private recursivelyGroup(rowNode, groupColumns, level, expandByDefault, groupId);
    private setChildrenAfterGroup(rowNode, groupColumn, groupId, expandByDefault, level);
    private getKeyForNode(groupColumn, rowNode);
    private createGroup(groupColumn, groupKey, parent, groupId, expandByDefault, level);
    private isExpanded(expandByDefault, level);
}
