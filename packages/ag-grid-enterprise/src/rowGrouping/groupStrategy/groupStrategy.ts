import type {
    AgColumn,
    BeanCollection,
    ChangedPath,
    ColumnModel,
    IClientSideRowModel,
    IRowGroupColsService,
    IRowNode,
    ISelectionService,
    IShowRowGroupColsService,
    InitialGroupOrderComparator,
    RefreshModelParams,
    ValueService,
    _ChangedRowNodes,
} from 'ag-grid-community';
import { BeanStub, RowNode, _csrmFirstLeaf, _forEachChangedGroupDepthFirst } from 'ag-grid-community';

import type { IRowGroupingStrategy } from '../../rowHierarchy/rowHierarchyUtils';
import { setRowNodeGroup } from '../rowGroupingUtils';
import type { GroupColumn } from './groupColumns';
import { groupColumnsChanged, makeGroupColumns } from './groupColumns';
import { sortGroupChildren } from './sortGroupChildren';

export class GroupStrategy extends BeanStub implements IRowGroupingStrategy {
    // when grouping, these items are of note:
    // rowNode.parent: RowNode: set to the parent
    // rowNode.childrenAfterGroup: RowNode[] = the direct children of this group
    // rowNode.childrenMapped: string=>RowNode = children mapped by group key (when groups) or an empty map if leaf group (this is then used by pivot)
    // for leaf groups, rowNode.childrenAfterGroup = rowNode.allLeafChildren;

    private readonly groupCols: GroupColumn[] = [];
    public readonly nonLeafsById = new Map<string, RowNode>();

    private pivotMode: boolean = false;
    private groupEmpty: boolean = false;

