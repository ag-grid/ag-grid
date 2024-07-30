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

const FLAG_LEAFS_CHANGED = 0x1;
const FLAG_PATH_CHANGED = 0x2;

const COMMITTED_FLAGS_TO_REMOVE = FLAG_LEAFS_CHANGED | FLAG_PATH_CHANGED;

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

export class TreeStrategy extends BeanStub implements IRowNodeStage {
    private selectionService: ISelectionService;
    private showRowGroupColsService: IShowRowGroupColsService;
    private beans: BeanCollection;
    private oldGroupDisplayColIds: string | undefined;

    private readonly root: TreeNode = new TreeNode(null, '');

    private maybeDeletedRows: Set<RowNode> | null = null;

    public wireBeans(beans: BeanCollection) {
        this.selectionService = beans.selectionService;
        this.showRowGroupColsService = beans.showRowGroupColsService!;
        this.beans = beans;
    }

    public override destroy(): void {
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

        this.setRoot(rowNode);

        if (details.transactions) {
            this.handleTransaction(details);
        } else {
            this.shotgunResetEverything(details, params.afterColumnsChanged === true);
        }
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
                    this.checkAllGroupDataAfterColsChanged(this.root.row?.childrenAfterGroup);
                }

                // WARNING: this assumes that an event with afterColumnsChange=true doesn't change the rows
                return; // No further processing needed, rows didn't change
            }

            this.oldGroupDisplayColIds = newGroupDisplayColIds;
        }

        // groups are about to get disposed, so need to deselect any that are selected
        this.selectionService.filterFromSelection((node: RowNode) => node && !node.group);

        this.addRows(details, this.root.row?.allLeafChildren);

        this.commitTree(details);
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

            this.removeRows(remove as RowNode[] | null);
            this.updateRows(details, update as RowNode[] | null);
            this.addRows(details, add as RowNode[] | null);
        }

        this.commitTree(details);

        // TODO: move this on commit
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

    private checkAllGroupDataAfterColsChanged(rowNodes: RowNode[] | null | undefined): void {
        if (rowNodes) {
            for (let i = 0, len = rowNodes.length; i < len; i++) {
                const rowNode = rowNodes[i];
                this.setGroupData(rowNode);
                this.checkAllGroupDataAfterColsChanged(rowNode.childrenAfterGroup);
            }
        }
    }

    /** Transactional removal */
    private removeRows(rows: RowNode[] | null | undefined): void {
        if (rows) {
            for (let i = 0, len = rows.length; i < len; i++) {
                const node = getTreeNode(rows[i]);
                if (node) {
                    this.overwriteNodeRow(node, null);
                }
            }
        }
    }

    /** Transactional update */
    private updateRows(details: TreeGroupingDetails, rows: RowNode[] | null | undefined): void {
        for (const row of new Set(rows)) {
            const node = this.setRowPath(row, this.getDataPath(row, details));
            if (node) {
                node.rowUpdate = true;
                node.invalidate();
            }
        }
    }

    /** Transactional insert */
    private addRows(details: TreeGroupingDetails, rows: RowNode[] | null | undefined): void {
        for (let i = 0, len = rows?.length ?? 0; i < len; i++) {
            const row = rows![i];
            this.setRowPath(row, this.getDataPath(row, details));
        }
    }

    /** Sets the path of a row. It insert the row if it does not exists, or, moves it. The missing nodes will be filler nodes. */
    private setRowPath(row: RowNode, path: string[]): TreeNode | null {
        for (let level = 0, parent = this.root, stopLevel = path.length - 1; ; ++level) {
            const key = path[level];
            const node = this.upsertNodeByKey(parent!, key);
            if (level >= stopLevel) {
                this.overwriteNodeRow(node, row);
                return node;
            }
            parent = node;
        }
    }

    private duplicateGroupKeysWarning(parent: RowNode | null, node: RowNode | null) {
        _warnOnce(`duplicate group keys for row data, keys should be unique`, [
            parent?.data ?? parent?.key,
            node?.data ?? node?.key,
        ]);
    }

    private getDataPath({ data }: RowNode, { getDataPath }: TreeGroupingDetails): string[] {
        const keys = getDataPath?.(data) || [];
        if (!keys.length) {
            _warnOnce(`getDataPath() should not return an empty path for data ${data}`);
        }
        return keys;
    }

    ///// TREE MANAGER

    private setRoot(rootRow: RowNode | null) {
        const rootNode = this.root;
        const oldRootRow = rootNode.row;
        if (oldRootRow === rootRow) {
            return; // Nothing to do
        }

        if (oldRootRow) {
            oldRootRow.childrenAfterGroup = [];
            setTreeNode(oldRootRow, null);
        }

        if (rootRow) {
            rootRow.level = -1;
            rootRow.leafGroup = false; // no pivoting with tree data
            rootRow.childrenAfterGroup = rootNode.childrenAfterGroup;
            rootRow.updateHasChildren();
            setTreeNode(rootRow, rootNode);
            rootNode.row = rootRow;

            const sibling = rootRow.sibling;
            if (sibling) {
                sibling.childrenAfterGroup = rootRow.childrenAfterGroup;
                sibling.childrenMapped = rootRow.childrenMapped;
            }
        }
    }

    /** Overwrites the row property of a non-root node, preparing the tree correctly for the commit. */
    private overwriteNodeRow(node: TreeNode, newRow: RowNode | null): void {
        const { parent, row } = node;
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
            (this.maybeDeletedRows ??= new Set()).add(row);
        }

        if (newRow) {
            node.row = newRow;
            newRow.parent = parent?.row ?? null;
            newRow.childrenAfterGroup = node.childrenAfterGroup;
            newRow.allLeafChildren = node.allLeafChildren;
            setTreeNode(newRow, node);
        } else {
            node.row = null;
        }

        if (row?.data && newRow?.data) {
            this.duplicateGroupKeysWarning(row, newRow);
        }

        node.invalidate();
    }

    private upsertNodeByKey(parent: TreeNode, key: string): TreeNode {
        let node = parent.map?.get(key);
        if (!node) {
            node = new TreeNode(parent, key);
            (parent.map ??= new Map()).set(key, node);
            node.invalidate();
        }
        return node;
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

    private commitTree(details: TreeGroupingDetails) {
        const root = this.root;
        let childrenRowsChanged = false;
        if (root.updates?.size) {
            for (const child of root.updates) {
                const oldRow = child.oldRow;
                this.commitNode(details, child, root, 0);
                childrenRowsChanged ||= oldRow !== child.row;
            }
            root.updates = null;

            if (childrenRowsChanged) {
                this.rebuildChildrenAfterGroup(root);
            }
        }

        if ((childrenRowsChanged || root.flags & FLAG_PATH_CHANGED) && details.changedPath.isActive()) {
            details.changedPath.addParentNode(root.row);
        }

        root.flags &= ~COMMITTED_FLAGS_TO_REMOVE;

        this.removeDeletedRows();
    }

    private commitNode(details: TreeGroupingDetails, node: TreeNode, parent: TreeNode, level: number): void {
        let childrenRowsChanged = false;

        if (node.updates) {
            const childLevel = level + 1;
            for (const child of node.updates) {
                const childOldRow = child.oldRow;
                this.commitNode(details, child, node, childLevel);
                childrenRowsChanged ||= childOldRow !== child.row;
                if (child.flags & FLAG_LEAFS_CHANGED) {
                    node.flags |= FLAG_LEAFS_CHANGED;
                }
                child.flags &= ~COMMITTED_FLAGS_TO_REMOVE;
            }
            node.updates = null;
        }

        if (!node.row?.data && !node.map?.size) {
            this.emptyFillerNodeRemoved(node, parent);
        } else {
            const row = this.getOrCreateRow(node);

            row.parent = parent.row; // By now, we have the parent row
            row.level = level;

            this.maybeDeletedRows?.delete(row); // This row is used. It's not deleted.

            const keyChanged = row.key !== node.key;
            if (keyChanged) {
                node.rowUpdate ||= !row.key;
                row.key = node.key;
            }

            if (node.oldRow !== node.row && node.map) {
                // We need to update children parents, as the row changed
                for (const { row: childRow } of node.map.values()) {
                    if (childRow) {
                        childRow.parent = row;
                    }
                }
            }

            if (childrenRowsChanged) {
                childrenRowsChanged = this.rebuildChildrenAfterGroup(node);
            }

            if (childrenRowsChanged || node.flags & FLAG_LEAFS_CHANGED) {
                if (this.rebuildLeafChildren(node)) {
                    parent.flags |= FLAG_LEAFS_CHANGED; // propagate up
                }
            }

            if (row.id === undefined && !row.data) {
                row.id = makeFillerRowId(node, level);
            }

            if (keyChanged || !row.groupData) {
                this.setGroupData(row);
            }

            if (node.rowUpdate) {
                // hack - if we didn't do this, then renaming a tree item (ie changing rowNode.key) wouldn't get
                // refreshed into the gui.
                // this is needed to kick off the event that rowComp listens to for refresh. this in turn
                // then will get each cell in the row to refresh - which is what we need as we don't know which
                // columns will be displaying the rowNode.key info.
                row.setData(row.data);
            }

            if (keyChanged || node.oldRow !== node.row || node.rowUpdate) {
                parent.flags |= FLAG_PATH_CHANGED;
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

            if ((childrenRowsChanged || node.flags & FLAG_PATH_CHANGED) && details.changedPath.isActive()) {
                details.changedPath.addParentNode(node.row);
            }
        }

        node.oldRow = node.row;
        node.rowUpdate = false;
    }

    /** Called during commit to remove an empty filler node */
    private emptyFillerNodeRemoved(node: TreeNode, parent: TreeNode) {
        this.overwriteNodeRow(node, null);
        parent.flags |= node.flags & (FLAG_LEAFS_CHANGED | FLAG_PATH_CHANGED);
        parent.map?.delete(node.key);
        node.parent = null;
    }

    private removeDeletedRows() {
        const rows = this.maybeDeletedRows;
        if (rows) {
            this.maybeDeletedRows = null;
            for (const row of rows) {
                if (!row.parent) {
                    this.rowDeleted(row);
                }
            }
        }
    }

    private rowDeleted(row: RowNode) {
        row.childrenAfterGroup = [];
        row.allLeafChildren = [];

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

    /** Called during commit to get the row, or create a filler row if the node has no row as late as possible */
    private getOrCreateRow(node: TreeNode): RowNode {
        let row = node.row;
        if (!row) {
            row = new RowNode(this.beans); // Create a filler node
            row.group = true;
            row.field = null;
            row.key = node.key;
            row.leafGroup = false;
            row.rowGroupIndex = null;
            row.parent = node.parent ? this.getOrCreateRow(node.parent) : null;
            this.overwriteNodeRow(node, row);

            // why is this done here? we are not updating the children count as we go,
            // i suspect this is updated in the filter stage
            row.setAllChildrenCount(0);
        }
        return row;
    }

    private rebuildChildrenAfterGroup(node: TreeNode): boolean {
        const { map, childrenAfterGroup } = node;
        const oldCount = childrenAfterGroup.length;
        let count = 0;
        let changed = false;
        if (map) {
            childrenAfterGroup.length = map.size;
            for (const child of map.values()) {
                const row = this.getOrCreateRow(child);
                if (childrenAfterGroup[count] !== row) {
                    childrenAfterGroup[count] = row;
                    changed = true;
                }
                ++count;
            }
        }
        if (count !== oldCount) {
            childrenAfterGroup.length = count;
            changed = true;
        }

        // TODO: investigate how to do and maintain _sortRowNodesByOrder here

        return changed;
    }

    private rebuildLeafChildren(node: TreeNode): boolean {
        const { childrenAfterGroup, allLeafChildren } = node;
        const oldCount = allLeafChildren!.length;
        let count = 0;
        let changed = false;
        for (let i = 0, iLen = childrenAfterGroup.length; i < iLen; i++) {
            const childRow = childrenAfterGroup[i];
            const childAllLeafChildren = childRow.allLeafChildren!;
            const jLen = childAllLeafChildren.length;
            if (jLen > 0) {
                for (let j = 0, jLen = childAllLeafChildren.length; j < jLen; j++) {
                    const leaf = childAllLeafChildren[j];
                    if (count >= oldCount || allLeafChildren[count] !== leaf) {
                        allLeafChildren[count] = leaf;
                        changed = true;
                    }
                    ++count;
                }
            } else {
                if (count >= oldCount || allLeafChildren[count] !== childRow) {
                    allLeafChildren[count] = childRow;
                    changed = true;
                }
                ++count;
            }
        }
        if (count !== oldCount) {
            allLeafChildren.length = count;
            changed = true;
        }
        return changed;
    }

    private getExpandedInitialValue(details: TreeGroupingDetails, row: RowNode): boolean {
        const userCallback = details.isGroupOpenByDefault;
        if (userCallback) {
            return (
                userCallback({
                    rowNode: row,
                    field: row.field!,
                    key: row.key!,
                    level: row.level,
                    rowGroupColumn: row.rowGroupColumn!,
                }) == true
            );
        }
        return details.expandByDefault === -1 || row.level < details.expandByDefault;
    }
}
