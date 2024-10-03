import type { IClientSideNodeManager, NamedBean, RowNode } from 'ag-grid-community';
import { _logError } from 'ag-grid-community';

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
        return this.rootRowNode.allLeafChildren
            ?.filter((row) => !(row as TreeRow<TData>).rowDataLevel)
            .map((row) => row.data!);
    }

    public override initRootRowNode(rootRowNode: RowNode<TData>): void {
        const oldChildrenGetter = this.childrenGetter;
        const childrenField = this.gos.get('treeDataChildrenField');
        if (!oldChildrenGetter || oldChildrenGetter.path !== childrenField) {
            this.childrenGetter = makeFieldPathGetter(childrenField);
        }

        super.initRootRowNode(rootRowNode);
    }

    protected override loadNewRowData(rowData: TData[]): void {
        const { treeData, rootRowNode, treeNodeManager, childrenGetter } = this;

        const processedDataSet = new Set<TData>();
        const allLeafChildren: TreeRow<TData>[] = [];

        rootRowNode.allLeafChildren = allLeafChildren;

        treeNodeManager.clearTree(this.treeNodeManager.root);

        const addChild = (parent: TreeNode, rowDataLevel: number, data: TData) => {
            if (processedDataSet.has(data)) {
                _logError(5, { data }); // Duplicate node
                return;
            }

            processedDataSet.add(data);

            const row = this.createRowNode(data, allLeafChildren.length) as TreeRow<TData>;
            row.rowDataLevel = rowDataLevel;
            allLeafChildren.push(row);

            if (treeData) {
                parent = parent.upsertKey(row.id!);
                treeNodeManager.addOrUpdateRow(parent, row, false);
            }

            const children = childrenGetter(data);
            if (children) {
                ++rowDataLevel;
                for (let i = 0, len = children.length; i < len; ++i) {
                    addChild(parent, rowDataLevel, children[i]);
                }
            }
        };

        const rootTreeNode = this.treeNodeManager.root;
        for (let i = 0, len = rowData.length; i < len; ++i) {
            addChild(rootTreeNode, 0, rowData[i]);
        }

        if (treeData) {
            treeNodeManager.commitTree(undefined);
        }
    }

    public setMasterForAllRows(rows: RowNode<TData>[] | null | undefined, shouldSetExpanded: boolean): void {
        if (!this.treeData) {
            this.beans.detailGridApiService?.setMasterForAllRows(rows, shouldSetExpanded);
        }
    }

    protected override createRowNode(data: TData, sourceRowIndex: number): RowNode<TData> {
        const node = super.createRowNode(data, sourceRowIndex);
        if (!this.treeData) {
            this.beans.detailGridApiService?.setMasterForRow(node, data, true);
        }
        return node;
    }
}
