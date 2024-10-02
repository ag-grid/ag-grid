import type { RowNode } from 'ag-grid-community';
import { AbstractClientSideNodeManager } from 'ag-grid-community';

import { TreeNodeManager } from './treeNodeManager/treeNodeManager';

export abstract class AbstractClientSideTreeNodeManager<TData> extends AbstractClientSideNodeManager<TData> {
    protected treeNodeManager: TreeNodeManager;

    public override initRootNode(rootRowNode: RowNode<TData>): void {
        this.treeNodeManager ??= this.createManagedBean(new TreeNodeManager());
        super.initRootNode(rootRowNode);
        this.treeNodeManager.initRootNode(rootRowNode);
    }

    public override clearRootNode(): void {
        this.treeNodeManager.clearRootNode();
        super.clearRootNode();
    }
}
