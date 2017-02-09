// ag-grid-enterprise v8.0.0
import { IRowNodeStage, StageExecuteParams } from "ag-grid/main";
export declare class GroupStage implements IRowNodeStage {
    private selectionController;
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    private eventService;
    private context;
    private groupIdSequence;
    execute(params: StageExecuteParams): void;
    private recursivelySetLevelOnChildren(rowNode, level);
    private recursivelyDeptFirstRemoveSingleChildren(rowNode, includeParents);
    private recursivelyGroup(rowNode, groupColumns, level, expandByDefault, includeParents);
    private bucketIntoChildrenAfterGroup(rowNode, groupColumn, expandByDefault, level, includeParents);
    private insertRowNodes(newRowNodes, rootNode, groupColumns, expandByDefault, includeParents);
    private placeNodeIntoNextGroup(previousGroup, nodeToPlace, groupColumn, expandByDefault, level, includeParents);
    private getKeyForNode(groupColumn, rowNode);
    private createGroup(groupColumn, groupKey, parent, expandByDefault, level, includeParents);
    private isExpanded(expandByDefault, level);
}
