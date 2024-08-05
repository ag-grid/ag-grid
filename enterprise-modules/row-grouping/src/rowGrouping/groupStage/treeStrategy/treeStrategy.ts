import type {
    BeanCollection,
    ChangedPath,
    GetDataPath,
    IRowNodeStage,
    IShowRowGroupColsService,
    InitialGroupOrderComparatorParams,
    IsGroupOpenByDefaultParams,
    RowNodeTransaction,
    StageExecuteParams,
    WithoutGridCommon,
} from '@ag-grid-community/core';
import { BeanStub, _sortRowNodesByOrder, _warnOnce } from '@ag-grid-community/core';
import { RowNode } from '@ag-grid-community/core';

import { TreeNode } from './treeNode';
import {
    clearExpandedInitialized,
    getTreeRowTreeNode,
    isTreeRowExpandedInitialized,
    isTreeRowUpdated,
    setTreeRowUpdated,
    treeRowCommitted,
    treeRowDeleted,
} from './treeRowNode';

type IsGroupOpenByDefault = ((params: WithoutGridCommon<IsGroupOpenByDefaultParams>) => boolean) | undefined;

type InitialGroupOrderComparator =
    | ((params: WithoutGridCommon<InitialGroupOrderComparatorParams>) => number)
    | undefined;

export interface TreeExecutionDetails {
    expandByDefault: number;
    changedPath: ChangedPath;
    rowNodeOrder: { [id: string]: number };
    suppressGroupMaintainValueType: boolean;
    getDataPath: GetDataPath | undefined;
    isGroupOpenByDefault: IsGroupOpenByDefault;
    initialGroupOrderComparator: InitialGroupOrderComparator;
}

export class TreeStrategy extends BeanStub implements IRowNodeStage {
    private showRowGroupColsService: IShowRowGroupColsService;
    private beans: BeanCollection;
    private oldGroupDisplayColIds: string | undefined;
    private deletedRows: Set<RowNode> | null = null;
    private readonly root: TreeNode = new TreeNode(null, '', -1, false);

    public wireBeans(beans: BeanCollection) {
        this.showRowGroupColsService = beans.showRowGroupColsService!;
        this.beans = beans;
    }

    public override destroy(): void {
        this.destroyTree(this.root, null);
        super.destroy();
        this.beans = null!;
    }

    public execute(params: StageExecuteParams): void {
        const { rowNode: rootRow, changedPath, rowNodeTransactions, rowNodeOrder } = params;

        const gos = this.gos;
        const details: TreeExecutionDetails = {
            expandByDefault: gos.get('groupDefaultExpanded'),
            changedPath: changedPath!,
            rowNodeOrder: rowNodeOrder!,
            suppressGroupMaintainValueType: gos.get('suppressGroupMaintainValueType'),
            getDataPath: gos.get('getDataPath'),
            isGroupOpenByDefault: gos.getCallback('isGroupOpenByDefault'),
            initialGroupOrderComparator: gos.getCallback('initialGroupOrderComparator'),
        };

        const rootNode = this.root;
        rootNode.linkRow(rootRow);
        rootRow.parent = null;
        rootRow.level = -1;
        rootRow.leafGroup = false; // no pivoting with tree data
        rootRow.childrenAfterGroup = rootNode.childrenAfterGroup;
        const sibling = rootRow.sibling;
        if (sibling) {
            sibling.childrenAfterGroup = rootRow.childrenAfterGroup;
            sibling.childrenMapped = rootRow.childrenMapped;
        }

        if (rowNodeTransactions) {
            this.handleTransaction(details, rowNodeTransactions);
        } else {
            this.handleRowData(details, rootRow, params.afterColumnsChanged === true);
        }
    }

    private handleRowData(details: TreeExecutionDetails, rootRow: RowNode, afterColumnsChanged: boolean): void {
        const root = this.root;

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
                    this.checkAllGroupDataAfterColsChanged(root.row?.childrenAfterGroup);
                }

