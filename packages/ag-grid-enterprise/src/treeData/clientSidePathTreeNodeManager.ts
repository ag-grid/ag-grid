import { _warn } from 'ag-grid-community';
import type { GetDataPath, IChangedRowNodes, NamedBean, RefreshModelParams, RowNode } from 'ag-grid-community';

import { AbstractClientSideTreeNodeManager } from './abstractClientSideTreeNodeManager';
import type { TreeNode } from './treeNode';

export class ClientSidePathTreeNodeManager<TData>
    extends AbstractClientSideTreeNodeManager<TData>
    implements NamedBean
{
    beanName = 'csrmPathTreeNodeSvc' as const;

    protected override loadNewRowData(rowData: TData[]): void {
        const rootNode = this.rootNode!;
        const treeRoot = this.treeRoot!;

        this.treeClear(treeRoot);
        this.treeSetRootNode(rootNode);

        super.loadNewRowData(rowData);

        const allLeafChildren = rootNode.allLeafChildren!;
        const getDataPath = this.gos.get('getDataPath');
        for (let i = 0, len = allLeafChildren.length; i < len; ++i) {
            this.addOrUpdateRow(getDataPath, allLeafChildren[i], true);
        }

        this.treeCommitPending = true;
    }

    public override get treeData(): boolean {
        const gos = this.gos;
        return gos.get('treeData') && !!gos.get('getDataPath');
    }

    public override refreshModel(params: RefreshModelParams<TData>, started: boolean): void {
        const changedRowNodes = params.changedRowNodes;
        if (changedRowNodes) {
            this.executeTransactions(changedRowNodes, params.rowNodesOrderChanged);
        }

        super.refreshModel(params, started);
    }

    private executeTransactions(
        changedRowNodes: IChangedRowNodes,
        rowNodesOrderMaybeChanged: boolean | undefined
    ): void {
        const treeRoot = this.treeRoot;
        if (!treeRoot) {
            return; // Destroyed or not active
        }

        this.treeSetRootNode(this.rootNode!);

        for (const row of changedRowNodes.removals) {
            const node = row.treeNode as TreeNode | null;
            if (node) {
                this.treeRemove(node, row);
            }
        }

        const getDataPath = this.gos.get('getDataPath');
        for (const row of changedRowNodes.updates) {
            this.addOrUpdateRow(getDataPath, row, false);
        }
        for (const row of changedRowNodes.adds) {
            this.addOrUpdateRow(getDataPath, row, true);
        }

        const rows = treeRoot.row?.allLeafChildren;
        if (rowNodesOrderMaybeChanged && rows) {
            for (let rowIdx = 0, rowsLen = rows.length; rowIdx < rowsLen; ++rowIdx) {
                const node = rows[rowIdx].treeNode as TreeNode | null;
                if (node && node.sourceRowIndex !== rowIdx) {
                    node.invalidateOrder(); // Order might have changed
                }
            }
        }

        this.treeCommitPending = true;
    }

    private addOrUpdateRow(getDataPath: GetDataPath | undefined, row: RowNode, created: boolean): void {
        const treeRoot = this.treeRoot!;
        if (!this.treeData) {
            // We assume that the data is flat and we use id as the key for the tree nodes.
            // This happens when treeData is false and getDataPath is undefined/null.
            this.treeSetRow(treeRoot.upsertKey(row.id!), row, created);
            return;
        }

        const path = getDataPath?.(row.data);
        const pathLength = path?.length;
        if (!pathLength) {
            _warn(185, { data: row.data });
        } else {
            // Gets the last node of a path. Inserts filler nodes where needed.
            let level = 0;
            let node = treeRoot;
            do {
                node = node.upsertKey(path[level++]);
            } while (level < pathLength);
            this.treeSetRow(node, row, created);
        }
    }
}
