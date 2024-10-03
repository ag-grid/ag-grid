import type { RowNode } from 'ag-grid-community';
import { AbstractClientSideNodeManager } from 'ag-grid-community';

import { TreeNodeManager } from './treeNodeManager/treeNodeManager';

export abstract class AbstractClientSideTreeNodeManager<TData> extends AbstractClientSideNodeManager<TData> {
    protected treeNodeManager: TreeNodeManager;
    private oldGroupDisplayColIds: string = '';

    public get treeData(): boolean {
        return !!this.treeNodeManager.root.row;
    }

    public postConstruct(): void {
        this.treeNodeManager = this.createManagedBean(new TreeNodeManager());
    }

    public override initRootRowNode(rootRowNode: RowNode<TData>): void {
        super.initRootRowNode(rootRowNode);
        const treeNodeManager = this.treeNodeManager;
        if (this.gos.get('treeData')) {
            treeNodeManager.initRootNode(rootRowNode);
        } else {
            treeNodeManager.clearRootNode();
        }
    }

    public override clearRootRowNode(): void {
        this.treeNodeManager.clearRootNode();
        super.clearRootRowNode();
    }

    public afterColumnsChanged(): void {
        if (this.treeData) {
            const newGroupDisplayColIds =
                this.beans.showRowGroupColsService
                    ?.getShowRowGroupCols()
                    ?.map((c) => c.getId())
                    .join('-') ?? '';

            // if the group display cols have changed, then we need to update rowNode.groupData
            // (regardless of tree data or row grouping)
            if (this.oldGroupDisplayColIds !== newGroupDisplayColIds) {
                this.oldGroupDisplayColIds = newGroupDisplayColIds;

                this.treeNodeManager.checkAllGroupDataAfterColsChanged(this.rootRowNode.childrenAfterGroup);
            }
        } else {
            this.oldGroupDisplayColIds = '';
        }
    }
}
