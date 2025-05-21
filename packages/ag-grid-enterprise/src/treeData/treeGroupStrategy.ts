import type { GroupingApproach, IChangedRowNodes, IRowGroupingStrategy, StageExecuteParams } from 'ag-grid-community';
import type { RowNode } from 'ag-grid-community';
import { BeanStub, _EmptyArray, _warn } from 'ag-grid-community';

import { setRowNodeGroup } from '../rowGrouping/rowGroupingUtils';
import type { GroupingRowNode } from '../rowHierarchy/rowHierarchyUtils';
import type { DataFieldGetter } from './fieldAccess';
import { makeFieldPathGetter } from './fieldAccess';
import type { DuplicatePathRowMap } from './treeDataUtils';
import {
    addDuplicatePathRow,
    addProcessedNodes,
    destroyFillerRow,
    getExpandedInitialValue,
    makeFillerRowId,
    newFillerRow,
    updateAllLeafChildren,
    updateRootArrays,
    updateRowArrays,
    warnDuplicatePathRows,
} from './treeDataUtils';

const FLAG_CHANGED = 0x80000000;
const FLAG_CHILDREN_CHANGED = 0x40000000;
const FLAG_EXPANDED_INITIALIZED = 0x20000000;
const FLAG_FILLER_NODE = 0x10000000;
const MASK_CHILDREN_LENGTH = 0x0fffffff; // This equates to 268,435,455 maximum children per parent, more than enough

type ParentIdGetter<TData> = DataFieldGetter<TData, string>;

const PATH_KEY_SEPARATOR = '\0\r';

export class TreeGroupStrategy<TData = any> extends BeanStub implements IRowGroupingStrategy<TData> {
    private groupColsIds: string | null = null;
    private parentIdGetter: ParentIdGetter<TData> | null = null;
    private fillerNodesById: Map<string, GroupingRowNode<TData>> | null = null;

    public override destroy(): void {
        super.destroy();
        this.groupColsIds = null;
        this.parentIdGetter = null;
        this.fillerNodesById = null!;
    }

    public reset(): void {
        this.groupColsIds = null;
        this.parentIdGetter = null;
        this.destroyFillerRows(true, false);
        this.fillerNodesById = null;
    }

