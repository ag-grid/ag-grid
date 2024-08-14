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
import { BeanStub, _warnOnce } from '@ag-grid-community/core';
import { RowNode } from '@ag-grid-community/core';

import type { RowNodeOrder } from './treeNode';
import { TreeNode } from './treeNode';
import type { TreeRow } from './treeRow';
import {
    clearTreeRowFlags,
    isTreeRowCommitted,
    isTreeRowExpandedInitialized,
    isTreeRowKeyChanged,
    isTreeRowUpdated,
    markTreeRowCommitted,
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
    rowNodeOrder: RowNodeOrder | undefined;
    expandByDefault: number;
    suppressGroupMaintainValueType: boolean;
    getDataPath: GetDataPath | undefined;
    isGroupOpenByDefault: IsGroupOpenByDefaultCallback;
    initialGroupOrderComparator: InitialGroupOrderComparatorCallback;
}

export class TreeStrategy extends BeanStub implements IRowNodeStage {
    private beans: BeanCollection;
    private showRowGroupColsService: IShowRowGroupColsService;
    private oldGroupDisplayColIds: string | undefined;
    private rowsPendingDeletion: Set<RowNode> | null = null;
    private readonly root: TreeNode = new TreeNode(null, '', -1, false);

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
        super.destroy();
    }

    public execute(params: StageExecuteParams): void {
        const { rowNodeTransactions, rowNodeOrder, changedPath } = params;
        const rootRow: TreeRow = params.rowNode;

        const gos = this.gos;
        const details: TreeExecutionDetails = {
            changedPath,
            rowNodeOrder,
            expandByDefault: gos.get('groupDefaultExpanded'),
            suppressGroupMaintainValueType: gos.get('suppressGroupMaintainValueType'),
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

        this.clearTree(root, details.changedPath);

        const rows = rootRow.allLeafChildren;
        if (rows) {
            for (let rowIndex = 0, rowsLen = rows.length; rowIndex < rowsLen; ++rowIndex) {
                const row = rows![rowIndex];
                const node = this.upsertPath(this.getDataPath(details, row));
                if (node) {
                    this.addOrUpdateRow(node, row, false);
                    if (node.rowPosition < 0) {
                        node.rowPosition = rowIndex;
                    }
                }
            }
        }

        this.commitTree(details);
    }

    private handleTransaction(details: TreeExecutionDetails, transactions: RowNodeTransaction[]): void {
        for (const { remove, update, add } of transactions) {
            // the order of [add, remove, update] is the same as in ClientSideNodeManager.
            // Order is important when a record with the same id is added and removed in the same transaction.
            this.removeRows(remove as RowNode[] | null);
            this.addOrUpdateRows(details, update as RowNode[] | null, true);
            this.addOrUpdateRows(details, add as RowNode[] | null, false);
        }
        this.commitTree(details); // One single commit for all the transactions
    }

    private checkAllGroupDataAfterColsChanged(rowNodes: RowNode[] | null | undefined): void {
        if (rowNodes) {
            const len = rowNodes.length;
            for (let i = 0; i < len; ++i) {
                const rowNode = rowNodes![i];
                this.setGroupData(rowNode, rowNode.treeNode?.key ?? rowNode.key!);
                this.checkAllGroupDataAfterColsChanged(rowNode.childrenAfterGroup);
            }
        }
    }

    /** Called by the destructor, to the destroy the whole tree. */
    private destroyTree(node: TreeNode): void {
        const { level } = node;
        let row = node.row;
        while (row !== null && node.removeRow(row)) {
            if (level >= 0 && !row.data) {
                this.deleteRow(row, true); // Delete filler nodes
            } else {
                clearTreeRowFlags(row); // Just clear the flags
            }
            row = node.row;
        }
        const children = node.enumChildren();
        node.destroy();
        for (const child of children) {
            this.destroyTree(child);
        }
    }

    /** Called to clear a subtree. */
    private clearTree(node: TreeNode, changedPath: ChangedPath | null | undefined): void {
        const { row, level } = node;
        let shouldNotify = false;
        if (row !== null) {
            shouldNotify = isTreeRowCommitted(row);
            if (level >= 0) {
                let row = node.row;
                while (row !== null && node.removeRow(row)) {
                    this.deleteRow(row, !row.data);
                    row = node.row;
                }
            }
        }
        const children = node.enumChildren();
        node.destroy();
        for (const child of children) {
            if (shouldNotify && child.row !== null && isTreeRowCommitted(child.row)) {
                shouldNotify = false;
                if (changedPath?.isActive()) {
                    changedPath.addParentNode(row);
                }
            }
            this.clearTree(child, changedPath);
        }
    }

    /** Transactional removal */
    private removeRows(rows: RowNode[] | null | undefined): void {
        if (rows) {
            const len = rows.length;
            for (let i = 0; i < len; ++i) {
                const row = rows![i];
                const node = row.treeNode as TreeNode | null;
                if (node !== null) {
                    this.removeRow(node, row);
                }
            }
        }
    }

    /** Transactional insert/update */
    private addOrUpdateRows(details: TreeExecutionDetails, rows: RowNode[] | null | undefined, update: boolean): void {
        if (rows) {
            const len = rows.length;
            for (let i = 0; i < len; ++i) {
                const row = rows![i];
                const node = this.upsertPath(this.getDataPath(details, row));
                if (node) {
                    this.addOrUpdateRow(node, row, update);
                }
            }
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
            this.deleteRow(oldRow, !oldRow.data);
        }

        if (node.updateIsGhost()) {
            invalidate = true;
        }

        if (invalidate) {
            node.invalidate();
        }
    }

    /** Add or updates the row to a non-root node, preparing the tree correctly for the commit. */
    private addOrUpdateRow(node: TreeNode, newRow: RowNode, update: boolean): void {
        if (node.level < 0) {
            return; // Cannot overwrite the root row
        }

        const { row: oldRow } = node;
        let invalidate = false;

        const prevNode = newRow.treeNode as TreeNode | null;
        if (prevNode !== null && prevNode !== node) {
            // The new row is somewhere else in the tree, we need to move it.
            if (prevNode.removeRow(newRow)) {
                if (prevNode.parent) {
                    prevNode.parent.childrenChanged = true;
                }
                prevNode.updateIsGhost();
                prevNode.invalidate();
            }
        }

        if (oldRow !== newRow) {
            if (oldRow === null) {
                // No previous row, just set the new row.
                node.setRow(newRow);
                invalidate = true;
            } else if (!oldRow.data) {
                // We are replacing a filler row with a real row.
                node.setRow(newRow);
                this.deleteRow(oldRow, true); // Delete the filler node
                invalidate = true;
            } else {
                // We have a new non-filler row, but we had already one, this is a duplicate
                if (node.addDuplicateRow(newRow)) {
                    invalidate = true;
                }
            }
        }

        if (node.updateIsGhost()) {
            invalidate = true;
        }

        if (update && !isTreeRowUpdated(newRow)) {
            setTreeRowUpdated(newRow);
            invalidate = true;
        }

        if (invalidate) {
            node.invalidate();
        }

        this.rowsPendingDeletion?.delete(newRow); // This row is not deleted.
    }

    /**
     * Finalizes the deletion of a row.
     * @param immediate If true, the row is deleted immediately.
     * If false, the row is marked for deletion, and will be deleted later with this.deleteDeletedRows()
     */
    private deleteRow(row: RowNode, immediate: boolean) {
        if (!isTreeRowCommitted(row)) {
            clearTreeRowFlags(row);
            return; // Never committed, or already deleted, nothing to do.
        }

        if (!immediate) {
            (this.rowsPendingDeletion ??= new Set()).add(row);
            return; // We will delete it later with deleteDeletedRows
        }

        clearTreeRowFlags(row);

        // We execute this only if the row was committed at least once before, and not already deleted.
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

    private commitDeletedRows() {
        const rows = this.rowsPendingDeletion;
        if (rows !== null) {
            this.rowsPendingDeletion = null;
            for (const row of rows) {
                this.deleteRow(row, true);
            }
        }
    }

    /** Commit the changes performed to the tree */
    private commitTree(details: TreeExecutionDetails) {
        const root = this.root;

        this.commitChildren(details, root);

        if (root.childrenChanged) {
            root.updateChildrenAfterGroup(details.rowNodeOrder);
        }

        const rootRow = root.row!;
        rootRow.updateHasChildren();

        if (root.pathChanged || root.childrenChanged) {
            root.pathChanged = false;
            root.childrenChanged = false;
            if (details.changedPath?.isActive()) {
                details.changedPath.addParentNode(rootRow);
            }
        }

        this.commitDeletedRows();
    }

    private commitChildren(details: TreeExecutionDetails, parent: TreeNode): void {
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
        if (this.commitNodePreOrder(details, parent, node)) {
            this.commitChildren(details, node);
            this.commitNodePostOrder(details, parent, node);
        }
    }

    private commitNodePreOrder(details: TreeExecutionDetails, parent: TreeNode, node: TreeNode): boolean {
        if (node.ghost) {
            if (node.oldRow !== null && !parent.childrenChanged) {
                parent.childrenChanged = true;
            }
            this.clearTree(node, details.changedPath);
            return false; // Cleared. No need to process children.
        }

        let row = node.row;
        if (row === null) {
            row = this.createFillerRow(node);
            node.setRow(row);
        }

        row.parent = parent.row;

        const key = node.key;
        if (row.key !== key) {
            row.key = key;
            setTreeRowKeyChanged(row);
            this.setGroupData(row, key);
        }
        if (!row.groupData) {
            this.setGroupData(row, key);
        }

        if (node.oldRow !== row) {
            node.oldRow = node.row;

            parent.pathChanged = true;
            parent.childrenChanged = true;

            // We need to update children rows parents, as the row changed
            for (const { row: childRow } of node.enumChildren()) {
                if (childRow !== null) {
                    childRow.parent = row;
                }
            }
        }

        return true;
    }

    private commitNodePostOrder(details: TreeExecutionDetails, parent: TreeNode, node: TreeNode): void {
        const { rowNodeOrder } = details;
        const row = node.row!;

        if (node.childrenChanged) {
            node.updateChildrenAfterGroup(rowNodeOrder);
        }

        if (node.leafChildrenChanged) {
            node.updateAllLeafChildren();
        }

        if (!parent.childrenChanged && rowNodeOrder && node.rowPosition !== node.getRowPosition(rowNodeOrder)) {
            // We need to be sure the parent is going to update its children, as the order might have changed
            parent.childrenChanged = true;
        }

        const hasChildren = !!row.childrenAfterGroup?.length;
        const group = hasChildren || !row.data;
        if (row.group !== group) {
            row.setGroup(group); // Internally calls updateHasChildren
            if (!group && !row.expanded) {
                setTreeRowExpandedInitialized(row, false);
            }
        } else if (row.hasChildren() !== hasChildren) {
            row.updateHasChildren();
        }

        if (row.group && !isTreeRowExpandedInitialized(row)) {
            setTreeRowExpandedInitialized(row, true);
            row.expanded = this.getExpandedInitialValue(details, row);
        }

        if (isTreeRowUpdated(row)) {
            parent.pathChanged = true;

            if (isTreeRowKeyChanged(row)) {
                // hack - if we didn't do this, then renaming a tree item (ie changing rowNode.key) wouldn't get
                // refreshed into the gui.
                // this is needed to kick off the event that rowComp listens to for refresh. this in turn
                // then will get each cell in the row to refresh - which is what we need as we don't know which
                // columns will be displaying the rowNode.key info.
                row.setData(row.data);
            }
        }

        markTreeRowCommitted(row);

        if (node.pathChanged) {
            node.pathChanged = false;
            if (details.changedPath?.isActive()) {
                details.changedPath.addParentNode(row);
            }
        }

        if (node.duplicateRows?.size && !node.duplicateRowsWarned) {
            node.duplicateRowsWarned = true;
            _warnOnce(`duplicate group keys for row data, keys should be unique`, [
                row.id,
                row.data,
                ...Array.from(node.duplicateRows).map((r) => r.data),
            ]);
        }
    }

    private createFillerRow(node: TreeNode): RowNode {
        const row = new RowNode(this.beans); // Create a filler node
        row.key = node.key;
        row.group = true;
        row.field = null;
        row.leafGroup = false;
        row.rowGroupIndex = null;

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
        row.id = RowNode.ID_PREFIX_ROW_GROUP + id;

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
}