    private colModel: ColumnModel;
    private rowModel: IClientSideRowModel;
    private checkGroupCols: boolean = true;
    private valueSvc: ValueService;
    private selectionSvc: ISelectionService | undefined;
    private showRowGroupCols: IShowRowGroupColsService | undefined;
    private rowGroupColsSvc: IRowGroupColsService | undefined;

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
        this.rowModel = beans.rowModel as IClientSideRowModel;
        this.valueSvc = beans.valueSvc;
        this.selectionSvc = beans.selectionSvc;
        this.showRowGroupCols = beans.showRowGroupCols;
        this.rowGroupColsSvc = beans.rowGroupColsSvc;
    }

    public invalidateGroupCols(): void {
        this.checkGroupCols = true;
    }

    public override destroy(): void {
        super.destroy();
        this.groupCols.length = 0;
        this.nonLeafsById.clear();
    }

    public clearNonLeafs(): void {
        const nonLeafsById = this.nonLeafsById;
        for (const node of nonLeafsById.values()) {
            node._destroy(null);
        }
        nonLeafsById.clear();
    }

    public loadGroupData(node: RowNode): Record<string, any> | null {
        if (!node.group) {
            node._groupData = null;
            return null;
        }

        const rowGroupCol = node.rowGroupColumn;
        const { valueSvc, showRowGroupCols } = this;

        const groupData: Record<string, any> = {};
        node._groupData = groupData;

        if (!rowGroupCol) {
            return groupData;
        }

        const leafNode = _csrmFirstLeaf(node);
        const rowGroupColId = rowGroupCol.getId();
        if (!showRowGroupCols) {
            return groupData;
        }
        const groupDisplayCols = showRowGroupCols.columns;
        for (let i = 0, len = groupDisplayCols.length; i < len; ++i) {
            const col = groupDisplayCols[i];
            // group nodes created without a rowGroupColumn still display in the group column
            // if rowGroupColumn is present, then it's grid row grouping and we only include if configuration says so
            if (col.isRowGroupDisplayed(rowGroupColId)) {
                // if maintain group value type, get the value from any leaf node.
                groupData[col.colId] = leafNode && valueSvc.getValueFromData(rowGroupCol, leafNode);
            }
        }

        return groupData;
    }

    public execute(rootNode: RowNode, params: RefreshModelParams): void {
        const changedPath = params.changedPath!;
        const refreshResult = this.initRefresh(params);
        if (refreshResult !== 'skip') {
            const changedRowNodes = params.changedRowNodes;
            if (changedRowNodes) {
                this.handleDeltaUpdate(rootNode, changedPath, changedRowNodes, !!params.animate);
            } else {
                this.shotgunResetEverything(rootNode);
            }
        }

        this.positionLeafsAndGroups(rootNode, changedPath);
        this.orderGroups(rootNode);
    }

    private positionLeafsAndGroups(rootNode: RowNode, changedPath: ChangedPath | undefined) {
        _forEachChangedGroupDepthFirst(rootNode, true, changedPath, (group: RowNode) => {
            const children = group.childrenAfterGroup;
            const childrenLen = children?.length;
            if (!childrenLen) {
                return;
            }
            const newChildren = new Array<RowNode>(childrenLen); // preallocate
            let writeIdx = 0;
            let changed = false;
            let unbalancedNode: RowNode | undefined;
            for (let readIdx = 0; readIdx < childrenLen; ++readIdx) {
                const node = children[readIdx];
                if (!node.childrenAfterGroup?.length) {
                    changed ||= writeIdx !== readIdx;
                    newChildren[writeIdx++] = node; // append the leaf nodes
                } else if (!unbalancedNode && node.key === '') {
                    unbalancedNode = node;
                    const last = childrenLen - 1;
                    changed ||= readIdx !== last;
                    newChildren[last] = node; // first unbalanced at the end
                }
            }
            if (changed) {
                for (let readIdx = 0; readIdx < childrenLen; ++readIdx) {
                    const node = children[readIdx];
                    if (node.childrenAfterGroup?.length && node !== unbalancedNode) {
                        newChildren[writeIdx++] = node; // append the group nodes
                    }
                }
                group.childrenAfterGroup = newChildren;
                const sibling = group.sibling;
                if (sibling) {
                    sibling.childrenAfterGroup = newChildren;
                }
            }
        });
    }

    private initRefresh(params: RefreshModelParams): 'skip' | 'refresh' | 'groupColsChanged' {
        const { rowGroupColsSvc, colModel, gos } = this;

        this.pivotMode = colModel.pivotMode;
        this.groupEmpty = this.pivotMode || !gos.get('groupAllowUnbalanced');
        const cols = rowGroupColsSvc?.columns;
        const groupCols = this.groupCols;
        const afterColumnsChanged = params.afterColumnsChanged;
        if (afterColumnsChanged || !groupCols || this.checkGroupCols) {
            this.checkGroupCols = false;
            if (groupCols && !groupColumnsChanged(groupCols, cols)) {
                if (afterColumnsChanged) {
                    return 'skip'; // no change to grouping
                }
            } else {
                params.animate = false;
                // If the top-level group column changed, every existing node ID will differ after
                // rebuild, so no group nodes can be reused. Check before makeGroupColumns overwrites groupCols.
                const topLevelChanged = groupCols[0]?.col.getId() !== cols?.[0]?.getId();
                makeGroupColumns(cols, groupCols);
                return topLevelChanged ? 'refresh' : 'groupColsChanged';
            }
        }

        return 'refresh';
    }

    private handleDeltaUpdate(
        rootNode: RowNode,
        changedPath: ChangedPath | undefined,
        { removals, updates, adds, reordered }: _ChangedRowNodes,
        animate: boolean
    ): void {
        const parentsWithRemovals = new Set<RowNode | null>();

        for (let i = 0, len = removals.length; i < len; ++i) {
            const rowNode = removals[i];
            const oldParent = this.removeFromParent(rowNode);
            if (!parentsWithRemovals.has(oldParent)) {
                parentsWithRemovals.add(oldParent);
                changedPath?.addRow(oldParent);
            }
        }

        for (const rowNode of updates) {
            const oldParent = rowNode.parent;
            // we add even if parent has not changed, as the data could have changed, or aggregations will be wrong
            changedPath?.addRow(oldParent);

            if (this.moveNodeInWrongPath(rootNode, rowNode)) {
                parentsWithRemovals.add(oldParent);
                const newParent = rowNode.parent;
                changedPath?.addRow(newParent);

                reordered ||= (newParent?.childrenAfterGroup?.length ?? 0) > 1; // Order may be wrong after move
            }
        }

        if (adds.size) {
            for (const rowNode of adds) {
                this.insertOneNode(rootNode, rowNode);
                const newParent = rowNode.parent;
                changedPath?.addRow(newParent);

                reordered ||= (newParent?.childrenAfterGroup?.length ?? 0) > 1; // Order may be wrong after add
            }
        }

        if (parentsWithRemovals.size) {
            batchedRemove(parentsWithRemovals);
            this.removeEmptyGroups(parentsWithRemovals, animate);
        }

        if (reordered) {
            this.sortChildren(rootNode, changedPath);
        }
    }

    // this is used when doing delta updates, eg Redux, keeps nodes in right order
    private sortChildren(rootNode: RowNode, changedPath: ChangedPath | undefined): void {
        _forEachChangedGroupDepthFirst(rootNode, true, undefined, (node) => {
            const didSort = sortGroupChildren(node.childrenAfterGroup);
            if (didSort) {
                changedPath?.addRow(node);
            }
        });
    }

    private orderGroups(rootNode: RowNode): void {
        const initialGroupOrderComparator: InitialGroupOrderComparator | undefined =
            this.gos.getCallback('initialGroupOrderComparator');
        if (!initialGroupOrderComparator) {
            return;
        }
        const beans = this.beans;
        const api = beans.gridApi;
        const context = beans.gridOptions.context;
        const comparer = (nodeA: IRowNode, nodeB: IRowNode) =>
            initialGroupOrderComparator({ api, context, nodeA, nodeB });
        const recursiveSort = (rowNode: IRowNode): void => {
            const childrenAfterGroup = rowNode.childrenAfterGroup;
            const childrenAfterGroupLen = childrenAfterGroup?.length;
            if (!childrenAfterGroupLen || rowNode.leafGroup) {
                return; // we only want to sort groups, so we do not sort leafs (a leaf group has leafs as children)
            }
            if (childrenAfterGroupLen > 1) {
                childrenAfterGroup.sort(comparer);
            }
            for (let i = 0, len = childrenAfterGroupLen; i < len; ++i) {
                recursiveSort(childrenAfterGroup[i]);
            }
        };
        recursiveSort(rootNode);
    }

    private moveNodeInWrongPath(rootNode: RowNode, childNode: RowNode): boolean {
        const { valueSvc } = this.beans;
        const createGroupForEmpty = this.groupEmpty;

        let ancestor: RowNode | null = childNode.parent;
        let changed = false;

        const groupCols = this.groupCols;
        if (!groupCols) {
            return false;
        }
        for (let idx = groupCols.length - 1; idx >= 0; --idx) {
            const { col } = groupCols[idx];
            let key = valueSvc.getKeyForNode(col, childNode);
            if (key == null || key === '') {
                if (!createGroupForEmpty) {
                    continue; // skip columns with empty keys when unbalanced trees are allowed
                }
                key = '';
            }
            if (!ancestor?.parent || ancestor.key !== key) {
                changed = true;
                break;
            }
            ancestor = ancestor.parent;
        }

        changed ||= !!ancestor?.parent; // if we have not exhausted ancestors, then path is wrong

        if (!changed) {
            return false;
        }

        // trigger a full refresh so any columns showing the group key update immediately
        this.removeFromParent(childNode);
        this.insertOneNode(rootNode, childNode);

        // hack - if we didn't do this, then renaming a tree item (ie changing rowNode.key) wouldn't get
        // refreshed into the gui.
        // this is needed to kick off the event that rowComp listens to for refresh. this in turn
        // then will get each cell in the row to refresh - which is what we need as we don't know which
        // columns will be displaying the rowNode.key info.
        childNode.setData(childNode.data);

        return true;
    }

    private groupShouldBeRemoved(rowNode: RowNode): boolean {
        // because of the while loop below, it's possible we already moved the node,
        // so double check before trying to remove again.
        const mapKey = this.getChildrenMappedKey(rowNode.key!, rowNode.rowGroupColumn);
        const parentChildrenMapped = rowNode.parent?.childrenMapped;
        const groupAlreadyRemoved = parentChildrenMapped ? !parentChildrenMapped[mapKey] : true;

        if (groupAlreadyRemoved) {
            // if not linked, then group was already removed
            return false;
        }
        // if still not removed, then we remove if this group is empty
        return !!rowNode.group && (rowNode.childrenAfterGroup?.length ?? 0) === 0;
    }

    private removeEmptyGroups(parents: Set<RowNode | null>, animate: boolean): void {
        // we do this multiple times, as when we remove groups, that means the parent of just removed
        // group can then be empty. to get around this, if we remove, then we check everything again for
        // newly emptied groups. the max number of times this will execute is the depth of the group tree.
        const selectionSvc = this.selectionSvc;
        const possibleEmptyGroups = Array.from(parents);
        const groupsById = this.nonLeafsById;
        do {
            parents.clear();
            for (let idx = 0; idx < possibleEmptyGroups.length; ++idx) {
                let pointer = possibleEmptyGroups[idx];
                while (pointer) {
                    const parent: RowNode | null = pointer.parent;
                    if (pointer.destroyed) {
                        possibleEmptyGroups[idx] = parent;
                        pointer = parent;
                        continue;
                    }
                    if (!parent) {
                        break; // root node
                    }
                    if (!this.groupShouldBeRemoved(pointer)) {
                        pointer = parent;
                        continue;
                    }
                    parents.add(parent);
                    this.removeFromParent(pointer);
                    // filler nodes don't exist on the RowNodeManager, so their selection isn't
                    // cleaned up elsewhere — drop it as we destroy them.
                    if (pointer.isSelected()) {
                        selectionSvc?.removeFromSelection?.(pointer, 'rowGroupChanged');
                    }
                    possibleEmptyGroups[idx] = parent;
                    groupsById.delete(pointer.id!);
                    pointer._destroy(animate);
                    pointer = parent;
                }
            }
            batchedRemove(parents);
        } while (parents.size);
    }

    // removes the node from the parent by:
    // a) removing from childrenAfterGroup (using batchRemover if present, otherwise immediately)
    // b) removing from childrenMapped (immediately)
    // c) setRowTop(null) - as the rowRenderer uses this to know the RowNode is no longer needed
    // d) setRowIndex(null) - as the rowNode will no longer be displayed.
    private removeFromParent(child: RowNode): RowNode | null {
        const oldParent = child.parent;
        if (oldParent) {
            const mapKey = this.getChildrenMappedKey(child.key!, child.rowGroupColumn);
            const childParentChildrenMapped = oldParent.childrenMapped;
            if (childParentChildrenMapped) {
                delete childParentChildrenMapped[mapKey];
            }
        }
        // this is important for transition, see rowComp removeFirstPassFuncs. when doing animation and
        // remove, if rowTop is still present, the rowComp thinks it's just moved position.
        child.setRowTop(null);
        child.setRowIndex(null);
        return oldParent;
    }

    /**
     * This is idempotent, but relies on the `key` field being the same throughout a RowNode's lifetime
     */
    private addToParent(child: RowNode, parent: RowNode): void {
        const childrenMapped = (parent.childrenMapped ??= {});
        const mapKey = this.getChildrenMappedKey(child.key!, child.rowGroupColumn);
        if (childrenMapped[mapKey] !== child) {
            childrenMapped[mapKey] = child;
            let childrenAfterGroup = parent.childrenAfterGroup;
            if (!childrenAfterGroup) {
                parent.childrenAfterGroup = childrenAfterGroup = [];
                const sibling = parent.sibling;
                if (sibling) {
                    sibling.childrenAfterGroup = parent.childrenAfterGroup;
                }
            }

            childrenAfterGroup.push(child);
            setRowNodeGroup(parent, this.beans, true); // calls `.updateHasChildren` internally
            invalidateAllLeafChildren(parent);
        }
    }

    private shotgunResetEverything(rootNode: RowNode): void {
        const groupsById = this.nonLeafsById;

        // Mark all existing group nodes as stale by nulling childrenAfterGroup.
        // Nodes that are reused during insertion will have childrenAfterGroup reset to [].
        // Nodes still null after insertion are stale and will be destroyed.
        for (const node of groupsById.values()) {
            node.childrenAfterGroup = null;
            node.childrenMapped = null;
        }

        // because we are not creating the root node each time, we have the logic
        // here to change leafGroup once.
        rootNode.leafGroup = !this.groupCols?.length;

        // we are doing everything from scratch, so reset childrenAfterGroup and childrenMapped from the rootNode
        rootNode.childrenAfterGroup = [];
        rootNode.childrenMapped = {};
        rootNode.updateHasChildren();

        const sibling: RowNode = rootNode.sibling;
        if (sibling) {
            sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
            sibling.childrenMapped = rootNode.childrenMapped;
        }

        const allLeafs = rootNode._leafs!;
        for (let i = 0, len = allLeafs.length; i < len; ++i) {
            this.insertOneNode(rootNode, allLeafs[i]);
        }

        // Destroy stale group nodes that were not reused during insertion
        this.destroyStaleGroups(groupsById);
    }

    /** Remove and destroy group nodes that were not reused (still have childrenAfterGroup === null) */
    private destroyStaleGroups(groupsById: Map<string, RowNode>): void {
        const selectionSvc = this.selectionSvc;
        for (const [id, node] of groupsById) {
            if (node.childrenAfterGroup !== null) {
                continue;
            }
            if (node.isSelected()) {
                selectionSvc?.removeFromSelection?.(node, 'rowGroupChanged');
            }
            groupsById.delete(id);
            node._destroy(false);
        }
    }

    private insertOneNode(rootNode: RowNode, childNode: RowNode): void {
        let parentGroup = rootNode;
        const { valueSvc, groupCols, groupEmpty } = this;
        if (!groupCols) {
            return;
        }
        const len = groupCols.length;
        for (let i = 0; i < len; ++i) {
            const groupCol = groupCols[i];
            const col = groupCol.col;
            let key = valueSvc.getKeyForNode(col, childNode);
            if (key == null || key === '') {
                if (!groupEmpty) {
                    continue;
                }
                key = '';
            }
            const existingGroup = parentGroup.childrenMapped?.[this.getChildrenMappedKey(key, col)];
            if (existingGroup) {
                parentGroup = existingGroup;
                continue;
            }
            const nextLevel = parentGroup.level + 1;
            const isLeafLevel = nextLevel >= len - 1;
            const newGroup = this.createGroup(parentGroup, groupCol, key, nextLevel, isLeafLevel, childNode);
            this.addToParent(newGroup, parentGroup);

            parentGroup = newGroup;
        }
        if (!parentGroup.group) {
            this.warn(184, { parentGroupData: parentGroup.data, childNodeData: childNode.data });
        }
        childNode.parent = parentGroup;
        childNode.level = parentGroup.level + 1;
        parentGroup.childrenAfterGroup!.push(childNode);
        parentGroup.updateHasChildren();
        invalidateAllLeafChildren(parentGroup);
    }

    private createGroup(
        parent: RowNode,
        groupCol: GroupColumn,
        key: string,
        level: number,
        isLeafLevel: boolean,
        leafNode: RowNode
    ): RowNode {
        const col = groupCol.col;
        const id = (parent.level >= 0 ? parent.id! + '-' : 'row-group-') + (col.colId + '-' + key);

        const groupsById = this.nonLeafsById;
        let node = groupsById.get(id);
        let singleUse = true;

        if (node) {
            if (node.childrenAfterGroup !== null) {
                // Already active — just ensure lazy expansion state.
                node._expanded ??= null;
                return node;
            }
            singleUse = false;
            // Reused existing group node from a shotgun reset.
            // Reset children but preserve selection and expansion state.
            invalidateAllLeafChildren(node);
        } else {
            // Brand new group node.
            node = new RowNode(this.beans);
            node.group = true;
            node.key = key;
            node.id = id;
            node.aggData = null;
            groupsById.set(id, node);
        }

        const applyValuesToNode = (n: RowNode) => {
            n.childrenAfterGroup = children;
            n.childrenMapped = mapped;
            n.parent = parent;
            n.level = level;
            n.rowGroupIndex = level;
            n.leafGroup = isLeafLevel;
        };

        // Shared setup for both reused and new nodes.
        const children: RowNode[] = [];
        const mapped = {};
        applyValuesToNode(node);
        node.field = groupCol.field ?? null;
        node.rowGroupColumn = col;
        node.groupValue = this.valueSvc.getValueFromData(col, leafNode);
        // null triggers lazy default resolution in the expanded getter.
        node._expanded ??= null;

        if (singleUse) {
            node.setAllChildrenCount(0);
            node.updateHasChildren();
            return node;
        }

        const sibling = node.sibling;
        if (sibling) {
            applyValuesToNode(sibling);
        }

        node.dispatchRowEvent('hasChildrenChanged');

        return node;
    }

    private getChildrenMappedKey(key: string, rowGroupColumn: AgColumn | null): string {
        // grouping by columns
        return rowGroupColumn ? rowGroupColumn.getId() + '-' + key : key;
    }

    public onShowRowGroupColsSetChanged(): void {
        const { rowModel, valueSvc } = this;
        for (const groupNode of this.nonLeafsById.values()) {
            groupNode._groupData = undefined;
            const rowGroupColumn = groupNode.rowGroupColumn;
            const leafNode = rowGroupColumn && _csrmFirstLeaf(groupNode);
            groupNode.groupValue = leafNode && valueSvc.getValueFromData(rowGroupColumn, leafNode);
        }

        const allLeafs = rowModel.rootNode?._leafs;
        if (allLeafs) {
            for (let i = 0, len = allLeafs.length; i < len; ++i) {
                const leafNode = allLeafs[i];
                leafNode.parent!._groupData = undefined;
            }
        }
    }
}

