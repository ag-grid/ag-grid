import type {
    AgColumn,
    ChangedPath,
    IChangedRowNodes,
    InitialGroupOrderComparatorParams,
    IsGroupOpenByDefaultParams,
    StageExecuteParams,
    WithoutGridCommon,
} from 'ag-grid-community';
import { BeanStub, RowNode, _ROW_ID_PREFIX_ROW_GROUP, _areEqual, _getFirstLeafChild, _warn } from 'ag-grid-community';

import { _getRowDefaultExpanded } from '../../rowHierarchy/rowHierarchyUtils';
import type { IRowGroupingStrategy } from '../../rowHierarchy/rowHierarchyUtils';
import { setRowNodeGroup } from '../rowGroupingUtils';
import { BatchRemover } from './batchRemover';
import type { GroupColumn } from './groupColumns';
import { groupColumnsChanged, makeGroupColumns } from './groupColumns';
import { sortGroupChildren } from './sortGroupChildren';

interface GroupInfo {
    key: string; // e.g. 'Ireland'
    field: string | null; // e.g. 'country'
    rowGroupColumn: AgColumn | null;
    leafNode?: RowNode;
}

interface GroupingDetails {
    pivotMode: boolean;
    changedPath: ChangedPath;
    rootNode: RowNode;
    groupCols: GroupColumn[];
    groupColsChanged: boolean;
    rowNodesOrderChanged: boolean;
    groupAllowUnbalanced: boolean;
    isGroupOpenByDefault: (params: WithoutGridCommon<IsGroupOpenByDefaultParams>) => boolean;
    initialGroupOrderComparator: (params: WithoutGridCommon<InitialGroupOrderComparatorParams>) => number;
}

export class GroupStrategy extends BeanStub implements IRowGroupingStrategy {
    // when grouping, these items are of note:
    // rowNode.parent: RowNode: set to the parent
    // rowNode.childrenAfterGroup: RowNode[] = the direct children of this group
    // rowNode.childrenMapped: string=>RowNode = children mapped by group key (when groups) or an empty map if leaf group (this is then used by pivot)

    private prevGroupCols: GroupColumn[] | null = null;
    private prevShowGroupCols: GroupColumn[] | null = null;

    public getNode(id: string): RowNode | undefined {
        // only one users complained about getRowNode not working for groups, after years of
        // this working for normal rows. so have done quick implementation. if users complain
        // about performance, then GroupStrategy should store / manage created groups in a map,
        // which is a chunk of work.
        let res: RowNode | undefined = undefined;
        this.beans.rowModel.forEachNode((node) => {
            if (node.id === id) {
                res = node;
            }
        });
        return res;
    }

    public execute(params: StageExecuteParams): void {
        const details = this.createGroupingDetails(params);

        const changedRowNodes = params.changedRowNodes;
        if (changedRowNodes) {
            this.handleDeltaUpdate(details, changedRowNodes);
        } else {
            this.shotgunResetEverything(details, !!params.afterColumnsChanged);
        }

        const changedPath = params.changedPath!;

        this.positionLeafsAndGroups(changedPath);
        const comparator = details.initialGroupOrderComparator;
        if (comparator) {
            recursiveSort(details.rootNode, (nodeA, nodeB) => comparator({ nodeA, nodeB }));
        }

        this.beans.selectionSvc?.updateSelectableAfterGrouping(changedPath);
    }

    private positionLeafsAndGroups(changedPath: ChangedPath) {
        changedPath.forEachChangedNodeDepthFirst((group: RowNode) => {
            const oldChildrenAfterGroup = group.childrenAfterGroup;
            if (!oldChildrenAfterGroup?.length) {
                return;
            }
            const newChildrenAfterGroup: RowNode[] = [];
            const groupNodes: RowNode[] = [];
            let unbalancedNode: RowNode | undefined;

            for (const child of oldChildrenAfterGroup) {
                if (!child.childrenAfterGroup?.length) {
                    newChildrenAfterGroup.push(child); // Leaf
                } else if (!unbalancedNode && child.key === '') {
                    unbalancedNode = child;
                } else {
                    groupNodes.push(child);
                }
            }

            for (let i = 0, len = groupNodes.length; i < len; ++i) {
                newChildrenAfterGroup.push(groupNodes[i]);
            }

            if (unbalancedNode) {
                newChildrenAfterGroup.push(unbalancedNode);
            }

            if (!_areEqual(oldChildrenAfterGroup, newChildrenAfterGroup)) {
                group.childrenAfterGroup = newChildrenAfterGroup;
                const sibling = group.sibling;
                if (sibling) {
                    sibling.childrenAfterGroup = group.childrenAfterGroup;
                }
                // Order-only change: not calling invalidateAllLeafChildren(node);
            }
        }, false);
    }

