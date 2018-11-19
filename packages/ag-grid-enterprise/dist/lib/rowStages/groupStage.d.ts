// ag-grid-enterprise v19.1.3
import { IRowNodeStage, StageExecuteParams } from "ag-grid-community";
export declare class GroupStage implements IRowNodeStage {
    private selectionController;
    private gridOptionsWrapper;
    private columnController;
    private selectableService;
    private valueService;
    private eventService;
    private context;
    private usingTreeData;
    private getDataPath;
    private groupIdSequence;
    private postConstruct;
    execute(params: StageExecuteParams): void;
    private createGroupingDetails;
    private handleTransaction;
    private recursiveSortChildren;
    private sortGroupsWithComparator;
    private getExistingPathForNode;
    private moveNodesInWrongPath;
    private moveNode;
    private removeNodes;
    private removeOneNode;
    private removeFromParent;
    private addToParent;
    private shotgunResetEverything;
    private insertNodes;
    private insertOneNode;
    private findParentForNode;
    private swapGroupWithUserNode;
    private getOrCreateNextNode;
    private createGroup;
    private getChildrenMappedKey;
    private isExpanded;
    private getGroupInfo;
    private getGroupInfoFromCallback;
    private getGroupInfoFromGroupColumns;
}
//# sourceMappingURL=groupStage.d.ts.map