    public execute(params: StageExecuteParams<TData>, approach: GroupingApproach) {
        // Instead of trying to optimize for immutable row update and transactions when a small portion of the tree changes
        // the decision here was to implement with two linear loops, first all nodes and then a tree traversal,
        // reducing allocations to the minimum possible.
        // We do not allocate new arrays for childrenAfterGroup and allLeafChildren, we just update the existing arrays.
        // This ensures a simpler code and less complexity, and also that enough speed for the vast majority of cases.
        // Consider that trying other approaches might be more complex and potentially not as fast,
        // as the user can always move an entire subtree by changing a single parentId.
        //
        // To further reduce allocations, we use treeNodeFlags to store both temporary flags,
        // the expanded initialized state and the future children count between the first loop and the tree traversal.
        // This avoid the needs to create complex data structures to store temporary data or add more fields to the row nodes.
        //
        // The property treeParent is used to store the parent node and detect updates in the tree structure during execution,
        // thus setting a treeParent and then executing a row grouping operation will work as expected, and this is used for managed drag and drop.
        // treeParent is also set by the tree data with children node manager to store the parent node during load or updates of the row data.

        const gos = this.gos;
        const { changedRowNodes, changedPath, afterColumnsChanged } = params;
        const rootNode = params.rowNode as GroupingRowNode<TData>;

        let fullReload = !changedRowNodes && !changedPath?.active;
        let rootChildrenAfterGroup = rootNode.childrenAfterGroup;
        if (!rootChildrenAfterGroup || rootChildrenAfterGroup === rootNode.allLeafChildren) {
            fullReload = true;
            rootNode.childrenAfterGroup = rootChildrenAfterGroup = [];
        }

        let groupDisplayColIdsChanged = false;
        if (afterColumnsChanged || this.groupColsIds === null) {
            groupDisplayColIdsChanged = this.updateGroupDisplayColsIds();
        }

        const hasUpdates = flagUpdatedNodes(changedRowNodes);

        const treePathApproach = approach === 'treePath';
        const renderEmpty = approach === 'treeSelfRef' && !gos.get('getRowId'); // If getRowId is not provided, we make an empty tree
        let preprocessedCount = 0;
        if (!renderEmpty) {
            if (fullReload || hasUpdates) {
                if (treePathApproach) {
                    this.loadDataPath(params);
                } else if (approach === 'treeSelfRef') {
                    this.loadSelfRef(params, fullReload);
                }
            }

            // Loop all the nodes, and put the children in the right place, updating the parent and the children arrays
            preprocessedCount = preprocessRows(params, approach);
        }

        rootChildrenAfterGroup.length = rootNode.treeNodeFlags & MASK_CHILDREN_LENGTH;
        rootNode.treeNodeFlags = 0;

        const expandByDefault = gos.get('groupDefaultExpanded');
        const activeChangedPath = changedPath?.active ? changedPath : undefined;
        const isGroupOpenByDefault = gos.getCallback('isGroupOpenByDefault');

        let traverseCount = 0;
        const traverse = (row: GroupingRowNode<TData>, level: number): boolean => {
            ++traverseCount;

            let treeNodeFlags = row.treeNodeFlags;
            const childrenAfterGroup = (row.childrenAfterGroup ??= _EmptyArray);
            const childrenAfterGroupLen = treeNodeFlags & MASK_CHILDREN_LENGTH;

            let childrenChanged = (treeNodeFlags & FLAG_CHILDREN_CHANGED) !== 0;

            if (childrenAfterGroup.length !== childrenAfterGroupLen) {
                childrenAfterGroup.length = childrenAfterGroupLen;
                childrenChanged = true;
            }

            let changed = childrenChanged || (treeNodeFlags & FLAG_CHANGED) !== 0;
            let allLeafChildrenChanged = childrenChanged;

            row.level = level++;
            row.treeNodeFlags = treeNodeFlags & FLAG_EXPANDED_INITIALIZED; // Keep only the expanded initialized flag

            let allLeafChildrenLen = 0;
            for (let j = 0; j < childrenAfterGroupLen; ++j) {
                const child = childrenAfterGroup[j];
                if (traverse(child, level)) {
                    allLeafChildrenChanged = true;
                }
                allLeafChildrenLen += child.allLeafChildren?.length ?? 0;
                if (child.data) {
                    ++allLeafChildrenLen; // If not a filler node, count it
                }
            }

            let allLeafChildren = row.allLeafChildren;
            if (allLeafChildren === childrenAfterGroup || allLeafChildren === undefined) {
                allLeafChildren = row.allLeafChildren = null;
            }
            if (allLeafChildrenChanged || (allLeafChildren?.length ?? 0) !== allLeafChildrenLen) {
                allLeafChildrenChanged = updateAllLeafChildren(row, allLeafChildren, allLeafChildrenLen);
            }

            const key = treePathApproach ? row.key! : row.id!;
            if (groupDisplayColIdsChanged || row.key !== key || !row.groupData) {
                changed = true;
                row.key = key; // TODO: improve this key change
                this.setGroupData(row, key);
            }

            const oldGroup = row.group;
            const hasChildren = childrenAfterGroupLen > 0;
            if (oldGroup !== hasChildren) {
                changed = true;
                setRowNodeGroup(row, this.beans, hasChildren); // Internally calls updateHasChildren
                if (!hasChildren && !row.expanded) {
                    treeNodeFlags = row.treeNodeFlags &= ~FLAG_EXPANDED_INITIALIZED;
                }
            } else if (row.hasChildren() !== hasChildren) {
                changed = true;
                row.updateHasChildren();
            }
            if (hasChildren && (treeNodeFlags & FLAG_EXPANDED_INITIALIZED) === 0) {
                row.treeNodeFlags |= FLAG_EXPANDED_INITIALIZED;
                row.expanded = getExpandedInitialValue(isGroupOpenByDefault, expandByDefault, row);
            }

            if (childrenChanged || allLeafChildrenChanged || fullReload) {
                updateRowArrays(row, childrenAfterGroup);
            }

            if (changed) {
                activeChangedPath?.addParentNode(row);
            }

            return allLeafChildrenChanged;
        };

        //  Traverse the tree and update the children arrays length and the allLeafChildren array and propagate updates
        for (let i = 0, len = rootChildrenAfterGroup.length; i < len; ++i) {
            traverse(rootChildrenAfterGroup[i], 0);
        }

        if (fullReload) {
            updateRootArrays(rootNode, rootChildrenAfterGroup);
        }

        if (preprocessedCount > 0 && preprocessedCount !== traverseCount) {
            // We have unprocessed nodes, this means we have at least one cycle to fix
            handleCycles(rootNode, traverse);
        }
    }

