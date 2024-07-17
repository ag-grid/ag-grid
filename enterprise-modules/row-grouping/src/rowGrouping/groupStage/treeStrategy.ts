import type {
    AgColumn,
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
import {
    BeanStub,
    RowNode,
    _areEqual,
    _existsAndNotEmpty,
    _last,
    _removeFromArray,
    _sortRowNodesByOrder,
    _warnOnce,
} from '@ag-grid-community/core';

import { BatchRemover } from '../batchRemover';

interface TreeGroupingDetails {
    expandByDefault: number;
    changedPath: ChangedPath;
    rootNode: RowNode;
    transactions: RowNodeTransaction[];
    rowNodeOrder: { [id: string]: number };

    isGroupOpenByDefault: (params: WithoutGridCommon<IsGroupOpenByDefaultParams>) => boolean;
    initialGroupOrderComparator: (params: WithoutGridCommon<InitialGroupOrderComparatorParams>) => number;

    suppressGroupMaintainValueType: boolean;
    getDataPath: GetDataPath | undefined;
}

interface GroupInfo {
    key: string; // e.g. 'Ireland'
    field: string | null; // e.g. 'country'
    rowGroupColumn: AgColumn | null;
    leafNode?: RowNode;
}

export class TreeStrategy extends BeanStub implements IRowNodeStage {
    private beans: BeanCollection;
    private selectionService: ISelectionService;
    private showRowGroupColsService: IShowRowGroupColsService;

    public wireBeans(beans: BeanCollection) {
        this.beans = beans;
        this.selectionService = beans.selectionService;
        this.showRowGroupColsService = beans.showRowGroupColsService!;
    }

    private oldGroupDisplayColIds: string;

    /** Hierarchical node cache to speed up tree data node insertion */
    private treeNodeCache = new TreeDataNodeCache();

    public execute(params: StageExecuteParams): void {
        const details = this.createGroupingDetails(params);

        if (details.transactions) {
            this.handleTransaction(details);
        } else {
            const afterColsChanged = params.afterColumnsChanged === true;
            this.shotgunResetEverything(details, afterColsChanged);
        }
    }

    private createGroupingDetails(params: StageExecuteParams): TreeGroupingDetails {
        const { rowNode, changedPath, rowNodeTransactions, rowNodeOrder } = params;

        const details: TreeGroupingDetails = {
            expandByDefault: this.gos.get('groupDefaultExpanded'),
            rootNode: rowNode,
            rowNodeOrder: rowNodeOrder!,
            transactions: rowNodeTransactions!,
            // if no transaction, then it's shotgun, changed path would be 'not active' at this point anyway
            changedPath: changedPath!,
            isGroupOpenByDefault: this.gos.getCallback('isGroupOpenByDefault') as any,
            initialGroupOrderComparator: this.gos.getCallback('initialGroupOrderComparator') as any,
            suppressGroupMaintainValueType: this.gos.get('suppressGroupMaintainValueType'),
            getDataPath: this.gos.get('getDataPath'),
        };

        return details;
    }

    private handleTransaction(details: TreeGroupingDetails): void {
        // we don't allow batch remover for tree data as tree data uses Filler Nodes,
        // and creating/deleting filler nodes needs to be done alongside the node deleting
        // and moving. if we want to Batch Remover working with tree data then would need
        // to consider how Filler Nodes would be impacted (it's possible that it can be easily
        // modified to work, however for now I don't have the brain energy to work it all out).

        details.transactions.forEach((tran) => {
            // the order here of [add, remove, update] needs to be the same as in ClientSideNodeManager,
            // as the order is important when a record with the same id is added and removed in the same
            // transaction.
            if (_existsAndNotEmpty(tran.remove)) {
                this.removeNodes(tran.remove as RowNode[], details);
            }
            if (_existsAndNotEmpty(tran.update)) {
                this.moveNodesInWrongPath(tran.update as RowNode[], details);
            }
            if (_existsAndNotEmpty(tran.add)) {
                this.insertNodes(tran.add as RowNode[], details);
            }
        });

        if (details.rowNodeOrder) {
            this.sortChildren(details);
        }
    }

    // this is used when doing delta updates, eg Redux, keeps nodes in right order
    private sortChildren(details: TreeGroupingDetails): void {
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

    private getExistingPathForNode(node: RowNode, details: TreeGroupingDetails): GroupInfo[] {
        const res: GroupInfo[] = [];

        // the node is part of the path
        let pointer: RowNode | null = node;
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

    /**
     * Topological sort of the given row nodes based on the grouping hierarchy, where parents come before children.
     * Used to ensure tree data is moved in the correct order (see AG-11678)
     */
    private topoSort(rowNodes: RowNode[], details: TreeGroupingDetails): RowNode[] {
        const sortedNodes: RowNode[] = [];
        // performance: create a cache of ids to make lookups during the search faster
        const idLookup = Object.fromEntries(rowNodes.map<[string, number]>((node, i) => [node.id!, i]));
        // performance: keep track of the nodes we haven't found yet so we can return early
        const stillToFind = new Set(Object.keys(idLookup));

        const queue = [details.rootNode];
        let i = 0;

        // BFS for nodes in the hierarchy that match IDs of the given nodes
        while (i < queue.length) {
            // performance: indexing into the array instead of using e.g. `.shift` is _much_ faster
            const node = queue[i];
            i++;
            if (node === undefined) {
                continue;
            }

            if (node.id && node.id in idLookup) {
                sortedNodes.push(rowNodes[idLookup[node.id]]);
                stillToFind.delete(node.id);
            }

            // we can stop early if we've already found all the nodes
            if (stillToFind.size === 0) {
                return sortedNodes;
            }

            const children = node.childrenAfterGroup ?? [];
            for (let i = 0; i < children.length; i++) {
                queue.push(children[i]);
            }
        }

        return sortedNodes;
    }

    private moveNodesInWrongPath(childNodes: RowNode[], details: TreeGroupingDetails): void {
        const sorted = this.topoSort(childNodes, details);

        sorted.forEach((childNode) => {
            // we add node, even if parent has not changed, as the data could have
            // changed, hence aggregations will be wrong
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(childNode.parent);
            }

            const infoToKeyMapper = (item: GroupInfo) => item.key;
            const oldPath: string[] = this.getExistingPathForNode(childNode, details).map(infoToKeyMapper);
            const newPath: string[] = this.getGroupInfo(childNode, details).map(infoToKeyMapper);

            const nodeInCorrectPath = _areEqual(oldPath, newPath);

            if (!nodeInCorrectPath) {
                this.moveNode(childNode, details);
            }
        });
    }

    private moveNode(childNode: RowNode, details: TreeGroupingDetails): void {
        this.removeNodesInStages([childNode], details);
        this.insertOneNode(childNode, details, true);

        // hack - if we didn't do this, then renaming a tree item (ie changing rowNode.key) wouldn't get
        // refreshed into the gui.
        // this is needed to kick off the event that rowComp listens to for refresh. this in turn
        // then will get each cell in the row to refresh - which is what we need as we don't know which
        // columns will be displaying the rowNode.key info.
        childNode.setData(childNode.data);

        // we add both old and new parents to changed path, as both will need to be refreshed.
        // we already added the old parent (in calling method), so just add the new parent here
        if (details.changedPath.isActive()) {
            const newParent = childNode.parent;
            details.changedPath.addParentNode(newParent);
        }
    }

    private removeNodes(leafRowNodes: RowNode[], details: TreeGroupingDetails): void {
        this.removeNodesInStages(leafRowNodes, details);
        if (details.changedPath.isActive()) {
            leafRowNodes.forEach((rowNode) => details.changedPath.addParentNode(rowNode.parent));
        }
    }

    private removeNodesInStages(leafRowNodes: RowNode[], details: TreeGroupingDetails): void {
        const batchRemover = new BatchRemover();

        leafRowNodes.forEach((nodeToRemove) => {
            this.removeFromParent(nodeToRemove, batchRemover);

            // remove from allLeafChildren. we clear down all parents EXCEPT the Root Node, as
            // the ClientSideNodeManager is responsible for the Root Node.
            this.forEachParentGroup(details, nodeToRemove.parent!, (parentNode) => {
                batchRemover.removeFromAllLeafChildren(parentNode, nodeToRemove);
            });
        });

        batchRemover.flush();

        // For TreeData, there is no BatchRemover, so we have to call removeEmptyGroups here.
        const nodeParents = leafRowNodes.map((n) => n.parent!);
        this.removeEmptyGroups(nodeParents, details);
    }

    private forEachParentGroup(
        details: TreeGroupingDetails,
        group: RowNode,
        callback: (parent: RowNode) => void
    ): void {
        let pointer: RowNode | null = group;
        while (pointer && pointer !== details.rootNode) {
            callback(pointer);
            pointer = pointer.parent;
        }
    }

    private removeEmptyGroups(possibleEmptyGroups: RowNode[], details: TreeGroupingDetails): void {
        // we do this multiple times, as when we remove groups, that means the parent of just removed
        // group can then be empty. to get around this, if we remove, then we check everything again for
        // newly emptied groups. the max number of times this will execute is the depth of the group tree.
        let checkAgain = true;

        const groupShouldBeRemoved = (rowNode: RowNode): boolean => {
            // because of the while loop below, it's possible we already moved the node,
            // so double check before trying to remove again.
            const mapKey = this.getChildrenMappedKey(rowNode.key!, rowNode.rowGroupColumn);
            const parentRowNode = rowNode.parent;
            const groupAlreadyRemoved = parentRowNode?.childrenMapped ? !parentRowNode.childrenMapped[mapKey] : true;

            if (groupAlreadyRemoved) {
                // if not linked, then group was already removed
                return false;
            }
            // if still not removed, then we remove if this group is empty
            return rowNode.isEmptyRowGroupNode();
        };

        while (checkAgain) {
            checkAgain = false;
            const batchRemover = new BatchRemover();
            possibleEmptyGroups.forEach((possibleEmptyGroup) => {
                // remove empty groups
                this.forEachParentGroup(details, possibleEmptyGroup, (rowNode) => {
                    if (groupShouldBeRemoved(rowNode)) {
                        if (rowNode.data && details.getDataPath?.(rowNode.data)) {
                            // This node has associated tree data so shouldn't be removed, but should no longer be
                            // marked as a group if it has no children.
                            rowNode.setGroup(
                                (rowNode.childrenAfterGroup && rowNode.childrenAfterGroup.length > 0) ?? false
                            );
                        } else {
                            checkAgain = true;

                            this.removeFromParent(rowNode, batchRemover);
                            // we remove selection on filler nodes here, as the selection would not be removed
                            // from the RowNodeManager, as filler nodes don't exist on the RowNodeManager
                            rowNode.setSelectedParams({ newValue: false, source: 'rowGroupChanged' });
                        }
                    }
                });
            });
            batchRemover.flush();
        }
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
        if (child.parent?.childrenMapped != undefined) {
            delete child.parent.childrenMapped[mapKey];
        }
        // this is important for transition, see rowComp removeFirstPassFuncs. when doing animation and
        // remove, if rowTop is still present, the rowComp thinks it's just moved position.
        child.setRowTop(null);
        child.setRowIndex(null);
    }

    /**
     * This is idempotent, but relies on the `key` field being the same throughout a RowNode's lifetime
     */
    private addToParent(child: RowNode, parent: RowNode | null) {
        const mapKey = this.getChildrenMappedKey(child.key!, child.rowGroupColumn);
        if (parent?.childrenMapped != null) {
            if (parent?.childrenMapped?.[mapKey] !== child) {
                parent.childrenMapped[mapKey] = child;
                parent.childrenAfterGroup!.push(child);
                parent.setGroup(true); // calls `.updateHasChildren` internally
            }
        }
    }

    private checkAllGroupDataAfterColsChanged(details: TreeGroupingDetails): void {
        const recurse = (rowNodes: RowNode[] | null) => {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach((rowNode) => {
                const groupInfo: GroupInfo = {
                    field: rowNode.field,
                    key: rowNode.key!,
                    rowGroupColumn: rowNode.rowGroupColumn,
                    leafNode: rowNode.allLeafChildren?.[0],
                };
                this.setGroupData(rowNode, groupInfo);
                recurse(rowNode.childrenAfterGroup);
            });
        };

        recurse(details.rootNode.childrenAfterGroup);
    }

    private shotgunResetEverything(details: TreeGroupingDetails, afterColumnsChanged: boolean): void {
        if (this.noChangeInGroupingColumns(details, afterColumnsChanged)) {
            return;
        }

        // groups are about to get disposed, so need to deselect any that are selected
        this.selectionService.filterFromSelection((node: RowNode) => node && !node.group);

        const { rootNode } = details;
        // set .leafGroup always to false for tree data, as .leafGroup is only used when pivoting, and pivoting
        // isn't allowed with treeData, so the grid never actually use .leafGroup when doing treeData.
        rootNode.leafGroup = false;

        // we are doing everything from scratch, so reset childrenAfterGroup and childrenMapped from the rootNode
        rootNode.childrenAfterGroup = [];
        rootNode.childrenMapped = {};
        rootNode.updateHasChildren();

        const sibling = rootNode.sibling;
        if (sibling) {
            sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
            sibling.childrenMapped = rootNode.childrenMapped;
        }

        this.insertNodes(rootNode.allLeafChildren!, details);
    }

    private noChangeInGroupingColumns(details: TreeGroupingDetails, afterColumnsChanged: boolean): boolean {
        const groupDisplayColumns = this.showRowGroupColsService.getShowRowGroupCols();
        const newGroupDisplayColIds = groupDisplayColumns ? groupDisplayColumns.map((c) => c.getId()).join('-') : '';

        if (afterColumnsChanged) {
            // if the group display cols have changed, then we need to update rowNode.groupData
            // (regardless of tree data or row grouping)
            if (this.oldGroupDisplayColIds !== newGroupDisplayColIds) {
                this.checkAllGroupDataAfterColsChanged(details);
            }
        }

        this.oldGroupDisplayColIds = newGroupDisplayColIds;

        return afterColumnsChanged;
    }

    private insertNodes(newRowNodes: RowNode[], details: TreeGroupingDetails): void {
        this.buildNodeCacheFromRows(newRowNodes, details);

        newRowNodes.forEach((rowNode) => {
            this.insertOneNode(rowNode, details, false);
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(rowNode.parent);
            }
        });
    }

    private insertOneNode(
        childNode: RowNode,
        details: TreeGroupingDetails,
        isMove: boolean,
        batchRemover?: BatchRemover
    ): void {
        const path: GroupInfo[] = this.getGroupInfo(childNode, details);
        const level = path.length - 1;

        const parentGroup = this.findParentForNode(childNode, path, details, batchRemover, level);

        const existingNode = parentGroup.childrenAfterGroup?.find((node) => node.key === childNode.key);
        if (existingNode) {
            _warnOnce(`duplicate group keys for row data, keys should be unique`, [existingNode.data, childNode.data]);
            return;
        }
        const info = _last(path);
        childNode.parent = parentGroup;
        childNode.level = path.length;
        this.ensureRowNodeFields(childNode, info.key);
        this.setGroupData(childNode, info);
        // AG-3441 - only set initial value if node is not being moved
        if (!isMove) {
            this.setExpandedInitialValue(details, childNode);
        }
        this.addToParent(childNode, parentGroup);
    }

    private findParentForNode(
        childNode: RowNode,
        path: GroupInfo[],
        details: TreeGroupingDetails,
        batchRemover?: BatchRemover,
        stopLevel?: number
    ): RowNode {
        let nextNode: RowNode = details.rootNode;

        path.forEach((groupInfo, level) => {
            // in some cases (i.e. tree data) the given path includes the child node, so we need to exclude it
            if (stopLevel !== undefined && level >= stopLevel) {
                return;
            }

            nextNode = this.getOrCreateNextNode(nextNode, path, groupInfo, level, details);
            // node gets added to all group nodes.
            // note: we do not add to rootNode here, as the rootNode is the master list of rowNodes

            if (!batchRemover?.isRemoveFromAllLeafChildren(nextNode, childNode)) {
                nextNode.allLeafChildren!.push(childNode);
            } else {
                // if this node is about to be removed, prevent that
                batchRemover?.preventRemoveFromAllLeafChildren(nextNode, childNode);
            }
        });

        return nextNode;
    }

    private getOrCreateNextNode(
        parentGroup: RowNode,
        path: GroupInfo[],
        groupInfo: GroupInfo,
        level: number,
        details: TreeGroupingDetails
    ): RowNode {
        const key = groupInfo.key;
        let nextNode = parentGroup?.childrenMapped?.[key];

        if (!nextNode) {
            if (this.treeNodeCache.has(path, level, key)) {
                nextNode = this.treeNodeCache.get(path, level, key);
                nextNode.parent = parentGroup;
            } else {
                nextNode = this.createGroup(groupInfo, parentGroup, level, details);
            }
            // attach the new group to the parent
            this.addToParent(nextNode, parentGroup);
        }

        return nextNode;
    }

    /**
     * Directly re-initialises the `TreeDataNodeCache`
     */
    private buildNodeCacheFromRows(rowNodes: RowNode[], details: TreeGroupingDetails): void {
        let width = 0;
        const paths = rowNodes.map((node) => {
            const info = this.getGroupInfo(node, details);
            width = Math.max(width, info.length);
            return info;
        });

        this.treeNodeCache.clear();

        // Iterate through the paths level-by-level, populating the cache with RowNode
        // instances for all leaves of the hierarchy, and nulls otherwise (to be backfilled
        // with filler nodes in the subsequent step)
        for (let level = 0; level < width; level++) {
            for (const [rowIdx, path] of paths.entries()) {
                const isDefined = path[level] !== undefined;
                const isLeaf = path[level + 1] === undefined;

                if (!isDefined) {
                    continue;
                }

                const info = path[level];

                const currentValue = this.treeNodeCache.get(path, level, info.key);
                if (currentValue != null) {
                    continue;
                }

                this.treeNodeCache.set(
                    path,
                    level,
                    info.key,
                    isLeaf ? this.ensureRowNodeFields(rowNodes[rowIdx], info.key) : null
                );
            }
        }

        this.backfillGroups(this.treeNodeCache.inner(), details.rootNode, 0, details);
    }

    private ensureRowNodeFields(rowNode: RowNode, key?: string): RowNode {
        if (key !== undefined) {
            rowNode.key = key;
        }
        rowNode.childrenMapped ??= {};
        rowNode.allLeafChildren ??= [];
        rowNode.childrenAfterGroup ??= [];
        return rowNode;
    }

    /** Walks the TreeDataNodeCache recursively and backfills `null` entries with filler group nodes */
    private backfillGroups(
        cache: InnerTreeDataNodeCache,
        parent: RowNode,
        level: number,
        details: TreeGroupingDetails
    ): void {
        for (const [key, value] of Object.entries(cache)) {
            if (value.node === null) {
                value.node = this.createGroup({ key, rowGroupColumn: null, field: null }, parent, level, details);
            }
            this.backfillGroups(value.subtree, value.node, level + 1, details);
        }
    }

    private createGroup(groupInfo: GroupInfo, parent: RowNode, level: number, details: TreeGroupingDetails): RowNode {
        const groupNode = new RowNode(this.beans);

        groupNode.group = true;
        groupNode.field = groupInfo.field;

        this.setGroupData(groupNode, groupInfo);

        groupNode.key = groupInfo.key;
        groupNode.id = this.createGroupId(groupNode, parent, level);

        groupNode.level = level;
        groupNode.leafGroup = false;

        groupNode.allLeafChildren = [];

        // why is this done here? we are not updating the children count as we go,
        // i suspect this is updated in the filter stage
        groupNode.setAllChildrenCount(0);

        groupNode.rowGroupIndex = null;

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
            parent,
            level
        ) => {
            if (level < 0) {
                return null;
            } // root node
            const parentId = parent ? createGroupId(parent, parent.parent, level - 1) : null;
            return `${parentId == null ? '' : parentId + '-'}${level}-${node.key}`;
        };

        // we put 'row-group-' before the group id, so it doesn't clash with standard row id's. we also use 't-' and 'b-'
        // for top pinned and bottom pinned rows.
        return RowNode.ID_PREFIX_ROW_GROUP + createGroupId(node, parent, level);
    }

    private setGroupData(groupNode: RowNode, groupInfo: GroupInfo): void {
        groupNode.groupData = {};
        const groupDisplayCols = this.showRowGroupColsService.getShowRowGroupCols();
        groupDisplayCols.forEach((col) => {
            // newGroup.rowGroupColumn=null when working off GroupInfo, and we always display the group in the group column
            // if rowGroupColumn is present, then it's grid row grouping and we only include if configuration says so

            groupNode.groupData![col.getColId()] = groupInfo.key;
        });
    }

    private getChildrenMappedKey(key: string, rowGroupColumn: AgColumn | null): string {
        return rowGroupColumn ? rowGroupColumn.getId() + '-' + key : key;
    }

    private setExpandedInitialValue(details: TreeGroupingDetails, groupNode: RowNode): void {
        // use callback if exists
        const userCallback = details.isGroupOpenByDefault;
        if (userCallback) {
            const params: WithoutGridCommon<IsGroupOpenByDefaultParams> = {
                rowNode: groupNode,
                field: groupNode.field!,
                key: groupNode.key!,
                level: groupNode.level,
                rowGroupColumn: groupNode.rowGroupColumn!,
            };
            groupNode.expanded = userCallback(params) == true;
            return;
        }

        // use expandByDefault if exists
        if (details.expandByDefault === -1) {
            groupNode.expanded = true;
            return;
        }

        // otherwise
        groupNode.expanded = groupNode.level < details.expandByDefault;
    }

    private getGroupInfo(rowNode: RowNode, details: TreeGroupingDetails): GroupInfo[] {
        const keys = details.getDataPath?.(rowNode.data);

        if (keys === undefined || keys.length === 0) {
            _warnOnce(`getDataPath() should not return an empty path for data ${rowNode.data}`);
        }
        return keys?.map((key) => ({ key, field: null, rowGroupColumn: null })) ?? [];
    }
}

