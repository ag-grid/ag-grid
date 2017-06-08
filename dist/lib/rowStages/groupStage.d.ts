// ag-grid-enterprise v10.1.0
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
    private handleTransaction(tran, rootNode, groupedCols, expandByDefault, includeParents, isPivot);
    private checkParents(leafRowNodes, rootNode, groupColumns, expandByDefault, includeParents, isPivot);
    private removeRowNodesFromGroups(leafRowNodes, rootNode);
    private removeRowNodeFromGroups(leafToRemove, rootNode);
    private removeGroupFromParent(groupPointer);
    private shotgunResetEverything(rootNode, groupedCols, expandByDefault, includeParents, isPivot);
    private insertRowNodesIntoGroups(newRowNodes, rootNode, groupColumns, expandByDefault, includeParents, isPivot);
    private insertRowNodeIntoGroups(rowNode, rootNode, groupColumns, expandByDefault, includeParents, isPivot);
    private getOrCreateNextGroup(parentGroup, nodeToPlace, groupColumn, expandByDefault, level, includeParents, numberOfGroupColumns, isPivot);
    private getKeyForNode(groupColumn, rowNode);
    private createSubGroup(groupColumn, groupKey, parent, expandByDefault, level, includeParents, numberOfGroupColumns, isPivot);
    private isExpanded(expandByDefault, level);
}
