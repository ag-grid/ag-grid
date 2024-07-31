import type {
    BeanCollection,
    ChangedPath,
    GetDataPath,
    IRowNodeStage,
    ISelectionService,
    IShowRowGroupColsService,
    InitialGroupOrderComparatorParams,
    IsGroupOpenByDefaultParams,
    RowNodeTransaction,
    StageExecuteParams,
    WithoutGridCommon,
} from '@ag-grid-community/core';
import { BeanStub, _sortRowNodesByOrder, _warnOnce } from '@ag-grid-community/core';
import { RowNode } from '@ag-grid-community/core';

import {
    TreeNode,
    getExpandedInitialized,
    getTreeNode,
    makeFillerRowId,
    setExpandedInitialized,
    setTreeNode,
} from './treeNode';

export interface TreeGroupingDetails {
    expandByDefault: number;
    changedPath: ChangedPath;
    transactions: RowNodeTransaction[];
    rowNodeOrder: { [id: string]: number };

    isGroupOpenByDefault: (params: WithoutGridCommon<IsGroupOpenByDefaultParams>) => boolean;
    initialGroupOrderComparator: (params: WithoutGridCommon<InitialGroupOrderComparatorParams>) => number;

    suppressGroupMaintainValueType: boolean;
    getDataPath: GetDataPath | undefined;
}

/**
 * Result of committing a node, is a bitmask that indicates what changed so the parent can update things
 * We use a bitmask as a result and not an object with boolean values to avoid unnecessary object creation.
 */
const enum CommitFlags {
    None = 0,
    /** Indicates that the node row changed since last commit, so the parent need to rebuild childrenAfterGroup array */
    RowChanged = 0x01,
    /** Indicates that the node leaf children changed since last commit, so the parent need to recompute the leafs too */
    LeafsChanged = 0x02,
    /** Indicates that the node path changed since last commit, and we need to call changedPath.addParentNode */
    PathChanged = 0x04,
}

const enum ClearTreeMode {
    Preserve,
    Clear,
    Destroy,
}

export class TreeStrategy extends BeanStub implements IRowNodeStage {
    private selectionService: ISelectionService;
    private showRowGroupColsService: IShowRowGroupColsService;
    private beans: BeanCollection;
    private oldGroupDisplayColIds: string | undefined;
    private deletedRows: Set<RowNode> | null = null;
    private readonly root: TreeNode = new TreeNode(null, '');

    public wireBeans(beans: BeanCollection) {
        this.selectionService = beans.selectionService;
        this.showRowGroupColsService = beans.showRowGroupColsService!;
        this.beans = beans;
    }

    public override destroy(): void {
        this.clearTree(ClearTreeMode.Destroy);
        super.destroy();
        this.beans = null!;
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

        if (details.transactions) {
            this.handleTransaction(details);
        } else {
            const afterColumnsChanged = params.afterColumnsChanged === true;
            this.shotgun(details, rowNode, afterColumnsChanged);
        }
    }

    private shotgun(details: TreeGroupingDetails, rootRow: RowNode, afterColumnsChanged: boolean): void {
        const oldRootRow = this.root.row;

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
                    this.checkAllGroupDataAfterColsChanged(oldRootRow?.childrenAfterGroup);
                }

