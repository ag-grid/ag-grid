import type {
    BeanCollection,
    ChangedPath,
    GetDataPath,
    IShowRowGroupColsService,
    InitialGroupOrderComparatorParams,
    IsGroupOpenByDefaultParams,
    RowNodeTransaction,
    StageExecuteParams,
    WithoutGridCommon,
} from 'ag-grid-community';
import { BeanStub, RowNode, _ROW_ID_PREFIX_ROW_GROUP, _warn } from 'ag-grid-community';

import { EMPTY_ARRAY, TreeNode } from './treeNode';
import type { TreeRow } from './treeRow';
import {
    clearTreeRowFlags,
    isTreeRowCommitted,
    isTreeRowExpandedInitialized,
    isTreeRowKeyChanged,
    isTreeRowPathChanged,
    isTreeRowUpdated,
    markTreeRowCommitted,
    markTreeRowPathChanged,
    setTreeRowExpandedInitialized,
    setTreeRowKeyChanged,
    setTreeRowUpdated,
} from './treeRow';

export type IsGroupOpenByDefaultCallback =
    | ((params: WithoutGridCommon<IsGroupOpenByDefaultParams>) => boolean)
    | undefined;

export type InitialGroupOrderComparatorCallback =
    | ((params: WithoutGridCommon<InitialGroupOrderComparatorParams>) => number)
    | undefined;

export interface TreeExecutionDetails {
    changedPath: ChangedPath | undefined;
    expandByDefault: number;
    getDataPath: GetDataPath | undefined;
    isGroupOpenByDefault: IsGroupOpenByDefaultCallback;
    initialGroupOrderComparator: InitialGroupOrderComparatorCallback;
}

export class TreeStrategy extends BeanStub {
    private beans: BeanCollection;
    private showRowGroupColsService: IShowRowGroupColsService;
    private oldGroupDisplayColIds: string | undefined;

    /** Rows that are pending deletion, this.commitDeletedRows() will finalize removal. */
    private rowsPendingDestruction: Set<RowNode> | null = null;

    /** The root node of the tree. */
    private readonly root: TreeNode = new TreeNode(null, '', -1);

    public wireBeans(beans: BeanCollection) {
        this.beans = beans;
        this.showRowGroupColsService = beans.showRowGroupColsService!;
    }

    public override destroy(): void {
        const rootRow = this.root.row;
        if (rootRow !== null) {
            this.root.removeRow(rootRow);
            clearTreeRowFlags(rootRow);
        }
        this.destroyTree(this.root);
        this.commitDestroyedRows();
        super.destroy();
    }

    public execute(params: StageExecuteParams): void {
        const { rowNodeTransactions, rowNodesOrderChanged, changedPath } = params;
        const rootRow: TreeRow = params.rowNode;

        const gos = this.gos;
        const details: TreeExecutionDetails = {
            changedPath,
            expandByDefault: gos.get('groupDefaultExpanded'),
            getDataPath: gos.get('getDataPath'),
            isGroupOpenByDefault: gos.getCallback('isGroupOpenByDefault'),
            initialGroupOrderComparator: gos.getCallback('initialGroupOrderComparator'),
        };

        const rootNode = this.root;
        rootNode.setRow(rootRow);
        rootRow.leafGroup = false; // no pivoting with tree data
        const sibling: TreeRow = rootRow.sibling;
        if (sibling) {
            sibling.childrenAfterGroup = rootRow.childrenAfterGroup;
            sibling.childrenMapped = rootRow.childrenMapped;
        }

        if (rowNodeTransactions) {
            this.handleTransaction(details, rowNodeTransactions, rowNodesOrderChanged);
        } else {
            this.handleRowData(details, rootRow, params.afterColumnsChanged === true);
        }
    }

