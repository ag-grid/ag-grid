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

import { TreeNode } from './treeNode';

const FLAG_NEW = 0x0001;
const FLAG_CHILDREN_CHANGED = 0x0002;
const FLAG_LEAFS_CHANGED = 0x0004;
const FLAG_PATH_CHANGED = 0x0008;
const FLAG_GROUP_DATA_CHANGED = 0x0010;
const FLAG_ROW_CHANGED = 0x0020;
export const FLAG_NEEDS_SET_DATA = 0x0040;

const COMMITTED_FLAGS_TO_REMOVE =
    FLAG_NEW |
    FLAG_GROUP_DATA_CHANGED |
    FLAG_CHILDREN_CHANGED |
    FLAG_LEAFS_CHANGED |
    FLAG_PATH_CHANGED |
    FLAG_NEEDS_SET_DATA |
    FLAG_ROW_CHANGED;

interface TreeRow extends RowNode {
    [EXPANDED_INITIALIZED_SYM]?: unknown;
}

/**
 * We need this to mark a row as expanded value already precomputed.
 * A row can be reinserted after a rowData replacement, and we want to maintain the expanded state.
 */
const EXPANDED_INITIALIZED_SYM = Symbol('expandedInitialized');

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
    private rowsToNodes: WeakMap<RowNode, TreeNode> | null = null;
    private root: TreeNode | null = null;

    public wireBeans(beans: BeanCollection) {
        this.selectionService = beans.selectionService;
        this.showRowGroupColsService = beans.showRowGroupColsService!;
        this.beans = beans;
        this.beans = beans;
    }

    public override destroy(): void {
        this.setRoot(null);
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
            const afterColsChanged = params.afterColumnsChanged === true;
            this.shotgunResetEverything(details, afterColsChanged);
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
                    this.checkAllGroupDataAfterColsChanged(this.root?.row?.childrenAfterGroup);
                }

                // WARNING: this assumes that an event with afterColumnsChange=true doesn't change the rows
                return; // No further processing needed, rows didn't change
            }

            this.oldGroupDisplayColIds = newGroupDisplayColIds;
        }

        // groups are about to get disposed, so need to deselect any that are selected
        this.selectionService.filterFromSelection((node: RowNode) => node && !node.group);

        this.destroyTree(this.root);

        this.addRows(this.root?.row?.allLeafChildren, details);

        this.commitRoot(details);
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
            this.updateRows(update as RowNode[] | null, details);
            this.addRows(add as RowNode[] | null, details);
        }

        this.commitRoot(details);

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
                this.removeRow(rows[i]);
            }
        }
    }

    /** Transactional update */
    private updateRows(rows: RowNode[] | null | undefined, details: TreeGroupingDetails): void {
        for (const row of new Set(rows)) {
            const node = this.getTreeNode(row);
            if (!node) {
                continue; // row was removed or not found, cannot move
            }

            // hack: we need to execute the commit stage because we need to call row.setData(row.data)
            // if we didn't do this, then renaming a tree item (ie changing rowNode.key) wouldn't get
            // refreshed into the gui.
            node.flags |= FLAG_NEEDS_SET_DATA;
            node.invalidate();

            // we add node, even if parent has not changed, as the data could have
            // changed, hence aggregations will be wrong
            if (node.parent) {
                node.parent.flags |= FLAG_PATH_CHANGED;
            }

            const newPath: string[] = this.getDataPath(row, details);
            if (!this.isNodeInTheRightPath(node, newPath)) {
                this.addOrMoveRow(row, newPath);
            }
        }
    }

    /** Transactional insertion */
    private addRows(rows: RowNode[] | null | undefined, details: TreeGroupingDetails): void {
        if (rows) {
            for (let i = 0, len = rows.length; i < len; ++i) {
                const row = rows[i];
                this.addOrMoveRow(row, this.getDataPath(row, details));
            }
        }
    }

    /** Traverse from the node to the root to get the old path and compare it with the new path */
    private isNodeInTheRightPath(row: TreeNode, newPath: string[]): boolean {
        let pointer: TreeNode | null = row;
        for (let i = newPath.length - 1; i >= 0; --i) {
            if (!pointer || pointer.key !== newPath[i]) {
                return false;
            }
            pointer = pointer.parent;
        }
        return pointer === this.root; // Ensure we have reached the root
    }

    private addOrMoveRow(row: RowNode, path: string[]) {
        let parent = this.root!;
        for (let level = 0, stopLevel = path.length - 1; level <= stopLevel; ++level) {
            const key = path[level];
            const node = this.upsertNode(parent, key);
            if (level >= stopLevel) {
                this.setNodeRow(node, row, key);
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
        const oldRoot = this.root;

        if (!rootRow) {
            this.destroyTree(oldRoot);
        }

        if (oldRoot && oldRoot.row !== rootRow) {
            this.rowsToNodes = null;
            this.root = null;
        }

        if (rootRow && (!oldRoot || oldRoot.row !== rootRow)) {
            const root = new TreeNode(null, '', FLAG_CHILDREN_CHANGED);
            root.root = true;
            root.row = rootRow;
            this.root = root;
            this.rowsToNodes = new WeakMap<RowNode, TreeNode>().set(rootRow, root);

            // set .leafGroup always to false for tree data, as .leafGroup is only used when pivoting, and pivoting
            // isn't allowed with treeData, so the grid never actually use .leafGroup when doing treeData.
            rootRow.level = -1;
            rootRow.leafGroup = false;
            rootRow.childrenAfterGroup = [];
            rootRow.updateHasChildren();
            const sibling = rootRow.sibling;
            if (sibling) {
                sibling.childrenAfterGroup = rootRow.childrenAfterGroup;
            }
        }
    }

    private getTreeNode(row: RowNode): TreeNode | null {
        return this.rowsToNodes?.get(row) ?? null;
    }

    private addEmptyNode(parent: TreeNode, key: string): TreeNode {
        const node = new TreeNode(parent, key, FLAG_NEW | FLAG_GROUP_DATA_CHANGED);
        (parent.map ??= new Map()).set(key, node);
        parent.flags |= FLAG_CHILDREN_CHANGED;
        node.invalidate();
        return node;
    }

    private upsertNode(parent: TreeNode, key: string): TreeNode {
        return parent.map?.get(key) ?? this.addEmptyNode(parent, key);
    }

    /** Overwrites the row property of a node, preparing the tree correctly for commit. */
    private setNodeRow(node: TreeNode, newRow: RowNode, newKey: string | undefined): void {
        const { parent, row: oldRow } = node;

        let keyChanged = false;
        if (newKey === undefined) {
            newKey = node.key;
        } else if (newKey !== node.key) {
            keyChanged = true;
        }

        if (oldRow === newRow && !keyChanged) {
            return; // nothing to do, node is already in the right spot
        }

        if (keyChanged && parent) {
            const existing = parent.map?.get(newKey);
            if (existing !== node) {
                (parent.map ??= new Map<string, TreeNode>()).set(newKey, node);
                if (existing) {
                    if (existing.row?.data) {
                        this.duplicateGroupKeysWarning(existing.row, newRow);
                    }
                    // Key is changed and another node already exists with the new key
                    // We need to delete the existing node and update the current node with the new key
                    this.removeNode(existing);
                }
            }
        }

        if (oldRow !== newRow) {
            const oldNode = this.rowsToNodes?.get(newRow);
            if (oldNode !== node) {
                this.rowsToNodes?.set(newRow, node);
                if (oldNode) {
                    this.nodeDetached(oldNode);
                }
            }
            newRow.parent = parent?.row ?? null;

            node.row = newRow;
            node.flags |= FLAG_PATH_CHANGED | FLAG_CHILDREN_CHANGED | FLAG_ROW_CHANGED;

            if (oldRow) {
                // Move old allLeafChildren and childrenAfterGroup to the new row
                if (newRow) {
                    newRow.childrenAfterGroup = oldRow.childrenAfterGroup;
                    newRow.allLeafChildren = oldRow.allLeafChildren;
                }

                // We replaced the previous row with a new one, and we need to delete the old one
                this.rowRemoved(oldRow, node.flags & FLAG_NEW);

                oldRow.childrenAfterGroup = [];
                oldRow.allLeafChildren = [];
            }

            if (parent) {
                if (oldRow?.data) {
                    this.duplicateGroupKeysWarning(oldRow, newRow);
                }
            }
        }

        if (parent) {
            parent.flags |=
                newRow?.data || oldRow?.data
                    ? FLAG_CHILDREN_CHANGED | FLAG_PATH_CHANGED | FLAG_LEAFS_CHANGED
                    : FLAG_CHILDREN_CHANGED | FLAG_PATH_CHANGED;
            node.invalidate();
        }

        if (keyChanged) {
            node.key = newKey;
            node.flags |= FLAG_GROUP_DATA_CHANGED;
        }

        newRow.key = newKey;
        newRow.parent = parent?.row ?? null;
    }

    /** Entry point to delete a single row */
    private removeRow(row: RowNode | null) {
        const node = row && this.getTreeNode(row);
        if (node) {
            this.removeNode(node);
        }
    }

    /** Entry point to delete a single node */
    private removeNode(node: TreeNode) {
        const parent = node.parent;
        if (parent) {
            parent.updates?.delete(node);
            parent.invalidate();
        }
        this.nodeRemoved(node);
    }

    private destroyTree(node: TreeNode | null) {
        if (!node) {
            return;
        }

        const { row, map } = node;
        if (row) {
            if (row.data) {
                const { childrenAfterGroup, allLeafChildren } = row;
                if (childrenAfterGroup) childrenAfterGroup.length = 0;
                if (allLeafChildren && !node.root) allLeafChildren.length = 0;
                row.parent = null;
            } else if (!node.root) {
                this.nodeRemoved(node);
            }
        }

        // Just detach this node

        node.flags = FLAG_NEW | FLAG_CHILDREN_CHANGED | FLAG_LEAFS_CHANGED;
        node.updates = null;
        node.parent = null;

        if (map) {
            node.map = null;
            for (const child of map.values()) {
                this.destroyTree(child);
            }
        }
    }

    /** Called when the node need to be detached from the parent */
    private nodeDetached(node: TreeNode) {
        const parent = node.parent;
        if (parent) {
            node.parent = null;
            parent.updates?.delete(node);
            parent.map?.delete(node.key);
            let parentFlags = parent.flags;
            if (!(node.flags & FLAG_NEW)) {
                parentFlags |= FLAG_PATH_CHANGED;
            }
            if (node.row?.data || node.flags & FLAG_LEAFS_CHANGED) {
                parentFlags |= FLAG_LEAFS_CHANGED;
            }
            parent.flags = parentFlags | FLAG_CHILDREN_CHANGED;
        }
    }

    /** Called when the node is removed from the tree */
    private nodeRemoved(node: TreeNode) {
        const { row, flags } = node;
        this.nodeDetached(node);
        if (row) {
            node.row = null;
            this.rowRemoved(row, flags & FLAG_NEW);
        }
    }

    /** Called when the row is removed from the tree */
    private rowRemoved(row: RowNode, isNew: boolean | number) {
        const { childrenAfterGroup, allLeafChildren } = row;
        if (childrenAfterGroup) childrenAfterGroup.length = 0;
        if (allLeafChildren) allLeafChildren.length = 0;
        row.parent = null;

        this.rowsToNodes?.delete(row);

        if (!isNew || row.data) {
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

    private commitRoot(details: TreeGroupingDetails) {
        const root = this.root;
        if (root) {
            if (root.updates?.size) {
                for (const node of root.updates) {
                    this.commitNode(details, node, 0);
                }
                root.updates = null;

                this.rebuildChildrenAfterGroup(root);
            }

            if (root.flags & FLAG_PATH_CHANGED && details.changedPath.isActive()) {
                details.changedPath.addParentNode(root.row);
            }

            root.flags &= ~COMMITTED_FLAGS_TO_REMOVE;
        }
    }

    private commitNode(details: TreeGroupingDetails, node: TreeNode, level: number): void {
        const parent = node.parent!;
        let row = node.row;

        if (!row?.data && !node.map?.size) {
            this.nodeRemoved(node);
            return;
        }

        if (!row) {
            row = this.createFillerNode(node);
            // we put 'row-group-' before the group id, so it doesn't clash with standard row id's. we also use 't-' and 'b-'
            // for top pinned and bottom pinned rows.
            row.id = this.makeRowId(node, level);
            node.row = row;
        }

        row.parent = parent.row;
        row.level = level;

        row.allLeafChildren ??= [];
        row.childrenAfterGroup ??= [];

        if (node.updates) {
            const childLevel = level + 1;
            for (const child of node.updates) {
                this.commitNode(details, child, childLevel);
            }
            node.updates = null;
        }

        if (!row.data && !node.map?.size) {
            this.nodeRemoved(node);
            return;
        }

        if (node.flags & FLAG_GROUP_DATA_CHANGED) {
            this.setGroupData(row);
        }

        const childrenChanged = node.flags & FLAG_CHILDREN_CHANGED && this.rebuildChildrenAfterGroup(node);

        if (childrenChanged || node.flags & FLAG_LEAFS_CHANGED) {
            if (this.rebuildLeafChildren(node)) {
                parent.flags |= FLAG_LEAFS_CHANGED; // propagate up
            }
        }

        if (node.flags & FLAG_ROW_CHANGED) {
            // We need to update children parents
            const children = row.childrenAfterGroup!;
            for (let i = 0, len = children.length; i < len; i++) {
                children[i].parent = row;
            }
        }

        if (node.flags & FLAG_NEEDS_SET_DATA) {
            // hack - if we didn't do this, then renaming a tree item (ie changing rowNode.key) wouldn't get
            // refreshed into the gui.
            // this is needed to kick off the event that rowComp listens to for refresh. this in turn
            // then will get each cell in the row to refresh - which is what we need as we don't know which
            // columns will be displaying the rowNode.key info.
            row.setData(row.data);
        }

        this.recomputeRowGroupState(row);

        if (node.flags & FLAG_NEW && !(EXPANDED_INITIALIZED_SYM in row)) {
            this.setExpandedInitialValue(details, row);
        }

        if (node.flags & FLAG_PATH_CHANGED && details.changedPath.isActive()) {
            details.changedPath.addParentNode(node.row);
        }

        node.flags &= ~COMMITTED_FLAGS_TO_REMOVE;
    }

    private createFillerNode(node: TreeNode): RowNode {
        const row = new RowNode(this.beans);
        row.group = true;
        row.field = null;
        row.key = node.key;
        row.leafGroup = false;
        row.rowGroupIndex = null;

        this.rowsToNodes!.set(row, node);

        // why is this done here? we are not updating the children count as we go,
        // i suspect this is updated in the filter stage
        row.setAllChildrenCount(0);

        row.updateHasChildren();
        return row;
    }

    private makeRowId(node: TreeNode, level: number): string {
        let result = level + '-' + node.key;
        for (let p = node.parent; p?.parent; p = p.parent) {
            result = `${--level}-${p.key}-${result}`;
        }
        // we put 'row-group-' before the group id, so it doesn't clash with standard row id's.
        // we also use 't-' and 'b-' for top pinned and bottom pinned rows.
        return RowNode.ID_PREFIX_ROW_GROUP + result;
    }

    private setExpandedInitialValue(details: TreeGroupingDetails, row: RowNode): void {
        (row as TreeRow)[EXPANDED_INITIALIZED_SYM] = true;

        // use callback if exists
        const userCallback = details.isGroupOpenByDefault;
        if (userCallback) {
            const params: WithoutGridCommon<IsGroupOpenByDefaultParams> = {
                rowNode: row,
                field: row.field!,
                key: row.key!,
                level: row.level,
                rowGroupColumn: row.rowGroupColumn!,
            };
            row.expanded = userCallback(params) == true;
        } else if (details.expandByDefault === -1) {
            row.expanded = true; // use expandByDefault if exists
        } else {
            row.expanded = row.level < details.expandByDefault;
        }
    }

    private rebuildChildrenAfterGroup(node: TreeNode): boolean {
        const { row, map } = node;
        let result = false;
        const childrenAfterGroup = (row!.childrenAfterGroup ??= []);
        const oldCount = childrenAfterGroup.length;
        let count = 0;
        if (map) {
            childrenAfterGroup.length = map.size;
            for (const child of map.values()) {
                if (childrenAfterGroup[count] !== child.row) {
                    childrenAfterGroup[count] = child.row!;
                    result = true;
                }
                ++count;
            }
        }
        if (count !== oldCount) {
            childrenAfterGroup.length = count;
            result = true;
        }

        // TODO: investigate how to do and maintain _sortRowNodesByOrder here

        return result;
    }

    private rebuildLeafChildren(node: TreeNode): boolean {
        const { row, map } = node;
        const childrenAfterGroup = row!.childrenAfterGroup!;
        const allLeafChildren = (row!.allLeafChildren ??= []);
        const oldCount = allLeafChildren!.length;
        let count = 0;
        let changed = false;
        if (map?.size) {
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
        }
        if (count !== oldCount) {
            allLeafChildren.length = count;
            changed = true;
        }
        return changed;
    }

    private recomputeRowGroupState(row: RowNode, hasChildren: boolean = !!row.childrenAfterGroup?.length) {
        const group = hasChildren || !row.data;
        if (row.group !== group) {
            row.setGroup(group); // Internally calls updateHasChildren
        } else if (row.hasChildren() !== hasChildren) {
            row.updateHasChildren();
        }
    }
}
