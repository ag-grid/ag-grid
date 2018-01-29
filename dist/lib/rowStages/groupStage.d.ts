// ag-grid-enterprise v16.0.1
import { IRowNodeStage, StageExecuteParams } from "ag-grid/main";
export declare class GroupStage implements IRowNodeStage {
    private selectionController;
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    private eventService;
    private context;
    private usingTreeData;
    private getDataPath;
    private groupIdSequence;
    private postConstruct();
    execute(params: StageExecuteParams): void;
    private createGroupingDetails(params);
    private handleTransaction(details);
    private recursiveSortChildren(node, details);
    private getExistingPathForNode(node, details);
    private moveNodesInWrongPath(childNodes, details);
    private moveNode(childNode, details);
    private removeNodes(leafRowNodes, details);
    private removeOneNode(childNode, details);
    private removeFromParent(child);
    private addToParent(child, parent);
    private shotgunResetEverything(details);
    private insertNodes(newRowNodes, details);
    private insertOneNode(childNode, details);
    private findParentForNode(childNode, path, details);
    private swapGroupWithUserNode(fillerGroup, userGroup);
    private getOrCreateNextNode(parentGroup, groupInfo, level, details);
    private createGroup(groupInfo, parent, level, details);
    private getChildrenMappedKey(key, rowGroupColumn);
    private isExpanded(expandByDefault, level);
    private getGroupInfo(rowNode, details);
    private getGroupInfoFromCallback(rowNode);
    private getGroupInfoFromGroupColumns(rowNode, details);
}