    private createGroupingDetails(params: StageExecuteParams): GroupingDetails {
        const { rowNode, changedPath, rowNodesOrderChanged } = params;

        let groupColsChanged = false;
        const cols = this.beans.rowGroupColsSvc?.columns;
        let groupCols = this.prevGroupCols;
        if (!groupCols || groupColumnsChanged(groupCols, cols)) {
            groupColsChanged = !!groupCols;
            this.prevGroupCols = groupCols = makeGroupColumns(cols);
        }

        const details: GroupingDetails = {
            groupCols,
            rootNode: rowNode,
            pivotMode: this.beans.colModel.isPivotMode(),
            rowNodesOrderChanged: !!rowNodesOrderChanged,
            groupColsChanged,
            // if no transaction and not immutable row data set, then it's shotgun, changed path would be 'not active' at this point anyway
            changedPath: changedPath!,
            groupAllowUnbalanced: this.gos.get('groupAllowUnbalanced'),
            isGroupOpenByDefault: this.gos.getCallback('isGroupOpenByDefault') as any,
            initialGroupOrderComparator: this.gos.getCallback('initialGroupOrderComparator') as any,
        };

        return details;
    }

    private handleDeltaUpdate(details: GroupingDetails, { removals, updates, adds }: IChangedRowNodes): void {
        const batchRemover = new BatchRemover();

        if (removals.size) {
            this.removeNodes(removals, details, batchRemover);
        }

        for (const rowNode of updates) {
            this.moveNodeInWrongPath(rowNode, details, batchRemover);
        }

        const changedPath = details.changedPath;
        for (const rowNode of adds) {
            this.insertOneNode(rowNode, details);
            if (changedPath.active) {
                changedPath.addParentNode(rowNode.parent);
            }
        }

        const parentsWithChildrenRemoved = batchRemover.getAllParents();
        batchRemover.flush();
        this.removeEmptyGroups(parentsWithChildrenRemoved);

        if (details.rowNodesOrderChanged) {
            this.sortChildren(details);
        }
    }

    // this is used when doing delta updates, eg Redux, keeps nodes in right order
    private sortChildren(details: GroupingDetails): void {
        details.changedPath.forEachChangedNodeDepthFirst(
            (node) => {
                const didSort = sortGroupChildren(node.childrenAfterGroup);
                if (didSort) {
                    details.changedPath.addParentNode(node);
                    // Order-only change: not calling invalidateAllLeafChildren(node);
                }
            },
            false,
            true
        );
    }

    private getExistingPathForNode(node: RowNode, details: GroupingDetails): GroupInfo[] {
        const res: GroupInfo[] = [];

        // the node is not part of the path so we start with the parent.
        let pointer = node.parent;
        while (pointer && pointer !== details.rootNode) {
            res.push({
                key: pointer.key!,
                rowGroupColumn: pointer.rowGroupColumn,
                field: pointer.field,
            });
            pointer = pointer.parent;
        }
        res.reverse();
        return res;
    }

    private moveNodeInWrongPath(childNode: RowNode, details: GroupingDetails, batchRemover: BatchRemover): void {
        // we add node, even if parent has not changed, as the data could have
        // changed, hence aggregations will be wrong
        if (details.changedPath.active) {
            details.changedPath.addParentNode(childNode.parent);
        }

        const infoToKeyMapper = (item: GroupInfo) => item.key;
        const oldPath: string[] = this.getExistingPathForNode(childNode, details).map(infoToKeyMapper);
        const newPath: string[] = this.getGroupInfo(childNode, details).map(infoToKeyMapper);

        const nodeInCorrectPath = _areEqual(oldPath, newPath);

        if (!nodeInCorrectPath) {
            this.moveNode(childNode, details, batchRemover);
        }
    }