    private updateGroupDisplayColsIds(): boolean {
        const cols = this.beans.showRowGroupCols?.getShowRowGroupCols();
        const colsLen = cols?.length;
        const oldGroupColsIds = this.groupColsIds;
        let groupColsIds: string | null = oldGroupColsIds !== null ? '' : null;
        if (colsLen) {
            groupColsIds = cols[0].getId();
            for (let i = 1; i < colsLen; ++i) {
                groupColsIds += '\0';
                groupColsIds += cols[i].getId();
            }
        }
        if (oldGroupColsIds === groupColsIds) {
            return false; // No change
        }
        this.groupColsIds = groupColsIds;
        return true;
    }

    private setGroupData(row: RowNode, key: string): void {
        const groupData: Record<string, string> = {};
        row.groupData = groupData;
        const groupDisplayCols = this.beans.showRowGroupCols?.getShowRowGroupCols();
        if (groupDisplayCols) {
            for (const col of groupDisplayCols) {
                groupData[col.getColId()] = key;
            }
        }
    }

    private loadSelfRef({ rowNode, changedRowNodes }: StageExecuteParams<TData>, fullReload: boolean): void {
        const rootNode = rowNode as GroupingRowNode<TData>;
        const rootAllLeafChildren = rootNode.allLeafChildren!;
        const rowModel = this.beans.rowModel;
        const removals = changedRowNodes?.removals;

        let parentIdGetter = this.parentIdGetter;
        const parentIdField = this.gos.get('treeDataParentIdField') || null;
        if (parentIdGetter?.path !== parentIdField) {
            this.parentIdGetter = parentIdGetter = makeFieldPathGetter(parentIdField);
            fullReload = true;
        }

        for (let i = 0, len = rootAllLeafChildren.length; i < len; ++i) {
            const row = rootAllLeafChildren[i];
            if (fullReload || row.treeNodeFlags & FLAG_CHANGED || removals?.has(row.treeParent!)) {
                let newParent: GroupingRowNode<TData> | null | undefined;
                const parentId = parentIdGetter(row.data);
                if (parentId !== null && parentId !== undefined) {
                    newParent = rowModel.getRowNode(parentId) as GroupingRowNode<TData>;
                    if (!newParent) {
                        _warn(271, { id: row.id!, parentId });
                    }
                }
                row.treeParent = newParent ?? rootNode;
            } else {
                row.treeParent ??= rootNode;
            }
        }
    }

    private loadDataPath({ rowNode, changedRowNodes }: StageExecuteParams<TData>): void {
        const nodesByPath = new Map<string, GroupingRowNode<TData>>();

        const rootNode = rowNode as GroupingRowNode<TData>;
        const allLeafChildren = rootNode.allLeafChildren!;
        const allLeafChildrenLen = allLeafChildren.length;
        const paths = new Array<string[] | undefined>(allLeafChildrenLen);

        const getDataPath = this.gos.get('getDataPath');

        const fillerNodesById = (this.fillerNodesById ??= new Map<string, GroupingRowNode<TData>>());

        let duplicateRows: DuplicatePathRowMap<TData> | undefined;

        // Cache paths and detect duplicates
        for (let i = 0; i < allLeafChildrenLen; ++i) {
            const node = allLeafChildren[i];

            const path = getDataPath ? getDataPath(node.data!) : [node.id!];
            if (!path?.length) {
                _warn(185, { data: node.data }); // Empty path
                continue;
            }

            const pathKey = path.join(PATH_KEY_SEPARATOR);
            const existing = nodesByPath.get(pathKey);
            if (existing !== undefined) {
                duplicateRows = addDuplicatePathRow(duplicateRows, pathKey, existing, node);
                continue;
            }

            const key = path[path.length - 1];
            if (node.key !== key) {
                node.key = key;
                node.treeNodeFlags |= FLAG_CHANGED;
                node.groupData = null;
            }

            paths[i] = path;
            nodesByPath.set(pathKey, node);
        }

        if (duplicateRows) {
            warnDuplicatePathRows(duplicateRows);
        }

        // Build tree structure
        const beans = this.beans;
        for (let i = 0; i < allLeafChildrenLen; ++i) {
            const node = allLeafChildren[i];
            const path = paths[i];
            if (!path) {
                node.treeParent = null;
                continue;
            }

            const pathLen = path.length;
            let parent = rootNode;

            let pathKey: string = '';
            for (let level = 0; level < pathLen - 1; level++) {
                const key = String(path[level]);

                if (level > 0) {
                    pathKey += PATH_KEY_SEPARATOR;
                }
                pathKey += key;

                let current = nodesByPath.get(pathKey);
                if (current === undefined) {
                    current = fillerNodesById.get(pathKey);
                    if (current === undefined) {
                        const fillerId = makeFillerRowId(path, level);
                        current = fillerNodesById.get(fillerId);
                        if (!current) {
                            current = newFillerRow(beans, fillerId, key, parent);
                            current.treeNodeFlags = FLAG_CHANGED;
                            fillerNodesById.set(fillerId, current);
                        }
                    }
                    current.treeNodeFlags |= FLAG_FILLER_NODE;
                }

                parent = current;
            }

            node.treeParent = parent;
        }

        this.destroyFillerRows(false, !!changedRowNodes);
    }