                // WARNING: this assumes that an event with afterColumnsChange=true doesn't change the rows
                return; // No further processing needed, rows didn't change
            }

            this.oldGroupDisplayColIds = newGroupDisplayColIds;
        }

        const rootNode = this.root;

        // groups are about to get disposed, so need to deselect any that are selected
        this.selectionService.filterFromSelection((node: RowNode) => node && !node.group);

        rootRow.level = -1;
        rootRow.leafGroup = false; // no pivoting with tree data

        this.clearTree(oldRootRow && oldRootRow !== rootRow ? ClearTreeMode.Clear : ClearTreeMode.Preserve);

        setTreeNode(rootRow, rootNode);
        rootNode.row = rootRow;

        rootRow.childrenAfterGroup = rootNode.childrenAfterGroup;
        const sibling = rootRow.sibling;
        if (sibling) {
            sibling.childrenAfterGroup = rootRow.childrenAfterGroup;
            sibling.childrenMapped = rootRow.childrenMapped;
        }

        this.addRows(details, rootRow.allLeafChildren);
        this.commitTree(details);

        rootRow.updateHasChildren();
    }

    private clearTree(mode: ClearTreeMode): void {
        this.commitDeletedRows(); // Just in case an exception did stop this from being called
        const root = this.root;
        const { map } = this.root;
        if (map) {
            for (const child of map.values()) {
                this.clearSubtree(child, mode);
            }
        }
        root.clear(mode !== ClearTreeMode.Preserve);
    }

    private clearSubtree(node: TreeNode, mode: ClearTreeMode): void {
        const { map, row } = node;
        const deleteRow = mode === ClearTreeMode.Clear || (!!row && !row.data);
        node.clear(deleteRow);
        if (row && deleteRow) {
            this.rowDeleted(row);
        }
        if (map) {
            for (const child of map.values()) {
                this.clearSubtree(child, mode);
            }
        }
    }

    private checkAllGroupDataAfterColsChanged(rowNodes: RowNode[] | null | undefined): void {
        for (let i = 0, len = rowNodes?.length ?? 0; i < len; i++) {
            const rowNode = rowNodes![i];
            this.setGroupData(rowNode);
            this.checkAllGroupDataAfterColsChanged(rowNode.childrenAfterGroup);
        }
    }

    private handleTransaction(details: TreeGroupingDetails): void {
        const { transactions, changedPath, rowNodeOrder } = details;
        for (const { remove, update, add } of transactions) {
            // the order here of [add, remove, update] needs to be the same as in ClientSideNodeManager,
            // Order is important when a record with the same id is added and removed in the same transaction.
            this.removeRows(remove as RowNode[] | null);
            this.updateRows(details, update as RowNode[] | null);
            this.addRows(details, add as RowNode[] | null);
        }
        this.commitTree(details);

        if (details.rowNodeOrder) {
            // this is used when doing delta updates, eg Redux, keeps nodes in right order
            details.changedPath.forEachChangedNodeDepthFirst(
                (node) => {
                    if (_sortRowNodesByOrder(node.childrenAfterGroup, rowNodeOrder)) {
                        changedPath.addParentNode(node);
                    }
                },
                false,
                true
            );
        }
    }

    /** Transactional removal */
    private removeRows(rows: RowNode[] | null | undefined): void {
        for (let i = 0, len = rows?.length ?? 0; i < len; i++) {
            const node = getTreeNode(rows![i]);
            if (node) {
                this.overwriteNodeRow(node, null);
            }
        }
    }

    /** Transactional update */
    private updateRows(details: TreeGroupingDetails, rows: RowNode[] | null | undefined): void {
        for (let i = 0, len = rows?.length ?? 0; i < len; i++) {
            const row = rows![i];
            const node = this.setRowPath(row, this.getDataPath(details, row));
            if (node && !node.rowUpdated) {
                node.rowUpdated = true;
                node.invalidate();
            }
        }
    }

    /** Transactional insert */
    private addRows(details: TreeGroupingDetails, rows: RowNode[] | null | undefined): void {
        for (let i = 0, len = rows?.length ?? 0; i < len; i++) {
            const row = rows![i];
            this.setRowPath(row, this.getDataPath(details, row));
        }
    }

    /** Sets the path of a row. It insert the row if it does not exists, or, moves it. Inserts filler nodes where needed. */
    private setRowPath(row: RowNode, path: string[]): TreeNode | null {
        const node = this.root.upsertPath(path);
        if (node) {
            this.overwriteNodeRow(node, row);
        }
        return node;
    }

    private getDataPath({ getDataPath }: TreeGroupingDetails, { data }: RowNode): string[] {
        const keys = getDataPath?.(data) || [];
        if (!keys.length) {
            _warnOnce(`getDataPath() should not return an empty path for data ${data}`);
        }
        return keys;
    }

    /** Overwrites the row property of a non-root node, preparing the tree correctly for the commit. */
    private overwriteNodeRow(node: TreeNode, newRow: RowNode | null): void {
        const row = node.row;
        if (row === newRow) {
            return; // nothing to do
        }

        const prevNode = newRow && getTreeNode(newRow);
        if (prevNode !== node && prevNode) {
            this.overwriteNodeRow(prevNode, null); // The row is somewhere else in the tree
        }

        if (row) {
            row.parent = null;
            row.childrenAfterGroup = null;
            row.allLeafChildren = null;
            setTreeNode(row, null);
            (this.deletedRows ??= new Set()).add(row);
        }

        if (newRow) {
            node.row = newRow;
            newRow.childrenAfterGroup = node.childrenAfterGroup;
            newRow.allLeafChildren = node.allLeafChildren;
            setTreeNode(newRow, node);
        } else {
            node.row = null;
        }

        node.invalidate();

        if (row?.data && newRow?.data) {
            _warnOnce(`duplicate group keys for row data, keys should be unique`, [row.data, newRow.data]);
        }
    }

    /** Commit the changes performed to the tree */
    private commitTree(details: TreeGroupingDetails) {
        this.commitNode(details, this.root, null, -1);
        this.commitDeletedRows();
    }

    private commitDeletedRows() {
        const deletedRows = this.deletedRows;
        if (deletedRows) {
            this.deletedRows = null;
            for (const row of deletedRows) {
                this.rowDeleted(row);
            }
        }
    }

    /** Commit the changes performed to a node and its children */
    private commitNode(
        details: TreeGroupingDetails,
        node: TreeNode,
        parent: TreeNode | null,
        level: number
    ): CommitFlags {
        let childrenFlags: CommitFlags = CommitFlags.None;

        if (node.updates) {
            const childLevel = level + 1;
            for (const child of node.updates) {
                childrenFlags |= this.commitNode(details, child, node, childLevel);
            }
            node.updates = null;
        }

        let result: CommitFlags = 0;
        let childrenChanged = false;

        if (!parent) {
            // This is the root node
            childrenChanged = childrenFlags & CommitFlags.RowChanged ? this.rebuildChildrenAfterGroup(node) : false;
        } else if (!node.row?.data && !node.map?.size) {
            // This is a filler node, remove it
            node.parent = null;
            parent.map?.delete(node.key);
            result |= childrenFlags & CommitFlags.LeafsChanged; // propagate leafs changes up
            this.overwriteNodeRow(node, null);
        } else {
            const row = this.getOrCreateRow(node);

            row.parent = parent.row; // By now, we have the parent row
            row.level = level;

            this.deletedRows?.delete(row); // This row is used. It's not deleted.

            if (row.key !== node.key) {
                row.key = node.key;
                if (!row.key) {
                    result |= CommitFlags.PathChanged;
                } else {
                    node.rowUpdated = true;
                }
                this.setGroupData(row);
            } else if (!row.groupData) {
                this.setGroupData(row);
            }

            if (node.oldRow !== node.row && node.map) {
                // We need to update children parents, as the row changed
                for (const { row: childRow } of node.map.values()) {
                    if (childRow) {
                        childRow.parent = row;
                    }
                }
            }

            if (row.id === undefined && !row.data) {
                row.id = makeFillerRowId(node, level);
            }

            childrenChanged = childrenFlags & CommitFlags.RowChanged ? this.rebuildChildrenAfterGroup(node) : false;

            if ((childrenChanged || childrenFlags & CommitFlags.LeafsChanged) && node.rebuildLeaves()) {
                result |= CommitFlags.LeafsChanged;
            }

            if (node.rowUpdated) {
                // hack - if we didn't do this, then renaming a tree item (ie changing rowNode.key) wouldn't get
                // refreshed into the gui.
                // this is needed to kick off the event that rowComp listens to for refresh. this in turn
                // then will get each cell in the row to refresh - which is what we need as we don't know which
                // columns will be displaying the rowNode.key info.
                row.setData(row.data);
            }

            const hasChildren = node.childrenAfterGroup.length > 0;
            const group = hasChildren || !row.data;
            if (row.group !== group) {
                const oldExpanded = row.expanded;
                row.setGroup(group); // Internally calls updateHasChildren
                if (!group) {
                    // hack: restore expanded state, it seems to be lost after setGroup(false)
                    // We don't want to lose expanded state when a group becomes a leaf
                    row.expanded = oldExpanded;
                }
            } else if (row.hasChildren() !== hasChildren) {
                row.updateHasChildren();
            }

            if (!getExpandedInitialized(row)) {
                setExpandedInitialized(row, true);
                row.expanded = this.getExpandedInitialValue(details, row);
            }
        }

        if (node.oldRow !== node.row) {
            node.oldRow = node.row;
            result |= CommitFlags.RowChanged | CommitFlags.PathChanged;
        }
        if (node.rowUpdated) {
            node.rowUpdated = false;
            result |= CommitFlags.PathChanged;
        }
        if ((childrenChanged || childrenFlags & CommitFlags.PathChanged) && details.changedPath.isActive()) {
            details.changedPath.addParentNode(node.row);
        }
        return result;
    }

    /** Called during commit to get the row, or create a filler row if the node has no row as late as possible */
    private getOrCreateRow(node: TreeNode): RowNode {
        let row = node.row;
        if (!row) {
            row = new RowNode(this.beans); // Create a filler node
            row.parent = node.parent ? this.getOrCreateRow(node.parent) : null;
            row.key = node.key;
            row.group = true;
            row.field = null;
            row.leafGroup = false;
            row.rowGroupIndex = null;
            this.overwriteNodeRow(node, row);

            // TODO: why is this done here? we are not updating the children count as we go,
            // i suspect this is updated in the filter stage
            row.setAllChildrenCount(0);
        }
        return row;
    }

    /** This needs to be performed after commit, only for rows really deleted and not just moved */
    private rowDeleted(row: RowNode): void {
        row.setRowIndex(null);

        // this is important for transition, see rowComp removeFirstPassFuncs. when doing animation and
        // remove, if rowTop is still present, the rowComp thinks it's just moved position.
        row.setRowTop(null);

        if (!row.data) {
            // we remove selection on filler nodes here, as the selection would not be removed
            // from the RowNodeManager, as filler nodes don't exist on the RowNodeManager
            row.setSelectedParams({ newValue: false, source: 'rowGroupChanged' });
        }
    }

    /** Updates node childrenAfterGroup. Returns true if the leaf children changed. */
    private rebuildChildrenAfterGroup(node: TreeNode): boolean {
        const { map, childrenAfterGroup } = node;
        const oldCount = childrenAfterGroup.length;
        let writeIdx = 0;
        let changed = false;
        if (map) {
            childrenAfterGroup.length = map.size;
            for (const child of map.values()) {
                const row = this.getOrCreateRow(child);
                if (childrenAfterGroup[writeIdx] !== row) {
                    childrenAfterGroup[writeIdx] = row;
                    changed = true;
                }
                ++writeIdx;
            }
        }
        if (writeIdx !== oldCount) {
            childrenAfterGroup.length = writeIdx;
            changed = true;
        }
        return changed;
    }

    private setGroupData(row: RowNode): void {
        const key = row.key!;
        const groupData: Record<string, string> = {};
        row.groupData = groupData;
        const groupDisplayCols = this.showRowGroupColsService?.getShowRowGroupCols();
        if (groupDisplayCols) {
            for (const col of groupDisplayCols) {
                // newGroup.rowGroupColumn=null when working off GroupInfo, and we always display the group in the group column
                // if rowGroupColumn is present, then it's grid row grouping and we only include if configuration says so
                groupData![col.getColId()] = key;
            }
        }
    }

    private getExpandedInitialValue(details: TreeGroupingDetails, row: RowNode): boolean {
        const userCallback = details.isGroupOpenByDefault;
        return userCallback
            ? userCallback({
                  rowNode: row,
                  field: row.field!,
                  key: row.key!,
                  level: row.level,
                  rowGroupColumn: row.rowGroupColumn!,
              }) == true
            : details.expandByDefault === -1 || row.level < details.expandByDefault;
    }
}