    private moveNode(childNode: RowNode, details: GroupingDetails, batchRemover: BatchRemover): void {
        this.removeFromParent(childNode, batchRemover, details.changedPath);
        this.insertOneNode(childNode, details);

        // hack - if we didn't do this, then renaming a tree item (ie changing rowNode.key) wouldn't get
        // refreshed into the gui.
        // this is needed to kick off the event that rowComp listens to for refresh. this in turn
        // then will get each cell in the row to refresh - which is what we need as we don't know which
        // columns will be displaying the rowNode.key info.
        childNode.setData(childNode.data);

        // we add both old and new parents to changed path, as both will need to be refreshed.
        // we already added the old parent (in calling method), so just add the new parent here
        if (details.changedPath.active) {
            const newParent = childNode.parent;
            details.changedPath.addParentNode(newParent);
        }
    }

    private removeNodes(leafRowNodes: Iterable<RowNode>, details: GroupingDetails, batchRemover: BatchRemover): void {
        const changedPath = details.changedPath;
        for (const nodeToRemove of leafRowNodes) {
            this.removeFromParent(nodeToRemove, batchRemover, changedPath);
        }
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

    private removeEmptyGroups(possibleEmptyGroups: RowNode[]): void {
        // we do this multiple times, as when we remove groups, that means the parent of just removed
        // group can then be empty. to get around this, if we remove, then we check everything again for
        // newly emptied groups. the max number of times this will execute is the depth of the group tree.
        const selectionSvc = this.beans.selectionSvc;
        let batchRemover: BatchRemover | null;
        do {
            batchRemover = null;
            for (const group of possibleEmptyGroups) {
                let pointer: RowNode | null = group;
                while (true) {
                    const rowNode = pointer;
                    pointer = pointer?.parent;
                    if (!pointer) {
                        break;
                    }
                    if (!this.groupShouldBeRemoved(rowNode)) {
                        continue;
                    }
                    batchRemover ??= new BatchRemover();
                    this.removeFromParent(rowNode, batchRemover, null);
                    // we remove selection on filler nodes here, as the selection would not be removed
                    // from the RowNodeManager, as filler nodes don't exist on the RowNodeManager
                    selectionSvc?.setNodesSelected({
                        nodes: [rowNode],
                        newValue: false,
                        source: 'rowGroupChanged',
                    });
                }
            }
            batchRemover?.flush();
        } while (batchRemover); // If we removed anything, check again for newly empty groups.
    }

    // removes the node from the parent by:
    // a) removing from childrenAfterGroup (using batchRemover if present, otherwise immediately)
    // b) removing from childrenMapped (immediately)
    // c) setRowTop(null) - as the rowRenderer uses this to know the RowNode is no longer needed
    // d) setRowIndex(null) - as the rowNode will no longer be displayed.
    private removeFromParent(child: RowNode, batchRemover: BatchRemover, changedPath: ChangedPath | null): void {
        const parent = child.parent;
        if (parent) {
            invalidateAllLeafChildren(parent);
            batchRemover.removeFromChildrenAfterGroup(parent, child);
        }
        const mapKey = this.getChildrenMappedKey(child.key!, child.rowGroupColumn);
        const childParentChildrenMapped = child.parent?.childrenMapped;
        if (childParentChildrenMapped) {
            delete childParentChildrenMapped[mapKey];
        }
        // this is important for transition, see rowComp removeFirstPassFuncs. when doing animation and
        // remove, if rowTop is still present, the rowComp thinks it's just moved position.
        child.setRowTop(null);
        child.setRowIndex(null);
        if (changedPath?.active) {
            changedPath.addParentNode(child.parent);
        }
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
            invalidateAllLeafChildren(parent);
            setRowNodeGroup(parent, this.beans, true); // calls `.updateHasChildren` internally
        }
    }

    private checkAllGroupDataAfterColsChanged(details: GroupingDetails): void {
        const recurse = (rowNodes: RowNode[] | null) => {
            if (!rowNodes) {
                return;
            }
            for (let i = 0, len = rowNodes.length; i < len; ++i) {
                const rowNode = rowNodes[i];
                if (!rowNode.group) {
                    continue;
                }
                this.setGroupData(rowNode, {
                    field: rowNode.field,
                    key: rowNode.key!,
                    rowGroupColumn: rowNode.rowGroupColumn,
                    leafNode: _getFirstLeafChild(rowNode),
                });
                recurse(rowNode.childrenAfterGroup);
            }
        };

        recurse(details.rootNode.childrenAfterGroup);
    }