    private destroyFillerRows(destroyAll: boolean, updated: boolean): void {
        const fillerNodesById = this.fillerNodesById;
        if (!fillerNodesById) {
            return;
        }

        let nodesToUnselect: GroupingRowNode<TData>[] | undefined;
        for (const node of fillerNodesById.values()) {
            if (destroyAll || (node.treeNodeFlags & FLAG_FILLER_NODE) === 0) {
                // This filler node is unused
                fillerNodesById.delete(node.id!);
                if (node.isSelected()) {
                    (nodesToUnselect ??= []).push(node);
                }
                destroyFillerRow(node);
            } else {
                node.treeNodeFlags &= ~FLAG_FILLER_NODE; // Reset the flag
            }
        }

        if (destroyAll || updated || nodesToUnselect) {
            this.deselectNodes(nodesToUnselect);
        }
    }

    private deselectNodes(nodes: RowNode<TData>[] | undefined): void {
        const source = 'rowDataChanged';
        const selectionSvc = this.beans.selectionSvc;
        const selectionChanged = nodes?.length;
        if (selectionChanged) {
            selectionSvc?.setNodesSelected({ newValue: false, nodes, suppressFinishActions: true, source });
        }

        // we do this regardless of nodes to unselect or not, as it's possible
        // a new node was inserted, so a parent that was previously selected (as all
        // children were selected) should not be tri-state (as new one unselected against
        // all other selected children).
        selectionSvc?.updateGroupsFromChildrenSelections?.(source);

        if (selectionChanged) {
            this.eventSvc.dispatchEvent({
                type: 'selectionChanged',
                source: source,
                selectedNodes: selectionSvc?.getSelectedNodes() ?? null,
                serverSideState: null,
            });
        }
    }
}

/** Handle cycles in a tree. Is not optimal for performance but this is an edge case that shouldn't happen. */
const handleCycles = <TData>(
    rootNode: GroupingRowNode<TData>,
    processNode: (row: GroupingRowNode<TData>, level: number) => void
) => {
    const processedNodes = new Set<GroupingRowNode<TData>>();
    addProcessedNodes(processedNodes, rootNode);
    const rootChildrenAfterGroup = rootNode.childrenAfterGroup!;
    rootChildrenAfterGroup.length = 0;
    let warned = false;
    for (const row of rootNode.allLeafChildren!) {
        if (!processedNodes.has(row)) {
            const parent = row.parent;
            warned = true;
            _warn(270, { id: row.id!, parentId: parent?.id ?? '' });
            if (parent) {
                parent.childrenAfterGroup = parent.childrenAfterGroup?.filter((x) => x !== row) ?? _EmptyArray;
                parent.treeNodeFlags = (parent.treeNodeFlags - 1) | FLAG_CHILDREN_CHANGED | FLAG_CHANGED;
            }
            row.parent = rootNode;
            processNode(row, 0);
            addProcessedNodes(processedNodes, row);
            rootChildrenAfterGroup.push(row);
        } else if (row.parent === rootNode) {
            rootChildrenAfterGroup.push(row);
        }
    }
    if (!warned) {
        _warn(270, { id: '', parentId: '' });
    }
};

