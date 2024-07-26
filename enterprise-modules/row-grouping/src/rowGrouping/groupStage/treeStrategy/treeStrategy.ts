import type {
    BeanCollection,
    IRowNodeStage,
    ISelectionService,
    IShowRowGroupColsService,
    StageExecuteParams,
} from '@ag-grid-community/core';
import { BeanStub, _sortRowNodesByOrder, _warnOnce } from '@ag-grid-community/core';
import type { RowNode } from '@ag-grid-community/core';

import {
    RESULT_CYCLE_DETECTED,
    RESULT_INVALID_OPERATION,
    RESULT_KEY_ALREADY_EXISTS,
    RESULT_NOOP,
    RESULT_OK,
    TreeManager,
} from './treeManager';
import type { Result, TreeGroupingDetails, TreeNode } from './treeManager';

export class TreeStrategy extends BeanStub implements IRowNodeStage {
    private selectionService: ISelectionService;
    private showRowGroupColsService: IShowRowGroupColsService;

    private oldGroupDisplayColIds: string | undefined;
    public treeManager = new TreeManager();

    public wireBeans(beans: BeanCollection) {
        this.selectionService = beans.selectionService;
        this.showRowGroupColsService = beans.showRowGroupColsService!;
        this.treeManager.beans = beans;
    }

    public override destroy(): void {
        if (this.treeManager) {
            this.treeManager.setRoot(null);
            this.treeManager = null!;
        }
        super.destroy();
    }

    public execute(params: StageExecuteParams): void {
        const { rowNode, changedPath, rowNodeTransactions, rowNodeOrder } = params;

        const details: TreeGroupingDetails = {
            expandByDefault: this.gos.get('groupDefaultExpanded'),
            rowNodeOrder: rowNodeOrder!,
            transactions: rowNodeTransactions!,
            // if no transaction, then it's shotgun, changed path would be 'not active' at this point anyway
            changedPath: changedPath!,
            isGroupOpenByDefault: this.gos.getCallback('isGroupOpenByDefault') as any,
            initialGroupOrderComparator: this.gos.getCallback('initialGroupOrderComparator') as any,
            suppressGroupMaintainValueType: this.gos.get('suppressGroupMaintainValueType'),
            getDataPath: this.gos.get('getDataPath'),
        };

        this.treeManager.setRoot(rowNode);

        if (details.transactions) {
            this.handleTransaction(details);
        } else {
            const afterColsChanged = params.afterColumnsChanged === true;
            this.shotgunResetEverything(details, afterColsChanged);
        }
    }

    private handleTransaction(details: TreeGroupingDetails): void {
        // we don't allow batch remover for tree data as tree data uses Filler Nodes,
        // and creating/deleting filler nodes needs to be done alongside the node deleting
        // and moving. if we want to Batch Remover working with tree data then would need
        // to consider how Filler Nodes would be impacted (it's possible that it can be easily
        // modified to work, however for now I don't have the brain energy to work it all out).

        for (const { remove, update, add } of details.transactions) {
            // the order here of [add, remove, update] needs to be the same as in ClientSideNodeManager,
            // as the order is important when a record with the same id is added and removed in the same
            // transaction.

            this.removeNodes(remove as RowNode[] | null);
            this.moveNodesInWrongPath(update as RowNode[] | null, details);
            this.insertNodes(add as RowNode[] | null, details);

            this.treeManager.commitRoot(details);
        }

        if (details.rowNodeOrder) {
            // this is used when doing delta updates, eg Redux, keeps nodes in right order
            details.changedPath.forEachChangedNodeDepthFirst(
                (node) => {
                    const didSort = _sortRowNodesByOrder(node.childrenAfterGroup, details.rowNodeOrder);
                    if (didSort) {
                        details.changedPath.addParentNode(node);
                    }
                },
                false,
                true
            );
        }
    }

    private isNodeInTheRightPath(row: TreeNode, newPath: string[]): boolean {
        // Traverse from the node to the root to get the old path and compare it with the new path
        let pointer: TreeNode | null = row;
        for (let i = newPath.length - 1; i >= 0; --i) {
            if (!pointer || pointer.key !== newPath[i]) {
                return false;
            }
            pointer = pointer.parent;
        }

        // Ensure we have reached the root
        return pointer === this.treeManager.root;
    }

    private removeNodes(rows: RowNode[] | null | undefined): void {
        if (rows) {
            const treeManager = this.treeManager;
            for (let i = 0, len = rows.length; i < len; i++) {
                const node = treeManager.getTreeNode(rows[i]);
                if (node) {
                    treeManager.updateParent(node, null, null);
                }
            }
        }
    }

    private insertNodes(rows: RowNode[] | null | undefined, details: TreeGroupingDetails): void {
        if (rows) {
            for (let i = 0, len = rows.length; i < len; ++i) {
                this.insertNode(rows[i], details);
            }
        }
    }

    private insertNode(row: RowNode, details: TreeGroupingDetails) {
        const path = this.getDataPath(row, details);
        if (path.length === 0) {
            return RESULT_NOOP;
        }
        return this.moveNode(this.treeManager.getOrCreateTreeNode(row, path[path.length - 1]), path);
    }

    private moveNode(node: TreeNode, path: string[]) {
        let parent = this.treeManager.root!;
        for (let level = 0, stopLevel = path.length - 1; level <= stopLevel; ++level) {
            const key = path[level];
            if (level < stopLevel) {
                parent = this.treeManager.upsertNode(parent, key);
            } else {
                return this.handleInsertError(this.treeManager.updateParent(node, parent, key), parent, node);
            }
        }
    }