    private shotgunResetEverything(details: GroupingDetails, afterColumnsChanged: boolean): void {
        if (this.noChangeInGroupingColumns(details, afterColumnsChanged)) {
            return;
        }

        // groups are about to get disposed, so need to deselect any that are selected
        this.beans.selectionSvc?.filterFromSelection?.((node) => !node.group);

        const rootNode = details.rootNode;
        // because we are not creating the root node each time, we have the logic
        // here to change leafGroup once.
        rootNode.leafGroup = details.groupCols.length === 0;

        // we are doing everything from scratch, so reset childrenAfterGroup and childrenMapped from the rootNode
        rootNode.childrenAfterGroup = [];
        rootNode.childrenMapped = {};
        rootNode.updateHasChildren();

        const sibling = rootNode.sibling;
        if (sibling) {
            sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
            sibling.childrenMapped = rootNode.childrenMapped;
        }

        this.insertNodes(rootNode._leafs!, details);
    }

    private noChangeInGroupingColumns(details: GroupingDetails, afterColumnsChanged: boolean): boolean {
        let showGroupColsChanged = false;
        const showGroupCols = this.prevShowGroupCols;
        const showCols = this.beans.showRowGroupCols!.getShowRowGroupCols();
        if (!showGroupCols || groupColumnsChanged(showGroupCols, showCols)) {
            showGroupColsChanged = !!showGroupCols;
            this.prevShowGroupCols = makeGroupColumns(showCols);
        }

        if (!afterColumnsChanged || details.groupColsChanged) {
            return false; // We need the full grouping stage
        }

        if (showGroupColsChanged) {
            // if the group display cols have changed, then we need to update rowNode.groupData
            this.checkAllGroupDataAfterColsChanged(details);
        }

        return true;
    }

    private insertNodes(newRowNodes: RowNode[], details: GroupingDetails): void {
        let activeChangedPath: ChangedPath | null = details.changedPath;
        if (!activeChangedPath.active) {
            activeChangedPath = null;
        }
        for (let i = 0, len = newRowNodes.length; i < len; ++i) {
            const rowNode = newRowNodes[i];
            this.insertOneNode(rowNode, details);
            activeChangedPath?.addParentNode(rowNode.parent);
        }
    }

    private insertOneNode(childNode: RowNode, details: GroupingDetails): void {
        const path: GroupInfo[] = this.getGroupInfo(childNode, details);
        let parentGroup: RowNode = details.rootNode;
        for (let level = 0, pathLen = path.length; level < pathLen; ++level) {
            const groupInfo = path[level];
            parentGroup = this.getOrCreateNextNode(parentGroup, groupInfo, level, details);
        }
        const oldParent = childNode.parent;
        invalidateAllLeafChildren(oldParent);
        invalidateAllLeafChildren(parentGroup);
        if (!parentGroup.group) {
            _warn(184, { parentGroupData: parentGroup.data, childNodeData: childNode.data });
        }
        childNode.parent = parentGroup;
        childNode.level = path.length;
        parentGroup.childrenAfterGroup!.push(childNode);
        parentGroup.updateHasChildren();
    }

    private getOrCreateNextNode(
        parentGroup: RowNode,
        groupInfo: GroupInfo,
        level: number,
        details: GroupingDetails
    ): RowNode {
        const key = this.getChildrenMappedKey(groupInfo.key, groupInfo.rowGroupColumn);
        const parentChildrenMapped = parentGroup?.childrenMapped;
        let nextNode = parentChildrenMapped?.[key];
        if (!nextNode) {
            nextNode = this.createGroup(groupInfo, parentGroup, level, details);
            this.addToParent(nextNode, parentGroup); // attach the new group to the parent
        }
        return nextNode;
    }

    private createGroup(groupInfo: GroupInfo, parent: RowNode, level: number, details: GroupingDetails): RowNode {
        const groupNode = new RowNode(this.beans);

        groupNode.group = true;
        groupNode.field = groupInfo.field;
        groupNode.rowGroupColumn = groupInfo.rowGroupColumn;

        this.setGroupData(groupNode, groupInfo);

        groupNode.key = groupInfo.key;
        groupNode.id = this.createGroupId(groupNode, parent, level);

        groupNode.level = level;
        groupNode.leafGroup = level === details.groupCols.length - 1;

        // why is this done here? we are not updating the children count as we go,
        // i suspect this is updated in the filter stage
        groupNode.setAllChildrenCount(0);

        groupNode.rowGroupIndex = level;

        groupNode.childrenAfterGroup = [];
        groupNode.childrenMapped = {};
        groupNode.updateHasChildren();

        groupNode.parent = parent;

        this.setExpandedInitialValue(details, groupNode);

        return groupNode;
    }

