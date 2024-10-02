import type { IClientSideNodeManager, NamedBean, RowNode } from 'ag-grid-community';

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

    public override initRootNode(rootRowNode: RowNode<TData>): void {
        const oldChildrenGetter = this.childrenGetter;
        const childrenField = this.gos.get('treeDataChildrenField');
        if (!oldChildrenGetter || oldChildrenGetter.path !== childrenField) {
            this.childrenGetter = makeFieldPathGetter(childrenField);
        }

        super.initRootNode(rootRowNode);
    }

    protected override loadNewRowData(rowData: TData[]): void {
        const treeData = this.gos.get('treeData');
        const rootRow = this.rootNode;

        this.treeNodeManager.clearTree(this.treeNodeManager.root);
        if (treeData) {
            this.treeNodeManager.initRootNode(rootRow);
        } else {
            this.treeNodeManager.clearRootNode();
        }

        const childrenGetter = this.childrenGetter;

        const processedDataSet = new Set<TData>();
        const allLeafChildren: TreeRow<TData>[] = [];

        rootRow.allLeafChildren = allLeafChildren;

        const addChild = (parent: TreeNode | null, item: TData) => {
            if (processedDataSet.has(item)) {
                return; // Duplicate node
            }

            processedDataSet.add(item);

            const row = this.createRowNode(item, allLeafChildren.length) as TreeRow<TData>;
            allLeafChildren.push(row);

            const treeNode = parent ? parent.upsertKey(row.id!) : null;
            if (treeNode) {
                this.treeNodeManager.addOrUpdateRow(treeNode, row, false);
            }

            const children = childrenGetter(item);
            if (children) {
                for (const child of children) {
                    addChild(treeNode, child);
                }
            }
        };

        const rootTreeNode = treeData ? this.treeNodeManager.root : null;
        for (const item of rowData) {
            addChild(rootTreeNode, item);
        }

        this.treeNodeManager.commitTree(undefined);
    }

    public setMasterForAllRows(rows: RowNode<TData>[] | null | undefined, shouldSetExpanded: boolean): void {
        if (!this.gos.get('treeData')) {
            this.beans.detailGridApiService?.setMasterForAllRows(rows, shouldSetExpanded);
        }
    }

    protected override createRowNode(data: TData, sourceRowIndex: number): RowNode<TData> {
        const node = super.createRowNode(data, sourceRowIndex);
        if (!this.gos.get('treeData')) {
            this.beans.detailGridApiService?.setMasterForRow(node, data, true);
        }
        return node;
    }
}