    private handleRowData(details: TreeExecutionDetails, rootRow: RowNode, afterColumnsChanged: boolean): void {
        const root = this.root;

        if (afterColumnsChanged || this.oldGroupDisplayColIds === undefined) {
            const newGroupDisplayColIds =
                this.showRowGroupColsService
                    ?.getShowRowGroupCols()
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

        this.clearTree(root);

        this.addOrUpdateRows(details, rootRow.allLeafChildren, false);

        this.commitTree(details);
    }

    private handleTransaction(
        details: TreeExecutionDetails,
        transactions: RowNodeTransaction[],
        rowNodesOrderChanged: boolean | undefined
    ): void {
        for (const { remove, update, add } of transactions) {
            // the order of [add, remove, update] is the same as in ClientSideNodeManager.
            // Order is important when a record with the same id is added and removed in the same transaction.
            this.removeRows(remove as RowNode[] | null);
            this.addOrUpdateRows(details, update as RowNode[] | null, true);
            this.addOrUpdateRows(details, add as RowNode[] | null, false);
        }
        if (rowNodesOrderChanged) {
            this.handleRowNodesOrderChanged();
        }
        this.commitTree(details); // One single commit for all the transactions
    }

    private handleRowNodesOrderChanged(): void {
        const rows = this.root.row?.allLeafChildren;
        if (rows) {
            for (let rowIdx = 0, rowsLen = rows.length; rowIdx < rowsLen; ++rowIdx) {
                const node = rows[rowIdx].treeNode as TreeNode | null;
                if (node && node.oldSourceRowIndex !== rowIdx) {
                    node.invalidateOrder(); // Order might have changed
                }
            }
        }
    }

    private checkAllGroupDataAfterColsChanged(rowNodes: RowNode[] | null | undefined): void {
        for (let i = 0, len = rowNodes?.length ?? 0; i < len; ++i) {
            const rowNode = rowNodes![i];
            this.setGroupData(rowNode, rowNode.treeNode?.key ?? rowNode.key!);
            this.checkAllGroupDataAfterColsChanged(rowNode.childrenAfterGroup);
        }
    }

    /** Transactional add/update */
    private addOrUpdateRows(details: TreeExecutionDetails, rows: RowNode[] | null | undefined, update: boolean): void {
        for (let i = 0, len = rows?.length ?? 0; i < len; ++i) {
            const row = rows![i];
            const node = this.upsertPath(this.getDataPath(details, row));
            if (node) {
                this.addOrUpdateRow(node, row, update);
            }
        }
    }

    /** Transactional removal */
    private removeRows(rows: RowNode[] | null | undefined): void {
        for (let i = 0, len = rows?.length ?? 0; i < len; ++i) {
            const row = rows![i];
            const node = row.treeNode as TreeNode | null;
            if (node !== null) {
                this.removeRow(node, row);
            }
        }
    }

    private getDataPath({ getDataPath }: TreeExecutionDetails, { data }: RowNode): string[] {
        const keys = getDataPath?.(data) || EMPTY_ARRAY;
        if (!keys.length) {
            _warn(185, { data });
        }
        return keys;
    }

    /**
     * Gets the last node of a path. Inserts filler nodes where needed.
     * Note that invalidate() is not called, is up to the caller to call it if needed.
     */
    private upsertPath(path: string[]): TreeNode | null {
        let parent: TreeNode | null = this.root;
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

    /** Add or updates the row to a non-root node, preparing the tree correctly for the commit. */
    private addOrUpdateRow(node: TreeNode, newRow: RowNode, update: boolean): void {
        const { level, row: oldRow } = node;
        if (level < 0) {
            return; // Cannot overwrite the root row
        }

        let invalidate = false;
        if (oldRow !== newRow) {
            const prevNode = newRow.treeNode as TreeNode | null;
            if (prevNode !== null && prevNode !== node) {
                // The new row is somewhere else in the tree, we need to move it.
                prevNode.removeRow(newRow);
                prevNode.invalidate();
            }

            if (oldRow === null) {
                // No previous row, just set the new row.
                node.setRow(newRow);
                invalidate = true;
            } else if (!oldRow.data) {
                // We are replacing a filler row with a real row.
                node.setRow(newRow);
                this.destroyRow(oldRow, true); // Delete the filler node
                invalidate = true;
            } else {
                // We have a new non-filler row, but we had already one, this is a duplicate
                if (node.addDuplicateRow(newRow)) {
                    invalidate = true;
                }
            }
        }

        if (update && !isTreeRowUpdated(newRow)) {
            setTreeRowUpdated(newRow);
            invalidate = true;
        }

        if (invalidate) {
            node.invalidate();
        }

        this.rowsPendingDestruction?.delete(newRow); // This row is not deleted.
    }

    /**
     * Overwrites the row property of a non-root node to null.
     * @returns The previous row, if any, that was overwritten.
     */
    private removeRow(node: TreeNode, oldRow: RowNode): void {
        const { parent, level } = node;

        if (level < 0) {
            return; // Cannot overwrite a null node or the root row
        }

        let invalidate = false;

        if (node.removeRow(oldRow)) {
            invalidate = true;
            if (parent) {
                parent.childrenChanged = true;
            }
            this.destroyRow(oldRow, !oldRow.data);
        }

        if (invalidate) {
            node.invalidate();
        }
    }

    /** Commit the changes performed to the tree */
    private commitTree(details: TreeExecutionDetails) {
        const root = this.root;

        this.commitInvalidatedChildren(details, root);

        const rootRow = root.row!;

        if (root.childrenChanged) {
            if (root.updateChildrenAfterGroup()) {
                markTreeRowPathChanged(rootRow);
            }
        }

        rootRow.updateHasChildren();

        if (isTreeRowPathChanged(rootRow)) {
            if (details.changedPath?.isActive()) {
                details.changedPath.addParentNode(rootRow);
            }
        }

        markTreeRowCommitted(rootRow);

        this.commitDestroyedRows();
    }

    /** Calls commitChild for each invalidated child, recursively. We commit only the invalidated paths. */
    private commitInvalidatedChildren(details: TreeExecutionDetails, parent: TreeNode): void {
        while (true) {
            const child = parent.dequeueInvalidated();
            if (child === null) {
                break;
            }
            if (child.parent === parent) {
                this.commitChild(details, parent, child);
            }
        }
    }

    /** Commit the changes performed to a node and its children */
    private commitChild(details: TreeExecutionDetails, parent: TreeNode, node: TreeNode): void {
        if (node.isEmptyFillerNode()) {
            this.clearTree(node);
            return; // Removed. No need to process children.
        }

        this.commitNodePreOrder(parent, node);
        this.commitInvalidatedChildren(details, node);
        this.commitNodePostOrder(details, parent, node);
    }

    private commitNodePreOrder(parent: TreeNode, node: TreeNode): void {
        let row = node.row;

        if (row === null) {
            row = this.createFillerRow(node);
            node.setRow(row);
        } else {
            row = node.sortFirstDuplicateRow()!; // The main row must have the smallest sourceRowIndex of duplicates

            if (row.allChildrenCount === undefined) {
                row.allChildrenCount = null; // initialize to null if this field wasn't initialized yet
            }
        }

        row.parent = parent.row;
        if (node.oldRow !== row) {
            // We need to update children rows parents, as the row changed
            for (const child of node.enumChildren()) {
                const childRow = child.row;
                if (childRow !== null) {
                    childRow.parent = row;
                }
            }
        }

        const key = node.key;
        if (row.key !== key) {
            row.key = key;
            setTreeRowKeyChanged(row);
            this.setGroupData(row, key);
        } else if (!row.groupData) {
            this.setGroupData(row, key);
        }
    }

    private commitNodePostOrder(details: TreeExecutionDetails, parent: TreeNode, node: TreeNode): void {
        const row = node.row!;
        const oldRow = node.oldRow;

        if (node.isEmptyFillerNode()) {
            this.clearTree(node);
            return; // Removed. No need to process further
        }

        if (node.childrenChanged) {
            if (node.updateChildrenAfterGroup()) {
                markTreeRowPathChanged(row);
            }
        }

        if (node.leafChildrenChanged) {
            node.updateAllLeafChildren();
        }

        const newRowPosition = node.getRowPosition();
        if (node.oldSourceRowIndex !== newRowPosition) {
            node.oldSourceRowIndex = newRowPosition;
            parent.childrenChanged = true; // The order of children in parent might have changed
        }

        const hasChildren = !!row.childrenAfterGroup?.length;
        const group = hasChildren || !row.data;
        const oldGroup = row.group;
        if (oldGroup !== group) {
            markTreeRowPathChanged(row);
            row.setGroup(group); // Internally calls updateHasChildren
            if (!group && !row.expanded) {
                setTreeRowExpandedInitialized(row, false);
            }
        } else if (row.hasChildren() !== hasChildren) {
            markTreeRowPathChanged(row);
            row.updateHasChildren();
        }

        if (row.group && !isTreeRowExpandedInitialized(row)) {
            if (
                oldRow !== row &&
                oldRow !== null &&
                oldRow.group &&
                isTreeRowExpandedInitialized(oldRow) &&
                !details.isGroupOpenByDefault // If we have a callback, we use that instead
            ) {
                // When removing a group and so it gets replaced by a filler or new node, its expanded state is retained. See AG-12591
                row.expanded = oldRow.expanded;
            } else {
                row.expanded = this.getExpandedInitialValue(details, row);
            }

            setTreeRowExpandedInitialized(row, true);
        }

        if (isTreeRowUpdated(row)) {
            markTreeRowPathChanged(parent.row!);

            if (isTreeRowKeyChanged(row)) {
                // hack - if we didn't do this, then renaming a tree item (ie changing rowNode.key) wouldn't get
                // refreshed into the gui.
                // this is needed to kick off the event that rowComp listens to for refresh. this in turn
                // then will get each cell in the row to refresh - which is what we need as we don't know which
                // columns will be displaying the rowNode.key info.
                row.setData(row.data);
            }
        }

        if (oldRow !== row) {
            node.oldRow = row;
            if (oldRow !== null && (oldGroup || node.hasChildren())) {
                markTreeRowPathChanged(row);
            }
            parent.childrenChanged = true;
            markTreeRowPathChanged(parent.row!);
        }

        if (isTreeRowPathChanged(row)) {
            if (details.changedPath?.isActive()) {
                details.changedPath.addParentNode(row);
            }
        } else if (!isTreeRowCommitted(row)) {
            // If this is a new row that was never committed
            // and path is not changed because this is a leaf,
            // we still need to be sure arrays are not null
            if (!row.childrenAfterFilter) {
                row.childrenAfterFilter = row.childrenAfterGroup!.slice();
            }
            if (!row.childrenAfterAggFilter) {
                row.childrenAfterAggFilter = row.childrenAfterFilter!.slice();
            }
            if (!row.childrenAfterSort) {
                row.childrenAfterSort = row.childrenAfterAggFilter!.slice();
            }
        }

        markTreeRowCommitted(row);

        if (node.duplicateRows?.size && !node.duplicateRowsWarned) {
            node.duplicateRowsWarned = true;
            _warn(186, {
                rowId: row.id,
                rowData: row.data,
                duplicateRowsData: Array.from(node.duplicateRows).map((r) => r.data),
            });
        }
    }

    private createFillerRow(node: TreeNode): RowNode {
        const row = new RowNode(this.beans); // Create a filler node
        row.key = node.key;
        row.group = true;
        row.field = null;
        row.leafGroup = false;
        row.rowGroupIndex = null;
        row.allChildrenCount = null;

        // Generate a unique id for the filler row
        let id = node.level + '-' + node.key;
        let p = node.parent;
        while (p !== null) {
            const parent = p.parent;
            if (parent === null) {
                break;
            }
            id = `${p.level}-${p.key}-${id}`;
            p = parent;
        }
        row.id = _ROW_ID_PREFIX_ROW_GROUP + id;

        return row;
    }

    private setGroupData(row: RowNode, key: string): void {
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

    /** Called to clear a subtree. */
    private clearTree(node: TreeNode): void {
        const { parent, oldRow, row, level } = node;
        if (parent !== null && oldRow !== null) {
            parent.childrenChanged = true;
            if (parent.row !== null) {
                markTreeRowPathChanged(parent.row);
            }
        }
        if (row !== null) {
            if (level >= 0) {
                let row = node.row;
                while (row !== null && node.removeRow(row)) {
                    this.destroyRow(row, !row.data);
                    row = node.row;
                }
            }
        }
        for (const child of node.enumChildren()) {
            this.clearTree(child);
        }
        node.destroy();
    }

    /** Called by the destructor, to the destroy the whole tree. */
    private destroyTree(node: TreeNode): void {
        const { row, level, duplicateRows } = node;
        if (row) {
            if (level >= 0 && !row.data) {
                this.destroyRow(row, true); // Delete the filler node
            } else {
                clearTreeRowFlags(row); // Just clear the flags
            }
        }
        if (duplicateRows) {
            for (const row of duplicateRows) {
                if (level >= 0 && !row.data) {
                    this.destroyRow(row, true); // Delete filler nodes
                } else {
                    clearTreeRowFlags(row); // Just clear the flags
                }
            }
        }
        for (const child of node.enumChildren()) {
            this.destroyTree(child);
        }
        node.destroy();
    }

    /**
     * Finalizes the deletion of a row.
     * @param immediate If true, the row is deleted immediately.
     * If false, the row is marked for deletion, and will be deleted later with this.deleteDeletedRows()
     */
    private destroyRow(row: RowNode, immediate: boolean) {
        if (!isTreeRowCommitted(row)) {
            clearTreeRowFlags(row);
            return; // Never committed, or already deleted, nothing to do.
        }

        if (!immediate) {
            (this.rowsPendingDestruction ??= new Set()).add(row);
            return; // We will delete it later with commitDeletedRows
        }

        clearTreeRowFlags(row);

        // We execute this only if the row was committed at least once before, and not already deleted.
        row.setRowIndex(null);

        // this is important for transition, see rowComp removeFirstPassFuncs. when doing animation and
        // remove, if rowTop is still present, the rowComp thinks it's just moved position.
        row.setRowTop(null);

        if (!row.data && row.isSelected()) {
            //we remove selection on filler nodes here, as the selection would not be removed
            // from the RowNodeManager, as filler nodes don't exist on the RowNodeManager
            row.setSelectedParams({ newValue: false, source: 'rowGroupChanged' });
        }
    }

    /**
     * destroyRow can defer the deletion to the end of the commit stage.
     * This method finalizes the deletion of rows that were marked for deletion.
     */
    private commitDestroyedRows() {
        const { rowsPendingDestruction: rowsPendingDeletion } = this;
        if (rowsPendingDeletion !== null) {
            this.rowsPendingDestruction = null;
            for (const row of rowsPendingDeletion) {
                this.destroyRow(row, true);
            }
        }
    }
}