    private createGroupId(node: RowNode, parent: RowNode, level: number): string {
        const createGroupId: (node: RowNode, parent: RowNode | null, level: number) => string | null = (
            node,
            parent
        ) => {
            if (!node.rowGroupColumn) {
                return null;
            } // root node
            const parentId = parent ? createGroupId(parent, parent.parent, 0) : null;
            return `${parentId == null ? '' : parentId + '-'}${node.rowGroupColumn.getColId()}-${node.key}`;
        };

        // we put 'row-group-' before the group id, so it doesn't clash with standard row id's. we also use 't-' and 'b-'
        // for top pinned and bottom pinned rows.
        return _ROW_ID_PREFIX_ROW_GROUP + createGroupId(node, parent, level);
    }

    private setGroupData(groupNode: RowNode, groupInfo: GroupInfo): void {
        const valueSvc = this.beans.valueSvc;
        const rowGroupCol = groupInfo.rowGroupColumn;
        if (rowGroupCol && groupInfo.leafNode) {
            // for full width rows; preserve the value type
            groupNode.groupValue = valueSvc.getValue(rowGroupCol, groupInfo.leafNode);
        }

        groupNode.groupData = {};
        for (const col of this.beans.showRowGroupCols!.getShowRowGroupCols()) {
            // newGroup.rowGroupColumn=null when working off GroupInfo, and we always display the group in the group column
            // if rowGroupColumn is present, then it's grid row grouping and we only include if configuration says so

            const groupColumn = groupNode.rowGroupColumn;
            const isRowGroupDisplayed = groupColumn !== null && col.isRowGroupDisplayed(groupColumn.getId());
            if (isRowGroupDisplayed) {
                // if maintain group value type, get the value from any leaf node.
                groupNode.groupData![col.getColId()] = valueSvc.getValue(groupColumn, groupInfo.leafNode);
            }
        }
    }

    private getChildrenMappedKey(key: string, rowGroupColumn: AgColumn | null): string {
        // grouping by columns
        return rowGroupColumn ? rowGroupColumn.getId() + '-' + key : key;
    }

    private setExpandedInitialValue(details: GroupingDetails, groupNode: RowNode): void {
        // if pivoting the leaf group is never expanded as we do not show leaf rows
        if (details.pivotMode && groupNode.leafGroup) {
            groupNode.expanded = false;
            return;
        }

        groupNode.expanded = _getRowDefaultExpanded(this.beans, groupNode, groupNode.level);
    }

    private getGroupInfo(rowNode: RowNode, details: GroupingDetails): GroupInfo[] {
        const res: GroupInfo[] = [];
        const valueSvc = this.beans.valueSvc;
        for (const { col, field } of details.groupCols) {
            let key: string = valueSvc.getKeyForNode(col, rowNode);
            let keyExists = key !== null && key !== undefined && key !== '';

            // unbalanced tree and pivot mode don't work together - not because of the grid, it doesn't make
            // mathematical sense as you are building up a cube. so if pivot mode, we put in a blank key where missing.
            // this keeps the tree balanced and hence can be represented as a group.
            const createGroupForEmpty = details.pivotMode || !details.groupAllowUnbalanced;
            if (createGroupForEmpty && !keyExists) {
                key = '';
                keyExists = true;
            }

            if (keyExists) {
                res.push({
                    key,
                    field: field!,
                    rowGroupColumn: col,
                    leafNode: rowNode,
                });
            }
        }
        return res;
    }
}

const recursiveSort = (rowNode: RowNode, comparer: (nodeA: RowNode, nodeB: RowNode) => number): void => {
    const childrenAfterGroup = rowNode.childrenAfterGroup;
    if (!childrenAfterGroup || rowNode.leafGroup) {
        return; // we only want to sort groups, so we do not sort leafs (a leaf group has leafs as children)
    }
    childrenAfterGroup.sort(comparer);
    for (let i = 0, len = childrenAfterGroup.length; i < len; ++i) {
        recursiveSort(childrenAfterGroup[i], comparer);
    }
};

/** Sets rowNode._leafs to undefined on node and its parents recursively so it will be reloaded at next access. It does not touch the root node. */
const invalidateAllLeafChildren = (node: RowNode | null): void => {
    while (node?._leafs !== undefined) {
        const parent = node.parent;
        if (!parent) {
            break;
        }
        node._leafs = undefined; // Invalidate allLeafChildren cache.
        node = parent;
    }
};
