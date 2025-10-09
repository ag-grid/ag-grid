import type {
    AgColumn,
    ChangedPath,
    ChangedRowNodes,
    InitialGroupOrderComparatorParams,
    IsGroupOpenByDefaultParams,
    StageExecuteParams,
    WithoutGridCommon,
} from 'ag-grid-community';
import { RowNode } from 'ag-grid-community';
import { BeanStub, _areEqual, _removeFromArray, _warn } from 'ag-grid-community';

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
    groupAllowUnbalanced: boolean;
    isGroupOpenByDefault: (params: WithoutGridCommon<IsGroupOpenByDefaultParams>) => boolean;
    initialGroupOrderComparator: (params: WithoutGridCommon<InitialGroupOrderComparatorParams>) => number;
}

export class GroupStrategy extends BeanStub implements IRowGroupingStrategy {
    // when grouping, these items are of note:
    // rowNode.parent: RowNode: set to the parent
    // rowNode.childrenAfterGroup: RowNode[] = the direct children of this group
    // rowNode.childrenMapped: string=>RowNode = children mapped by group key (when groups) or an empty map if leaf group (this is then used by pivot)
    // for leaf groups, rowNode.childrenAfterGroup = rowNode.allLeafChildren;

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
        this.orderGroups(details);

        this.beans.selectionSvc?.updateSelectableAfterGrouping(changedPath);
    }

    private positionLeafsAndGroups(changedPath: ChangedPath) {
        changedPath.forEachChangedNodeDepthFirst((group: RowNode) => {
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
        }, false);
    }

    private createGroupingDetails(params: StageExecuteParams): GroupingDetails {
        const { rowNode, changedPath } = params;

        let groupColsChanged = false;
        const { rowGroupColsSvc, colModel, gos } = this.beans;
        const cols = rowGroupColsSvc?.columns;
        let groupCols = this.prevGroupCols;
        if (!groupCols || groupColumnsChanged(groupCols, cols)) {
            groupColsChanged = !!groupCols;
            this.prevGroupCols = groupCols = makeGroupColumns(cols);
        }

        const details: GroupingDetails = {
            groupCols,
            rootNode: rowNode,
            pivotMode: colModel.isPivotMode(),
            groupColsChanged,
            // if no transaction and not immutable row data set, then it's shotgun, changed path would be 'not active' at this point anyway
            changedPath: changedPath!,
            groupAllowUnbalanced: gos.get('groupAllowUnbalanced'),
            isGroupOpenByDefault: gos.getCallback('isGroupOpenByDefault') as any,
            initialGroupOrderComparator: gos.getCallback('initialGroupOrderComparator') as any,
        };

        return details;
    }

    private handleDeltaUpdate(details: GroupingDetails, { removals, updates, adds, reordered }: ChangedRowNodes): void {
        const batchRemover = new BatchRemover();
        const changedPath = details.changedPath;

        if (removals.size) {
            this.removeNodes(removals, changedPath, batchRemover);
        }

        for (const rowNode of updates) {
            this.moveNodeInWrongPath(rowNode, details, batchRemover);
        }

        for (const rowNode of adds) {
            this.insertOneNode(rowNode, details);
            if (changedPath.active) {
                changedPath.addParentNode(rowNode.parent);
            }
        }

        const parentsWithChildrenRemoved = batchRemover.getAllParents();
        batchRemover.flush();
        this.removeEmptyGroups(parentsWithChildrenRemoved);

        if (reordered) {
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
                }
            },
            false,
            true
        );
    }

    private orderGroups(details: GroupingDetails): void {
        const comparator = details.initialGroupOrderComparator;
        if (!comparator) {
            return;
        }
        const comparer = (nodeA: RowNode, nodeB: RowNode) => comparator({ nodeA, nodeB });
        const recursiveSort = (rowNode: RowNode): void => {
            const childrenAfterGroup = rowNode.childrenAfterGroup;
            const childrenAfterGroupLen = childrenAfterGroup?.length;
            if (!childrenAfterGroupLen) {
                return;
            }
            if (!rowNode.leafGroup) {
                return; // we only want to sort groups, so we do not sort leafs (a leaf group has leafs as children)
            }
            childrenAfterGroup.sort(comparer);
            for (let i = 0, len = childrenAfterGroup.length; i < len; ++i) {
                recursiveSort(childrenAfterGroup[i]);
            }
        };
        recursiveSort(details.rootNode);
    }

    private getExistingPathForNode(node: RowNode): GroupInfo[] {
        const res: GroupInfo[] = [];
        let pointer = node.parent; // the node is not part of the path so we start with the parent, and we exclude the root
        while (pointer) {
            const parent = pointer.parent;
            if (parent) {
                res.push({ key: pointer.key!, rowGroupColumn: pointer.rowGroupColumn, field: pointer.field });
            }
            pointer = parent;
        }
        res.reverse();
        return res;
    }

    private moveNodeInWrongPath(
        childNode: RowNode,
        details: GroupingDetails,
        batchRemover: BatchRemover | undefined
    ): void {
        // we add node, even if parent has not changed, as the data could have
        // changed, hence aggregations will be wrong
        if (details.changedPath.active) {
            details.changedPath.addParentNode(childNode.parent);
        }

        const infoToKeyMapper = (item: GroupInfo) => item.key;
        const oldPath: string[] = this.getExistingPathForNode(childNode).map(infoToKeyMapper);
        const newPath: string[] = this.getGroupInfo(childNode, details).map(infoToKeyMapper);

        const nodeInCorrectPath = _areEqual(oldPath, newPath);

        if (!nodeInCorrectPath) {
            this.moveNode(childNode, details, batchRemover);
        }
    }

    private moveNode(childNode: RowNode, details: GroupingDetails, batchRemover: BatchRemover | undefined): void {
        this.removeNodesFromParents([childNode], batchRemover);
        this.insertOneNode(childNode, details, batchRemover);

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

    private removeNodes(
        leafRowNodes: Iterable<RowNode>,
        changedPath: ChangedPath,
        batchRemover: BatchRemover | undefined
    ): void {
        this.removeNodesFromParents(leafRowNodes, batchRemover);
        if (changedPath.active) {
            for (const rowNode of leafRowNodes) {
                changedPath.addParentNode(rowNode.parent);
            }
        }
    }

    private removeNodesFromParents(nodesToRemove: Iterable<RowNode>, provided: BatchRemover | undefined): void {
        // this method can be called with BatchRemover as optional. if it is missed, we created a local version
        // and flush it at the end. if one is provided, we add to the provided one and it gets flushed elsewhere.
        const batchRemoverIsLocal = provided == null;
        const batchRemoverToUse = provided ? provided : new BatchRemover();

        for (const nodeToRemove of nodesToRemove) {
            this.removeFromParent(nodeToRemove, batchRemoverToUse);

            // remove from allLeafChildren. we clear down all parents EXCEPT the Root Node, as
            // the ClientSideNodeManager is responsible for the Root Node.
            let pointer: RowNode | null = nodeToRemove.parent;
            while (pointer) {
                const parent = pointer.parent;
                if (!parent) {
                    break; // root node
                }
                batchRemoverToUse.removeFromAllLeafChildren(pointer, nodeToRemove);
                pointer = parent;
            }
        }

        if (batchRemoverIsLocal) {
            batchRemoverToUse.flush();
        }
    }

    private removeEmptyGroups(possibleEmptyGroups: RowNode[]): void {
        const groupShouldBeRemoved = (rowNode: RowNode): boolean => {
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
        };

        // we do this multiple times, as when we remove groups, that means the parent of just removed
        // group can then be empty. to get around this, if we remove, then we check everything again for
        // newly emptied groups. the max number of times this will execute is the depth of the group tree.
        let batchRemover: BatchRemover | null;
        const selectionSvc = this.beans.selectionSvc;
        do {
            batchRemover = null;
            for (let idx = 0; idx < possibleEmptyGroups.length; ++idx) {
                let pointer = possibleEmptyGroups[idx];
                while (pointer) {
                    const parent: RowNode | null = pointer.parent;
                    if (!parent) {
                        break; // root node
                    }
                    if (!groupShouldBeRemoved(pointer)) {
                        pointer = parent;
                        continue;
                    }

                    batchRemover ??= new BatchRemover();
                    this.removeFromParent(pointer, batchRemover);
                    // we remove selection on filler nodes here, as the selection would not be removed
                    // from the RowNodeManager, as filler nodes don't exist on the RowNodeManager
                    selectionSvc?.setNodesSelected({
                        nodes: [pointer],
                        newValue: false,
                        source: 'rowGroupChanged',
                    });

                    possibleEmptyGroups[idx] = parent; // check parent next
                    pointer = parent;
                }
            }
            batchRemover?.flush();
        } while (batchRemover);
    }

    // removes the node from the parent by:
    // a) removing from childrenAfterGroup (using batchRemover if present, otherwise immediately)
    // b) removing from childrenMapped (immediately)
    // c) setRowTop(null) - as the rowRenderer uses this to know the RowNode is no longer needed
    // d) setRowIndex(null) - as the rowNode will no longer be displayed.
    private removeFromParent(child: RowNode, batchRemover?: BatchRemover) {
        if (child.parent) {
            if (batchRemover) {
                batchRemover.removeFromChildrenAfterGroup(child.parent, child);
            } else {
                _removeFromArray(child.parent.childrenAfterGroup!, child);
                child.parent.updateHasChildren();
            }
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
    }

    /**
     * This is idempotent, but relies on the `key` field being the same throughout a RowNode's lifetime
     */
    private addToParent(child: RowNode, parent: RowNode) {
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
        }
    }

    private checkAllGroupDataAfterColsChanged(details: GroupingDetails): void {
        const recurse = (rowNodes: RowNode[] | null) => {
            if (!rowNodes) {
                return;
            }
            for (let i = 0, len = rowNodes.length; i < len; ++i) {
                const rowNode = rowNodes[i];
                const isLeafNode = !rowNode.group;
                if (isLeafNode) {
                    continue;
                }
                const groupInfo: GroupInfo = {
                    field: rowNode.field,
                    key: rowNode.key!,
                    rowGroupColumn: rowNode.rowGroupColumn,
                    leafNode: rowNode.allLeafChildren?.[0],
                };
                this.setGroupData(rowNode, groupInfo);
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

        const rootNode: RowNode = details.rootNode;
        // because we are not creating the root node each time, we have the logic
        // here to change leafGroup once.
        rootNode.leafGroup = details.groupCols.length === 0;

        // we are doing everything from scratch, so reset childrenAfterGroup and childrenMapped from the rootNode
        rootNode.childrenAfterGroup = [];
        rootNode.childrenMapped = {};
        rootNode.updateHasChildren();

        const sibling: RowNode = rootNode.sibling;
        if (sibling) {
            sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
            sibling.childrenMapped = rootNode.childrenMapped;
        }

        this.insertNodes(rootNode.allLeafChildren!, details);
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

    private insertOneNode(childNode: RowNode, details: GroupingDetails, batchRemover?: BatchRemover): void {
        const path: GroupInfo[] = this.getGroupInfo(childNode, details);

        const parentGroup = this.findParentForNode(childNode, path, details, batchRemover);

        if (!parentGroup.group) {
            _warn(184, { parentGroupData: parentGroup.data, childNodeData: childNode.data });
        }
        childNode.parent = parentGroup;
        childNode.level = path.length;
        parentGroup.childrenAfterGroup!.push(childNode);
        parentGroup.updateHasChildren();
    }

    private findParentForNode(
        childNode: RowNode,
        path: GroupInfo[],
        details: GroupingDetails,
        batchRemover?: BatchRemover
    ): RowNode {
        let nextNode: RowNode = details.rootNode;

        for (let level = 0, len = path.length; level < len; ++level) {
            nextNode = this.getOrCreateNextNode(nextNode, path[level], level, details);
            // node gets added to all group nodes.
            // note: we do not add to rootNode here, as the rootNode is the master list of rowNodes

            if (!batchRemover?.isRemoveFromAllLeafChildren(nextNode, childNode)) {
                nextNode.allLeafChildren!.push(childNode);
            } else {
                // if this node is about to be removed, prevent that
                batchRemover?.preventRemoveFromAllLeafChildren(nextNode, childNode);
            }
        }

        return nextNode;
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
            // attach the new group to the parent
            this.addToParent(nextNode, parentGroup);
        }

        return nextNode;
    }

    private createGroup(groupInfo: GroupInfo, parent: RowNode, level: number, details: GroupingDetails): RowNode {
        const groupNode: RowNode = new RowNode(this.beans);

        groupNode.group = true;
        groupNode.field = groupInfo.field;
        groupNode.rowGroupColumn = groupInfo.rowGroupColumn;

        this.setGroupData(groupNode, groupInfo);

        groupNode.key = groupInfo.key;
        groupNode.id = this.createGroupId(groupNode, parent);

        groupNode.level = level;
        groupNode.leafGroup = level === details.groupCols.length - 1;

        groupNode.allLeafChildren = [];

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

    private createGroupId(node: RowNode, parent: RowNode | null): string {
        let parts = '';
        let rowGroupColumn = node.rowGroupColumn;
        while (parent && rowGroupColumn) {
            const key = node.key;
            parts = '-' + rowGroupColumn.getColId() + '-' + key + parts;
            node = parent;
            rowGroupColumn = node.rowGroupColumn;
            parent = node.parent;
        }
        return 'row-group' + (parts || '-null');
    }

    private setGroupData(groupNode: RowNode, groupInfo: GroupInfo): void {
        const rowGroupCol = groupInfo.rowGroupColumn;
        const { valueSvc, showRowGroupCols } = this.beans;
        if (rowGroupCol && groupInfo.leafNode) {
            // for full width rows; preserve the value type
            groupNode.groupValue = valueSvc.getValue(rowGroupCol, groupInfo.leafNode);
        }

        groupNode.groupData = {};
        const groupDisplayCols = showRowGroupCols!.getShowRowGroupCols();
        for (const col of groupDisplayCols) {
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
                const item: GroupInfo = { key, field: field!, rowGroupColumn: col, leafNode: rowNode };
                res.push(item);
            }
        }
        return res;
    }
}
