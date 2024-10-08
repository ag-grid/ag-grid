import { _warnOnce } from 'ag-grid-community';
import type { ChangedPath, GetDataPath, NamedBean, RowNode, RowNodeTransaction } from 'ag-grid-community';

import { AbstractClientSideTreeNodeManager } from './abstractClientSideTreeNodeManager';
import type { TreeNode } from './treeNodeManager/treeNode';
import { EMPTY_ARRAY } from './treeNodeManager/treeNode';

export class ClientSidePathTreeNodeManager<TData>
    extends AbstractClientSideTreeNodeManager<TData>
    implements NamedBean
{
    beanName = 'clientSidePathTreeNodeManager' as const;

    protected override loadNewRowData(rowData: TData[]): void {
        const rootNode = this.rootNode;

        this.treeNodeManager.clearTree(this.treeNodeManager.root);
        this.treeNodeManager.activate(rootNode);

        super.loadNewRowData(rowData);

        const getDataPath = this.gos.get('getDataPath');

        for (const row of rootNode.allLeafChildren!) {
            const treeNode = this.upsertPath(this.getDataPath(getDataPath, row));
            if (treeNode) {
                this.treeNodeManager.addOrUpdateRow(treeNode, row, false);
            }
        }

        this.treeNodeManager.commitTree();
    }

    public commitTransactions(
        transactions: RowNodeTransaction<TData>[],
        changedPath: ChangedPath | undefined,
        rowNodesOrderChanged: boolean
    ): void {
        this.treeNodeManager.activate(this.rootNode);

        for (const { remove, update, add } of transactions) {
            // the order of [add, remove, update] is the same as in ClientSideNodeManager.
            // Order is important when a record with the same id is added and removed in the same transaction.
            this.treeNodeManager.removeRows(remove as RowNode[] | null);
            this.addOrUpdateRows(update as RowNode[] | null, true);
            this.addOrUpdateRows(add as RowNode[] | null, false);
        }
        if (rowNodesOrderChanged) {
            this.treeNodeManager.handleRowNodesOrderChanged();
        }
        this.treeNodeManager.commitTree(changedPath); // One single commit for all the transactions
    }

    /** Transactional add/update */
    private addOrUpdateRows(rows: RowNode[] | null, update: boolean): void {
        const getDataPath = this.gos.get('getDataPath');
        for (let i = 0, len = rows?.length ?? 0; i < len; ++i) {
            const row = rows![i];
            const node = this.upsertPath(this.getDataPath(getDataPath, row));
            if (node) {
                this.treeNodeManager.addOrUpdateRow(node, row, update);
            }
        }
    }

    private getDataPath(getDataPath: GetDataPath | undefined, { data }: RowNode): string[] {
        const keys = getDataPath?.(data) || EMPTY_ARRAY;
        if (!keys.length) {
            _warnOnce(`getDataPath() should not return an empty path`, [data]);
        }
        return keys;
    }

    /**
     * Gets the last node of a path. Inserts filler nodes where needed.
     * Note that invalidate() is not called, is up to the caller to call it if needed.
     */
    private upsertPath(path: string[]): TreeNode | null {
        let parent: TreeNode | null = this.treeNodeManager.root;
        const stop = path.length - 1;
        for (let level = 0; level <= stop; ++level) {
            const node: TreeNode = parent.upsertKey(path[level]);
            if (level >= stop) {
                node.invalidate();
                return node;
            }
            parent = node;
        }
        return null;
    }
}
