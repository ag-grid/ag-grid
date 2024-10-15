import { _warn } from 'ag-grid-community';
import type { ChangedPath, GetDataPath, NamedBean, RowNode, RowNodeTransaction } from 'ag-grid-community';

import { AbstractClientSideTreeNodeManager } from './abstractClientSideTreeNodeManager';
import type { TreeNode } from './treeNode';
import { EMPTY_ARRAY } from './treeNode';

export class ClientSidePathTreeNodeManager<TData>
    extends AbstractClientSideTreeNodeManager<TData>
    implements NamedBean
{
    beanName = 'clientSidePathTreeNodeManager' as const;

    protected override loadNewRowData(rowData: TData[]): void {
        const rootNode = this.rootNode;

        this.clearTree(this.treeRoot);
        this.treeRoot.setRow(rootNode);

        super.loadNewRowData(rowData);

        this.addOrUpdateRows(this.gos.get('getDataPath'), rootNode.allLeafChildren!, false);

        this.treeCommit();
    }

    public commitTransactions(
        transactions: RowNodeTransaction<TData>[],
        changedPath: ChangedPath | undefined,
        rowNodesOrderChanged: boolean
    ): void {
        this.treeRoot.setRow(this.rootNode);

        const getDataPath = this.gos.get('getDataPath');
        for (const { remove, update, add } of transactions) {
            // the order of [add, remove, update] is the same as in ClientSideNodeManager.
            // Order is important when a record with the same id is added and removed in the same transaction.
            this.removeRows(remove as RowNode[] | null);
            this.addOrUpdateRows(getDataPath, update as RowNode[] | null, true);
            this.addOrUpdateRows(getDataPath, add as RowNode[] | null, false);
        }

        if (rowNodesOrderChanged) {
            const rows = this.treeRoot.row?.allLeafChildren;
            if (rows) {
                for (let rowIdx = 0, rowsLen = rows.length; rowIdx < rowsLen; ++rowIdx) {
                    const node = rows[rowIdx].treeNode as TreeNode | null;
                    if (node && node.oldSourceRowIndex !== rowIdx) {
                        node.invalidateOrder(); // Order might have changed
                    }
                }
            }
        }

        this.treeCommit(changedPath); // One single commit for all the transactions
    }

    /** Transactional removal */
    private removeRows(rows: RowNode[] | null | undefined): void {
        for (let i = 0, len = rows?.length ?? 0; i < len; ++i) {
            const row = rows![i];
            const node = row.treeNode as TreeNode | null;
            if (node !== null) {
                this.treeRemove(node, row);
            }
        }
    }

    /** Transactional add/update */
    private addOrUpdateRows(getDataPath: GetDataPath | undefined, rows: RowNode[] | null, update: boolean): void {
        for (let i = 0, len = rows?.length ?? 0; i < len; ++i) {
            const row = rows![i];

            const data = row.data;
            const path = getDataPath?.(data) || EMPTY_ARRAY;
            if (!path.length) {
                _warn(185, { data });
            }

            // Gets the last node of a path. Inserts filler nodes where needed.
            let node: TreeNode | undefined;
            let parent: TreeNode | null = this.treeRoot;
            const stop = path.length - 1;
            for (let level = 0; level <= stop; ++level) {
                node = parent.upsertKey(path[level]);
                if (level >= stop) {
                    node.invalidate();
                    break;
                }
                parent = node;
            }

            if (node) {
                this.treeUpsert(node, row, update);
            }
        }
    }
}