const flagUpdatedNodes = <TData>(changedRowNodes: IChangedRowNodes<TData> | undefined): boolean => {
    if (!changedRowNodes) {
        return false;
    }
    const { adds, updates, removals } = changedRowNodes;
    let hasUpdates = removals.size > 0;

    if (adds.size > 0) {
        hasUpdates = true;
        for (const node of adds) {
            (node as GroupingRowNode<TData>).treeNodeFlags |= FLAG_CHANGED;
        }
    }

    if (updates.size > 0) {
        hasUpdates = true;
        for (const node of updates) {
            (node as GroupingRowNode<TData>).treeNodeFlags |= FLAG_CHANGED;
        }
    }

    return hasUpdates;
};

const preprocessRows = <TData>({ rowNode }: StageExecuteParams<TData>, approach: GroupingApproach): number => {
    const rootNode: GroupingRowNode<TData> = rowNode;
    const rootAllLeafChildren = rootNode.allLeafChildren!;
    const rootAllLeafChildrenLen = rootAllLeafChildren.length;
    const fillerNodes = approach === 'treePath';
    let count = 0;
    for (let i = 0; i < rootAllLeafChildrenLen; ++i) {
        count += preprocessRow(rootAllLeafChildren[i], fillerNodes);
    }
    return count;
};

const preprocessFillerRow = <TData>(filler: GroupingRowNode<TData> | null | undefined, changed: boolean): number => {
    if (!filler || filler.data || !filler.treeParent) {
        return 0; // Not a filler node
    }

    let treeNodeFlags = filler.treeNodeFlags;
    if (filler.data || (treeNodeFlags & FLAG_FILLER_NODE) !== 0) {
        return 0; // Already processed
    }
    if (changed) {
        treeNodeFlags |= FLAG_CHANGED;
    } else if ((treeNodeFlags & FLAG_CHANGED) !== 0) {
        changed = true;
    }
    filler.treeNodeFlags = treeNodeFlags | FLAG_FILLER_NODE; // Mark as processed
    let count = preprocessFillerRow(filler.treeParent, changed);
    count += preprocessRow(filler, true);
    return count;
};

const preprocessRow = <TData>(row: GroupingRowNode<TData>, fillerNodes: boolean): number => {
    const { parent: oldParent, treeParent: newParent } = row;

    if (newParent === null) {
        // this row is not in the tree
        row.treeNodeFlags = 0;
        row.childrenAfterGroup = _EmptyArray;
        row.allLeafChildren = null;
        if (oldParent !== null) {
            row.parent = null;
            if (oldParent !== undefined) {
                oldParent.treeNodeFlags |= FLAG_CHANGED;
            }
        }
        return 0;
    }

    let count = 1;
    if (fillerNodes && !newParent.data) {
        count += preprocessFillerRow(newParent, (row.treeNodeFlags & FLAG_CHANGED) !== 0);
    }

    let parentChildren = newParent.childrenAfterGroup;
    let parentFlags = newParent.treeNodeFlags;
    const indexInParent = parentFlags & MASK_CHILDREN_LENGTH;
    parentFlags = (parentFlags & ~MASK_CHILDREN_LENGTH) | (indexInParent + 1);

    if (!parentChildren || parentChildren === _EmptyArray) {
        newParent.childrenAfterGroup = parentChildren = [];
    }
    if (parentChildren.length <= indexInParent || parentChildren[indexInParent] !== row) {
        parentChildren[indexInParent] = row;
        parentFlags |= FLAG_CHILDREN_CHANGED;
    }
    if (oldParent !== newParent) {
        row.parent = newParent;
        parentFlags |= FLAG_CHANGED;
        if (oldParent) {
            const oldFlags = oldParent.treeNodeFlags | FLAG_CHANGED;
            if (
                fillerNodes &&
                !newParent.data &&
                (oldFlags & FLAG_EXPANDED_INITIALIZED) !== 0 &&
                (parentFlags & FLAG_EXPANDED_INITIALIZED) === 0
            ) {
                // If the parent is a new filler node, we need to copy the expanded flag that was set on the old parent
                newParent.expanded = oldParent.expanded;
                parentFlags |= FLAG_EXPANDED_INITIALIZED;
            }
            oldParent.treeNodeFlags = oldFlags;
        }
    }
    newParent.treeNodeFlags = parentFlags;

    return count;
};
