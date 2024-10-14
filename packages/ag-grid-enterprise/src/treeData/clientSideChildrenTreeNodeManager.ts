import type { IClientSideNodeManager, NamedBean, RowNode } from 'ag-grid-community';
import { _error } from 'ag-grid-community';

import { AbstractClientSideTreeNodeManager } from './abstractClientSideTreeNodeManager';
import { makeFieldPathGetter } from './fieldAccess';
import type { DataFieldGetter } from './fieldAccess';
import type { TreeNode } from './treeNodeManager/treeNode';
import type { TreeRow } from './treeNodeManager/treeRow';

export class ClientSideChildrenTreeNodeManager<TData>
    extends AbstractClientSideTreeNodeManager<TData>
    implements IClientSideNodeManager<TData>, NamedBean
{
    beanName = 'clientSideChildrenTreeNodeManager' as const;

    private childrenGetter: DataFieldGetter<TData, TData[] | null | undefined>;

    public override extractRowData(): TData[] | null | undefined {
        return Array.from(this.treeNodeManager.root.enumChildren(), (node) => node.row!.data);
    }

    public override activate(rootRowNode: RowNode<TData>): void {
        const oldChildrenGetter = this.childrenGetter;
        const childrenField = this.gos.get('treeDataChildrenField');
        if (!oldChildrenGetter || oldChildrenGetter.path !== childrenField) {
            this.childrenGetter = makeFieldPathGetter(childrenField);
        }

        super.activate(rootRowNode);
    }

    protected override loadNewRowData(rowData: TData[]): void {
        const { rootNode: rootRowNode, treeNodeManager, childrenGetter } = this;

        const processedDataSet = new Set<TData>();
        const allLeafChildren: TreeRow<TData>[] = [];

        rootRowNode.allLeafChildren = allLeafChildren;

        treeNodeManager.activate(rootRowNode);
        treeNodeManager.clearTree(this.treeNodeManager.root);

        const addChild = (parent: TreeNode, data: TData) => {
            if (processedDataSet.has(data)) {
                _error(5, { data }); // Duplicate node
                return;
            }

            processedDataSet.add(data);

            const row = this.createRowNode(data, allLeafChildren.length);
            allLeafChildren.push(row);

            parent = parent.upsertKey(row.id!);
            treeNodeManager.addOrUpdateRow(parent, row, false);

            const children = childrenGetter(data);
            if (children) {
                for (let i = 0, len = children.length; i < len; ++i) {
                    addChild(parent, children[i]);
                }
            }
        };

        const rootTreeNode = this.treeNodeManager.root;
        for (let i = 0, len = rowData.length; i < len; ++i) {
            addChild(rootTreeNode, rowData[i]);
        }

        treeNodeManager.commitTree();
    }

    public setMasterForAllRows(rows: RowNode<TData>[] | null | undefined, shouldSetExpanded: boolean): void {
        if (!this.gos.get('treeData')) {
            this.beans.detailGridApiService?.setMasterForAllRows(rows, shouldSetExpanded);
        }
    }

    public onTreeDataChanged() {
        const { rootNode } = this;
        this.treeNodeManager.activate(rootNode);
        const allLeafChildren = this.rootNode.allLeafChildren!;
        for (let i = 0, len = allLeafChildren.length; i < len; ++i) {
            (allLeafChildren[i] as TreeRow<TData>).treeNode?.invalidate();
        }
        this.treeNodeManager.commitTree();
    }

    protected override createRowNode(data: TData, sourceRowIndex: number): TreeRow<TData> {
        const node: TreeRow<TData> = super.createRowNode(data, sourceRowIndex);
        if (!this.gos.get('treeData')) {
            this.beans.detailGridApiService?.setMasterForRow(node, data, true);
        }
        return node;
    }
}