/**
 * Filters in place all moved or removed nodes from childrenAfterGroup of a list of parents and invalidates allLeafChildren if needed.
 *
 * Doing large deletes (1000 rows) with _removeFromArray() is a bottleneck, as the complexity would be O(n**2)
 * to get around this, we do all the removes in a batch. this class manages the batch.
 * This problem was brought to light by a client (AG-2879), with dataset of 20,000
 */
const batchedRemove = (parents: Iterable<RowNode | null>): void => {
    for (const parent of parents) {
        const childrenAfterGroup = parent?.childrenAfterGroup;
        if (!childrenAfterGroup) {
            continue; // no children, so no change
        }
        const childrenAfterGroupLen = childrenAfterGroup.length;
        let writeIdx = 0;
        for (let readIdx = 0; readIdx < childrenAfterGroupLen; ++readIdx) {
            const item = childrenAfterGroup[readIdx];
            if (item.parent === parent && !item.destroyed) {
                if (writeIdx !== readIdx) {
                    childrenAfterGroup[writeIdx] = item; // Keep the child
                }
                ++writeIdx;
            }
        }
        if (childrenAfterGroupLen !== writeIdx) {
            childrenAfterGroup.length = writeIdx;
            parent.updateHasChildren();
            invalidateAllLeafChildren(parent);
        }
    }
};

/** Sets rowNode._leafs to undefined on node and its parents recursively so it will be reloaded at next access. Root is not touched. */
const invalidateAllLeafChildren = (node: RowNode): void => {
    while (node._leafs !== undefined) {
        const parent = node.parent;
        if (!parent) {
            break; // Don't touch the root node.
        }
        node._leafs = undefined; // Invalidate allLeafChildren cache.
        node = parent;
    }
};
