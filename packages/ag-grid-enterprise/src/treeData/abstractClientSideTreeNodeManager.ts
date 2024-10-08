import type { RowNode } from 'ag-grid-community';
import { AbstractClientSideNodeManager } from 'ag-grid-community';

import { TreeNodeManager } from './treeNodeManager/treeNodeManager';

export abstract class AbstractClientSideTreeNodeManager<TData> extends AbstractClientSideNodeManager<TData> {
    protected treeNodeManager: TreeNodeManager;
    private oldGroupDisplayColIds: string = '';

    public postConstruct(): void {
        this.treeNodeManager = this.createManagedBean(new TreeNodeManager());
    }

    public override activate(rootRowNode: RowNode<TData>): void {
        super.activate(rootRowNode);
        this.treeNodeManager.activate(rootRowNode);
    }

    public override deactivate(): void {
        this.treeNodeManager.deactivate();
        super.deactivate();
    }

    public afterColumnsChanged(): void {
        if (this.gos.get('treeData')) {
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
        } else {
            this.oldGroupDisplayColIds = '';
        }
    }
}
