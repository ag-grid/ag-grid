import type { BeanCollection, IRowNodeStage, NamedBean, StageExecuteParams } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class GroupStage extends BeanStub implements NamedBean, IRowNodeStage {
    beanName: "groupStage";
    private columnModel;
    private funcColsService;
    private selectableService;
    private valueService;
    private beans;
    private selectionService;
    private showRowGroupColsService;
    wireBeans(beans: BeanCollection): void;
    private oldGroupingDetails;
    private oldGroupDisplayColIds;
    /** Hierarchical node cache to speed up tree data node insertion */
    private treeNodeCache;
    execute(params: StageExecuteParams): void;
    private positionLeafsAndGroups;
    private createGroupingDetails;
    private handleTransaction;
    private sortChildren;
    private orderGroups;
    private getExistingPathForNode;
    /**
     * Topological sort of the given row nodes based on the grouping hierarchy, where parents come before children.
     * Used to ensure tree data is moved in the correct order (see AG-11678)
     */
    private topoSort;
    private moveNodesInWrongPath;
    private moveNode;
    private removeNodes;
    private removeNodesInStages;
    private forEachParentGroup;
    private removeNodesFromParents;
    private removeEmptyGroups;
    private removeFromParent;
    /**
     * This is idempotent, but relies on the `key` field being the same throughout a RowNode's lifetime
     */
    private addToParent;
    private areGroupColsEqual;
    private checkAllGroupDataAfterColsChanged;
    private shotgunResetEverything;
    private noChangeInGroupingColumns;
    private insertNodes;
    private insertOneNode;
    private findParentForNode;
    private getOrCreateNextNode;
    /**
     * Directly re-initialises the `TreeDataNodeCache`
     */
    private buildNodeCacheFromRows;
    private ensureRowNodeFields;
    /** Walks the TreeDataNodeCache recursively and backfills `null` entries with filler group nodes */
    private backfillGroups;
    private createGroup;
    private createGroupId;
    private setGroupData;
    private getChildrenMappedKey;
    private setExpandedInitialValue;
    private getGroupInfo;
    private getGroupInfoFromCallback;
    private getGroupInfoFromGroupColumns;
}