                // WARNING: this assumes that an event with afterColumnsChange=true doesn't change the rows
                return; // No further processing needed, rows didn't change
            }

            this.oldGroupDisplayColIds = newGroupDisplayColIds;
        }

        this.clearTree(this.root);
        this.addOrUpdateRows(details, rootRow.allLeafChildren, false);
        this.commitTree(details);
    }

    private handleTransaction(details: TreeExecutionDetails, transactions: RowNodeTransaction[]): void {
        const { changedPath, rowNodeOrder } = details;

        for (const { remove, update, add } of transactions) {
            // the order of [add, remove, update] is the same as in ClientSideNodeManager.
            // Order is important when a record with the same id is added and removed in the same transaction.
            this.removeRows(remove as RowNode[] | null);
            this.addOrUpdateRows(details, update as RowNode[] | null, true);
            this.addOrUpdateRows(details, add as RowNode[] | null, false);
        }
        this.commitTree(details);

        if (rowNodeOrder) {
            // this is used when doing delta updates, eg Redux, keeps nodes in right order
            changedPath.forEachChangedNodeDepthFirst(
                (node) => {
                    const didSort = _sortRowNodesByOrder(node.childrenAfterGroup, rowNodeOrder);
                    if (didSort) {
                        changedPath.addParentNode(node);
                    }
                },
                false,
                true
            );
        }
    }

    private checkAllGroupDataAfterColsChanged(rowNodes: RowNode[] | null | undefined): void {
        for (let i = 0, len = rowNodes?.length ?? 0; i < len; ++i) {
            const rowNode = rowNodes![i];
            this.setGroupData(rowNode);
            this.checkAllGroupDataAfterColsChanged(rowNode.childrenAfterGroup);
        }
    }

    /** Called when a subtree needs to be destroyed. */
    private destroyTree(node: TreeNode, changedPath: ChangedPath | null): void {
        const { level, row, childrenAfterGroup, allLeafChildren } = node;
        childrenAfterGroup.length = 0;
        if (level >= 0) {
            allLeafChildren.length = 0;
        }
        if (row !== null) {
            node.linkRow(null);
            treeRowDeleted(row);
        }
        node.oldRow = null;
        let hasRows = false;
        for (const child of node.enumChildren()) {
            hasRows ||= !!child.row;
            this.destroyTree(child, changedPath);
        }
        if (hasRows && row && changedPath) {
            if (changedPath.isActive()) {
                changedPath.addParentNode(row);
            }
        }
        node.remove();
    }

    /** Removes all rows from the tree */
    private clearTree(node: TreeNode): void {
        this.overwriteRow(node, null, false);
        for (const child of node.enumChildren()) {
            this.clearTree(child);
        }
    }

    /** Transactional removal */
    private removeRows(rows: RowNode[] | null | undefined): void {
        for (let i = 0, len = rows?.length ?? 0; i < len; ++i) {
            const row = this.overwriteRow(getTreeRowTreeNode(rows![i]), null, false);
            if (row) {
                clearExpandedInitialized(row);
            }
        }
    }

    /** Transactional insert/update */
    private addOrUpdateRows(details: TreeExecutionDetails, rows: RowNode[] | null | undefined, update: boolean): void {
        for (let i = 0, len = rows?.length ?? 0; i < len; i++) {
            const row = rows![i];
            this.overwriteRow(this.upsertPath(this.getDataPath(details, row)), row, update);
        }
    }

    private getDataPath({ getDataPath }: TreeExecutionDetails, { data }: RowNode): string[] {
        const keys = getDataPath?.(data) || [];
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
        for (let level = 0, parent: TreeNode | null = this.root, stop = path.length - 1; level <= stop; ++level) {
            const node: TreeNode = parent.upsertKey(path[level]);
            if (level >= stop) {
                node.invalidate();
                return node;
            } else if (!node.row) {
                // TODO: at the moment, the sorting of filler node is not correct.
                // This needs more investigation and discussions.
                // See _sortRowNodesByOrder implementation.
                // We need to create this row early instead of waiting for the commit stage
                // because filler nodes are ordered by __objectId.
                // We create it hear so we are sure filler nodes are created in the order they are encountered
                // in the input rowData, and not in the order of invalidation, that is even less deterministic.
                // We could reduce the amount of reordering needed, and, delay the creation of filler nodes to the commit stage.
                this.overwriteRow(node, this.createFillerRow(node), false);
            }
            parent = node;
        }
        return null;
    }

    /**
     * Overwrites the row property of a non-root node, preparing the tree correctly for the commit.
     * @returns The previous row, if any, that was overwritten.
     */
    private overwriteRow(node: TreeNode | null, newRow: RowNode | null, update: boolean): RowNode | null {
        if (!node || node.level < 0) {
            return null; // Cannot overwrite a null node or the root row
        }
        const { row, ghost } = node;

        const prevNode = getTreeRowTreeNode(newRow);
        if (prevNode !== node && prevNode) {
            this.overwriteRow(prevNode, null, false); // The row is somewhere else in the tree
        }

        let invalidate = false;

        if (node.linkRow(newRow)) {
            if (row) {
                (this.deletedRows ??= new Set()).add(row);
                if (!ghost && row.data && newRow?.data) {
                    _warnOnce(`duplicate group keys for row data, keys should be unique`, [row.data, newRow.data]);
                }
            }
            invalidate = true;
        }

        // We update the ghost state recursively
        if (node.updateThisIsGhost()) {
            invalidate = true;
            let current: TreeNode | null = node;
            do {
                if (current.ghost && current.row) {
                    // This is a filler row, and we want to remove it
                    // This is because order of filler rows is currently handled by __objectId
                    // So we cannot reuse them.
                    treeRowDeleted(current.row);
                    current.linkRow(null);
                }
                current = current.parent;
            } while (current?.updateThisIsGhost());
        }

        if (update && newRow !== null && !isTreeRowUpdated(newRow)) {
            setTreeRowUpdated(newRow);
            invalidate = true;
        }

        if (invalidate) {
            node.invalidate();
        }

        return row;
    }

    private deleteDeletedRows() {
        const deletedRows = this.deletedRows;
        if (deletedRows) {
            this.deletedRows = null;
            for (const row of deletedRows) {
                treeRowDeleted(row);
            }
        }
    }

    /** Commit the changes performed to the tree */
    private commitTree(details: TreeExecutionDetails) {
        const root = this.root;

        while (true) {
            const child = root.dequeueInvalidated();
            if (!child) {
                break;
            }
            this.commitChild(details, root, child);
        }

        const rootRow = root.row!;
        this.updateChildrenAfterGroup(root);

        rootRow.updateHasChildren();

        if (root.pathChanged || root.childRemoved || root.childChanged) {
            root.pathChanged = false;
            root.childChanged = false;
            root.childRemoved = false;
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(rootRow);
            }
        }

        this.deleteDeletedRows();
    }

    private getOrCreateRow(node: TreeNode): RowNode {
        let row = node.row;
        if (row === null) {
            row = this.createFillerRow(node);
            node.linkRow(row);
        }
        return row;
    }

    /** Commit the changes performed to a node and its children */
    private commitChild(details: TreeExecutionDetails, parent: TreeNode, node: TreeNode): void {
        if (node.ghost) {
            if (node.oldRow !== null) {
                parent.childRemoved = true;
            }
            this.destroyTree(node, details.changedPath);
            return;
        }

        while (true) {
            const child = node.dequeueInvalidated();
            if (!child) {
                break;
            }
            this.commitChild(details, node, child);
        }

        return this.commitNodePostOrder(details, parent, node);
    }

    private commitNodePostOrder(details: TreeExecutionDetails, parent: TreeNode, node: TreeNode) {
        const row = this.getOrCreateRow(node);

        this.deletedRows?.delete(row); // This row is used. It's not deleted.

        if (node.oldRow !== row) {
            // We need to update children rows parents, as the row changed
            for (const { row: childRow } of node.enumChildren()) {
                if (childRow) {
                    childRow.parent = row;
                }
            }
        }

        this.updateChildrenAfterGroup(node);

        if (node.childChanged || node.childRemoved || node.leafChildrenChanged) {
            node.leafChildrenChanged = false;
            if (node.rebuildLeaves()) {
                parent.leafChildrenChanged = true; // propagate up
            }
        }

        if (row.key !== node.key) {
            if (row.key) {
                setTreeRowUpdated(row);
            }
            row.key = node.key;
            parent.pathChanged = true;
            this.setGroupData(row);
        } else if (!row.groupData) {
            this.setGroupData(row);
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

        if (!isTreeRowExpandedInitialized(row)) {
            row.expanded = this.getExpandedInitialValue(details, row);
        }

        if (node.childChanged || node.childRemoved || isTreeRowUpdated(row)) {
            node.childChanged = false;
            node.childRemoved = false;
            parent.pathChanged = true;
        }

        if (node.oldRow !== row) {
            node.oldRow = node.row;
            parent.childChanged = true;
            parent.pathChanged = true;
        }

        if (node.pathChanged) {
            node.pathChanged = false;
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(row);
            }
        }

        treeRowCommitted(row);
    }

    private createFillerRow(node: TreeNode): RowNode {
        const row = new RowNode(this.beans); // Create a filler node
        row.key = node.key;
        row.group = true;
        row.field = null;
        row.leafGroup = false;
        row.rowGroupIndex = null;
        row.id = node.fillerRowId();
        return row;
    }

    private updateChildrenAfterGroup(node: TreeNode): void {
        if (node.childRemoved) {
            this.filterRemovedChildrenAfterGroup(node);
            if (node.childChanged) {
                this.rebuildChildrenAfterGroup(node);
            }
        } else if (node.childChanged) {
            this.rebuildChildrenAfterGroup(node);
        }
    }

    private filterRemovedChildrenAfterGroup(node: TreeNode): void {
        // // Order did not change, no new rows were added, we can just filter out the nodes that have the wrong parent
        let writeIdx = 0;
        let changed = false;
        const array = node.childrenAfterGroup;
        const oldCount = array.length;
        const parentRow = node.row!;
        for (let i = 0; i < oldCount; i++) {
            const child = array[i];
            if (child.parent === parentRow) {
                array[writeIdx++] = child;
            } else {
                changed = true;
            }
        }
        array.length = writeIdx;

        node.childRemoved = changed;
    }

    /** Updates node childrenAfterGroup. Returns true if the children changed. */
    private rebuildChildrenAfterGroup(node: TreeNode): void {
        const array = node.childrenAfterGroup;
        const oldCount = array.length;
        let writeIdx = 0;
        let changed = false;
        array.length = node.childrenCount();
        for (const child of node.enumChildren()) {
            const row = child.row!;
            if (array[writeIdx] !== row) {
                array[writeIdx] = row;
                changed = true;
            }
            ++writeIdx;
        }
        if (writeIdx !== oldCount) {
            array.length = writeIdx;
            changed = true;
        }
        node.childChanged = changed;
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
                groupData[col.getColId()] = key;
            }
        }
    }

    private getExpandedInitialValue(details: TreeExecutionDetails, row: RowNode): boolean {
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
