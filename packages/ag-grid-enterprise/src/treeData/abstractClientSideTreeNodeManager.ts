import type { RowNode } from 'ag-grid-community';
import { AbstractClientSideNodeManager } from 'ag-grid-community';

import { TreeNodeManager } from './treeNodeManager/treeNodeManager';

export abstract class AbstractClientSideTreeNodeManager<TData> extends AbstractClientSideNodeManager<TData> {
    protected treeNodeManager: TreeNodeManager;
    private oldGroupDisplayColIds: string = '';

    public override initRootNode(rootRowNode: RowNode<TData>): void {
        this.treeNodeManager ??= this.createManagedBean(new TreeNodeManager());
        super.initRootNode(rootRowNode);
        this.treeNodeManager.initRootNode(rootRowNode);
    }

    public override clearRootNode(): void {
        this.treeNodeManager.clearRootNode();
        super.clearRootNode();
    }

    public afterColumnsChanged(): void {
        const newGroupDisplayColIds =
            this.beans.showRowGroupColsService
                ?.getShowRowGroupCols()
                ?.map((c) => c.getId())
                .join('-') ?? '';

        // if the group display cols have changed, then we need to update rowNode.groupData
        // (regardless of tree data or row grouping)
        if (this.oldGroupDisplayColIds !== newGroupDisplayColIds) {
            this.oldGroupDisplayColIds = newGroupDisplayColIds;

            this.treeNodeManager.checkAllGroupDataAfterColsChanged(this.rootNode.childrenAfterGroup);
        }
    }
}