    private moveNodesInWrongPath(rows: RowNode[] | null | undefined, details: TreeGroupingDetails): void {
        if (!rows) {
            return;
        }
        this.treeManager.commitRoot(details); // TODO: remove topo sort
        const sorted = topologicalSort(this.treeManager.root!.row!, rows);
        for (const row of sorted) {
            const node = this.treeManager.getTreeNode(row);
            if (!node) {
                continue; // row was removed or not found, cannot move
            }

            this.insertNode(row, details);

            // we add node, even if parent has not changed, as the data could have
            // changed, hence aggregations will be wrong
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(row.parent);
            }

            const newPath: string[] = this.getDataPath(row, details);

            if (!this.isNodeInTheRightPath(node, newPath)) {
                if (this.moveNode(node, newPath) !== RESULT_NOOP) {
                    // hack - if we didn't do this, then renaming a tree item (ie changing rowNode.key) wouldn't get
                    // refreshed into the gui.
                    // this is needed to kick off the event that rowComp listens to for refresh. this in turn
                    // then will get each cell in the row to refresh - which is what we need as we don't know which
                    // columns will be displaying the rowNode.key info.
                    row.setData(row.data);
                }
            }
        }
    }

    private handleInsertError(result: Result, parent: TreeNode | null, node: TreeNode | null) {
        switch (result) {
            case RESULT_KEY_ALREADY_EXISTS:
                _warnOnce(
                    `duplicate group keys for row data, keys should be unique`,
                    warnDetails((node ? parent?.map?.get(node.key) : null) ?? parent, node)
                );
                return RESULT_NOOP;
            case RESULT_INVALID_OPERATION:
                _warnOnce(`cannot insert node into group`, warnDetails(parent, node));
                return RESULT_NOOP;
            case RESULT_CYCLE_DETECTED:
                _warnOnce(`cycle detected in row data`, warnDetails(parent, node));
                return RESULT_NOOP;
        }
        return RESULT_OK;
    }

    private shotgunResetEverything(details: TreeGroupingDetails, afterColumnsChanged: boolean): void {
        if (afterColumnsChanged || this.oldGroupDisplayColIds === undefined) {
            const newGroupDisplayColIds =
                this.showRowGroupColsService
                    .getShowRowGroupCols()
                    ?.map((c) => c.getId())
                    .join('-') ?? '';

            if (afterColumnsChanged) {
                // if the group display cols have changed, then we need to update rowNode.groupData
                // (regardless of tree data or row grouping)
                if (this.oldGroupDisplayColIds !== newGroupDisplayColIds) {
                    this.checkAllGroupDataAfterColsChanged(this.treeManager.root?.row?.childrenAfterGroup);
                }

                // WARNING: this assumes that an event with afterColumnsChange=true doesn't change the rows
                return; // No further processing needed, rows didn't change
            }

            this.oldGroupDisplayColIds = newGroupDisplayColIds;
        }

        // groups are about to get disposed, so need to deselect any that are selected
        this.selectionService.filterFromSelection((node: RowNode) => node && !node.group);

        this.insertNodes(this.treeManager.root?.row?.allLeafChildren, details);

        this.treeManager.commitRoot(details);
    }

    private checkAllGroupDataAfterColsChanged(rowNodes: RowNode[] | null | undefined): void {
        if (rowNodes) {
            for (let i = 0, len = rowNodes.length; i < len; i++) {
                const rowNode = rowNodes[i];
                this.treeManager.setGroupData(rowNode);
                this.checkAllGroupDataAfterColsChanged(rowNode.childrenAfterGroup);
            }
        }
    }

    private fixLevels(rowNode: RowNode, level: number): void {
        rowNode.level = level;
        rowNode.childrenAfterGroup?.forEach((child) => this.fixLevels(child, level + 1));
    }

    private getDataPath({ data }: RowNode, { getDataPath }: TreeGroupingDetails): string[] {
        const keys = getDataPath?.(data) || [];
        if (!keys.length) {
            _warnOnce(`getDataPath() should not return an empty path for data ${data}`);
        }
        return keys;
    }
}

/**
 * Topological sort of the given row nodes based on the grouping hierarchy, where parents come before children.
 * Used to ensure tree data is moved in the correct order (see AG-11678)
 */
function topologicalSort(rootRow: RowNode, rowNodes: RowNode[]): RowNode[] {
    const sortedNodes: RowNode[] = [];

    // performance: create a cache of ids to make lookups during the search faster
    const idLookup = new Map<string, RowNode>();

    // performance: keep track of the nodes we haven't found yet so we can return early
    const stillToFind = new Set<string>();

    for (let i = 0; i < rowNodes.length; i++) {
        const row = rowNodes[i];
        const id = row.id!;
        idLookup.set(id, row);
        stillToFind.add(id);
    }

    const queue = [rootRow];
    let i = 0;

    // BFS for nodes in the hierarchy that match IDs of the given nodes
    while (i < queue.length) {
        // performance: indexing into the array instead of using e.g. `.shift` is _much_ faster
        const node = queue[i];
        i++;
        if (!node) {
            continue;
        }

        const { id, childrenAfterGroup } = node;

        const found = id && idLookup.get(id);
        if (found) {
            sortedNodes.push(found);
            stillToFind.delete(id);
        }

        // we can stop early if we've already found all the nodes
        if (stillToFind.size === 0) {
            return sortedNodes;
        }

        if (childrenAfterGroup) {
            for (let i = 0; i < childrenAfterGroup.length; i++) {
                queue.push(childrenAfterGroup[i]);
            }
        }
    }

    return sortedNodes;
}

function warnDetails(parent: TreeNode | null, node: TreeNode | null): string[] {
    return [parent?.row?.data ?? parent?.key, node?.row?.data ?? node?.key];
}