/** Hierarchical cache of RowNode or sentinel value indicating a filler group node is necessary */
type InnerTreeDataNodeCache = Record<string, { node: null | RowNode; subtree: InnerTreeDataNodeCache }>;

class TreeDataNodeCache {
    private cache: InnerTreeDataNodeCache = Object.create(null);

    private traverse(path: GroupInfo[], level: number): InnerTreeDataNodeCache {
        let cache = this.cache;
        let i = 0;

        while (i <= level) {
            const key = path[i].key;

            if (!(key in cache)) {
                cache[key] = { node: null, subtree: Object.create(null) };
            }
            cache = cache[key].subtree;

            i++;
        }

        return cache;
    }

    public set(path: GroupInfo[], level: number, key: string, value: null | RowNode) {
        const cache = this.traverse(path, level - 1);
        cache[key] = { node: value, subtree: Object.create(null) };
    }

    public has(path: GroupInfo[], level: number, key: string): boolean {
        const cache = this.traverse(path, level - 1);
        return key in cache;
    }

    public get(path: GroupInfo[], level: number, key: string): RowNode | null | undefined {
        const cache = this.traverse(path, level - 1);
        return cache[key]?.node;
    }

    public clear(): void {
        this.cache = Object.create(null);
    }

    public inner(): InnerTreeDataNodeCache {
        return this.cache;
    }
}
