// ag-grid-enterprise v7.1.0
import { IRowNodeStage, RowNode } from "ag-grid/main";
export declare class GroupStage implements IRowNodeStage {
    private selectionController;
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    private eventService;
    private context;
    private groupIdSequence;
    execute(rowNode: RowNode): void;
    private recursivelySetLevelOnChildren(rowNode, level);
    private recursivelyDeptFirstRemoveSingleChildren(rowNode, includeParents);
    private recursivelyGroup(rowNode, groupColumns, level, expandByDefault, includeParents);
    private setChildrenAfterGroup(rowNode, groupColumn, expandByDefault, level, includeParents);
    private getKeyForNode(groupColumn, rowNode);
    private createGroup(groupColumn, groupKey, parent, expandByDefault, level, includeParents);
    private isExpanded(expandByDefault, level);
}
