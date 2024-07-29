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
import { BeanStub, RowNode, _removeFromArray, _sortRowNodesByOrder, _warnOnce } from '@ag-grid-community/core';

import { BatchRemover } from '../../batchRemover';

interface TreeGroupingDetails {
    expandByDefault: number;
    changedPath: ChangedPath;
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

type TreeMap = Map<string, TreeNode>;

class TreeNode {
    /** The key of this tree node */
    public readonly key: string;

    /** Tree node children */
    public map: TreeMap | null = null;

    /** The RowNode associated to this tree node */
    public row: RowNode | null = null;

    public constructor(key: string) {
        this.key = key;
    }

    public upsert(key: string): TreeNode {
        let child: TreeNode | undefined;
        let map = this.map;
        if (map) {
            child = map.get(key);
        } else {
            map = new Map();
            this.map = map;
        }
        if (!child) {
            child = new TreeNode(key);
            map.set(key, child);
        }
        return child;
    }
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

    private oldGroupDisplayColIds: string | undefined;

    /** Hierarchical node cache to speed up tree data node insertion */
    private root: TreeNode = new TreeNode('');

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

        const oldRootRow = this.root.row;
        if (oldRootRow !== rowNode) {
            this.root.row = rowNode;
            if (oldRootRow) {
                // The root node changed? This should not happen, but if it does, clear cache
                this.root.map?.clear();
            }
        }

        if (details.transactions) {
            this.handleTransaction(details);
        } else {
            const afterColsChanged = params.afterColumnsChanged === true;
            this.shotgunResetEverything(details, afterColsChanged);
        }
    }

    private setTreeNodeRow(treeNode: TreeNode, row: RowNode): void {
        const oldRow = treeNode.row;
        if (oldRow === row) {
            return;
        }

        if (oldRow?.data) {
            if (!row.data) {
                return; // filler node, so we don't overwrite the real node
            }
        }

        treeNode.row = row;
        return;
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

            if (remove?.length) {
                this.removeNodes(remove as RowNode[], details);
            }
            if (update?.length) {
                this.moveNodesInWrongPath(update as RowNode[], details);
            }
            if (add?.length) {
                this.insertNodes(add as RowNode[], details);
            }
        }

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

    private isNodeInTheRightPath(node: RowNode, details: TreeGroupingDetails): boolean {
        const newPath: string[] = this.getDataPath(node, details);

        // Traverse from the node to the root to get the old path and compare it with the new path
        let pointer: RowNode | null = node;
        for (let i = newPath.length - 1; i >= 0; i--) {
            if (!pointer || pointer.key !== newPath[i]) {
                return false;
            }
            pointer = pointer.parent;
        }

        // Ensure we have reached the root
        return pointer === this.root.row;
    }

    private moveNodesInWrongPath(childNodes: RowNode[], details: TreeGroupingDetails): void {
        const sorted = topologicalSort(this.root.row!, childNodes);
        for (const childNode of sorted) {
            // we add node, even if parent has not changed, as the data could have
            // changed, hence aggregations will be wrong
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(childNode.parent);
            }

            if (!this.isNodeInTheRightPath(childNode, details)) {
                this.moveNode(childNode, details);
            }
        }
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
        const { changedPath } = details;
        this.removeNodesInStages(leafRowNodes, details);
        if (changedPath.isActive()) {
            for (const rowNode of leafRowNodes) {
                changedPath.addParentNode(rowNode.parent);
            }
        }
    }

    private removeNodesInStages(leafRowNodes: RowNode[], details: TreeGroupingDetails): void {
        const batchRemover = new BatchRemover();

        for (const nodeToRemove of leafRowNodes) {
            this.removeFromParent(nodeToRemove, batchRemover);

            // remove from allLeafChildren. we clear down all parents EXCEPT the Root Node, as
            // the ClientSideNodeManager is responsible for the Root Node.

            for (
                let parent: RowNode | null = nodeToRemove.parent, grandParent: RowNode | null;
                parent && parent !== this.root.row;
                parent = grandParent
            ) {
                grandParent = parent.parent;
                batchRemover.removeFromAllLeafChildren(parent, nodeToRemove);
            }
        }

        batchRemover.flush();

        // For TreeData, there is no BatchRemover, so we have to call removeEmptyGroups here.
        const nodeParents = leafRowNodes.map((n) => n.parent!);
        this.removeEmptyGroups(nodeParents, details);
    }

    private removeEmptyGroups(possibleEmptyGroups: RowNode[], details: TreeGroupingDetails): void {
        // we do this multiple times, as when we remove groups, that means the parent of just removed
        // group can then be empty. to get around this, if we remove, then we check everything again for
        // newly emptied groups. the max number of times this will execute is the depth of the group tree.
        let checkAgain = true;

        while (checkAgain) {
            checkAgain = false;
            const batchRemover = new BatchRemover();

            // remove empty groups

            for (const possibleEmptyGroup of possibleEmptyGroups) {
                for (
                    let row: RowNode | null = possibleEmptyGroup, parent: RowNode | null;
                    row && row !== this.root.row;
                    row = parent
                ) {
                    parent = row.parent;

                    // it's possible we already moved the node, so double check before trying to remove again.
                    const mapKey = getChildrenMappedKey(row.key!, row.rowGroupColumn);
                    const parentRowNode = row.parent;
                    const groupAlreadyRemoved = parentRowNode?.childrenMapped
                        ? !parentRowNode.childrenMapped[mapKey]
                        : true;

                    if (!groupAlreadyRemoved && row.isEmptyRowGroupNode()) {
                        if (row.data && details.getDataPath?.(row.data)) {
                            // This node has associated tree data so shouldn't be removed, but should no longer be
                            // marked as a group if it has no children.
                            row.setGroup((row.childrenAfterGroup && row.childrenAfterGroup.length > 0) ?? false);
                        } else {
                            checkAgain = true;

                            this.removeFromParent(row, batchRemover);
                            // we remove selection on filler nodes here, as the selection would not be removed
                            // from the RowNodeManager, as filler nodes don't exist on the RowNodeManager
                            row.setSelectedParams({ newValue: false, source: 'rowGroupChanged' });
                        }
                    }
                }
            }
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
        if (child.parent?.childrenMapped) {
            delete child.parent.childrenMapped[getChildrenMappedKey(child.key!, child.rowGroupColumn)];
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
        const childrenMapped = parent?.childrenMapped;
        if (childrenMapped) {
            const mapKey = getChildrenMappedKey(child.key!, child.rowGroupColumn);
            if (childrenMapped[mapKey] !== child) {
                childrenMapped[mapKey] = child;
                parent.childrenAfterGroup!.push(child);
                parent.setGroup(true); // calls `.updateHasChildren` internally
            }
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
                    this.checkAllGroupDataAfterColsChanged(this.root.row!.childrenAfterGroup);
                }

                // WARNING: this assumes that an event with afterColumnsChange=true doesn't change the rows
                return; // No further processing needed, rows didn't change
            }

            this.oldGroupDisplayColIds = newGroupDisplayColIds;
        }

        // groups are about to get disposed, so need to deselect any that are selected
        this.selectionService.filterFromSelection((node: RowNode) => node && !node.group);

        const rootNode = this.root.row!;

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

    private checkAllGroupDataAfterColsChanged(rowNodes: RowNode[] | null): void {
        if (!rowNodes) {
            return;
        }
        for (const rowNode of rowNodes) {
            const groupInfo: GroupInfo = {
                field: rowNode.field,
                key: rowNode.key!,
                rowGroupColumn: rowNode.rowGroupColumn,
                leafNode: rowNode.allLeafChildren?.[0],
            };
            this.setGroupData(rowNode, groupInfo);
            this.checkAllGroupDataAfterColsChanged(rowNode.childrenAfterGroup);
        }
    }

    private insertNodes(newRowNodes: RowNode[], details: TreeGroupingDetails): void {
        this.buildNodeCacheFromRows(newRowNodes, details);

        for (const rowNode of newRowNodes) {
            this.insertOneNode(rowNode, details, false);
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(rowNode.parent);
            }
        }
    }

    private insertOneNode(
        childNode: RowNode,
        details: TreeGroupingDetails,
        isMove: boolean,
        batchRemover?: BatchRemover
    ): void {
        const path = this.getDataPath(childNode, details);
        const level = path.length - 1;
        const key = path[level];

        let treeNode = this.root;
        let parentGroup = this.root.row!;
        let rowThatNeedsLevelUpdate: RowNode | null = null;

        for (let level = 0, stopLevel = path.length - 1; level < stopLevel; ++level) {
            const key = path[level];
            treeNode = treeNode.upsert(key);

            let row = parentGroup?.childrenMapped?.[key];

            if (!row) {
                row = treeNode.row;
                if (row) {
                    row.parent = parentGroup;
                } else {
                    row = this.createGroup(key, parentGroup, level, details);
                    this.setTreeNodeRow(treeNode, row);
                }
                // attach the new group to the parent
                this.addToParent(row, parentGroup);
            } else {
                this.setTreeNodeRow(treeNode, row);
            }

            parentGroup = row;
            if (row.level !== level) {
                row.level = level;
                rowThatNeedsLevelUpdate = row;
            }

            // node gets added to all group nodes.
            // note: we do not add to rootNode here, as the rootNode is the master list of rowNodes

            if (!batchRemover?.isRemoveFromAllLeafChildren(parentGroup, childNode)) {
                parentGroup.allLeafChildren!.push(childNode);
            } else {
                // if this node is about to be removed, prevent that
                batchRemover?.preventRemoveFromAllLeafChildren(parentGroup, childNode);
            }
        }

        childNode.parent = parentGroup;
        childNode.level = level;
        this.ensureRowNodeFields(childNode, key);
        this.setGroupData(childNode, { key, field: null, rowGroupColumn: null });
        // AG-3441 - only set initial value if node is not being moved
        if (!isMove) {
            this.setExpandedInitialValue(details, childNode);
        }
        this.addToParent(childNode, parentGroup);

        if (rowThatNeedsLevelUpdate) {
            this.fixLevels(rowThatNeedsLevelUpdate, rowThatNeedsLevelUpdate.level);
        }
    }

    private fixLevels(rowNode: RowNode, level: number): void {
        rowNode.level = level;
        rowNode.childrenAfterGroup?.forEach((child) => this.fixLevels(child, level + 1));
    }

    /**
     * Directly re-initialises the tree cache
     */
    private buildNodeCacheFromRows(rows: RowNode[], details: TreeGroupingDetails): void {
        this.root.map?.clear(); // Clear the cache

        // Populate the cache with the rows
        // Fills the rows if the row is a leaf, leave null for filler rows.
        // Filler rows will be filled in the next step (backfillGroups)

        for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
            const row = rows[rowIdx];
            const path = this.getDataPath(row, details);
            let treeNode = this.root;
            for (let level = 0; level < path.length; level++) {
                const isLeaf = level === path.length - 1;

                const key = path[level];
                treeNode = treeNode.upsert(key);
                if (isLeaf) {
                    this.setTreeNodeRow(treeNode, row);
                    this.ensureRowNodeFields(row, key);
                }
            }
        }

        this.backfillGroups(this.root, 0, details);
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

    /** Walks the Tree recursively and backfills `null` entries with filler group nodes */
    private backfillGroups(parent: TreeNode, level: number, details: TreeGroupingDetails): void {
        const subtree = parent.map;
        if (!subtree) {
            return;
        }
        for (const child of subtree.values()) {
            let row = child.row;
            if (!row) {
                row = this.createGroup(child.key, parent.row!, level, details);
                this.setTreeNodeRow(child, row);
            }

            const subtree = child.map;
            if (subtree) {
                this.backfillGroups(child, level + 1, details);
            }
        }
    }

    private createGroup(key: string, parent: RowNode, level: number, details: TreeGroupingDetails): RowNode {
        const groupNode = new RowNode(this.beans);

        groupNode.group = true;
        groupNode.field = null;

        this.setGroupData(groupNode, {
            key,
            field: null,
            rowGroupColumn: null,
        });

        groupNode.key = key;

        // we put 'row-group-' before the group id, so it doesn't clash with standard row id's. we also use 't-' and 'b-'
        // for top pinned and bottom pinned rows.
        groupNode.id = RowNode.ID_PREFIX_ROW_GROUP + this.createGroupIdEnd(groupNode, parent, level);

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

    private createGroupIdEnd(node: RowNode, parent: RowNode | null, level: number): string | null {
        if (level < 0) {
            return null;
        } // root node
        const parentId = parent ? this.createGroupIdEnd(parent, parent.parent, level - 1) : null;
        return `${parentId == null ? '' : parentId + '-'}${level}-${node.key}`;
    }

    private setGroupData(groupNode: RowNode, groupInfo: GroupInfo): void {
        groupNode.groupData = {};
        const groupDisplayCols = this.showRowGroupColsService.getShowRowGroupCols();
        for (const col of groupDisplayCols) {
            // newGroup.rowGroupColumn=null when working off GroupInfo, and we always display the group in the group column
            // if rowGroupColumn is present, then it's grid row grouping and we only include if configuration says so

            groupNode.groupData![col.getColId()] = groupInfo.key;
        }
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

    private getDataPath({ data }: RowNode, { getDataPath }: TreeGroupingDetails): string[] {
        const keys = getDataPath?.(data) || [];
        if (!keys.length) {
            _warnOnce(`getDataPath() should not return an empty path for data ${data}`);
        }
        return keys;
    }
}

function getChildrenMappedKey(key: string, rowGroupColumn: AgColumn | null): string {
    return rowGroupColumn ? rowGroupColumn.getId() + '-' + key : key;
}

/**
 * Topological sort of the given row nodes based on the grouping hierarchy, where parents come before children.
 * Used to ensure tree data is moved in the correct order (see AG-11678)
 */
function topologicalSort(rootRow: RowNode, rowNodes: RowNode[]): RowNode[] {
    const sortedNodes: RowNode[] = [];

    // performance: create a cache of ids to make lookups during the search faster
    const idLookup = new Map<string, RowNode>();

    // performance: keep track of the nodes we haven't found yet so we can return early
    const stillToFind = new Set<string>();

    for (let i = 0; i < rowNodes.length; i++) {
        const row = rowNodes[i];
        const id = row.id!;
        idLookup.set(id, row);
        stillToFind.add(id);
    }

    const queue = [rootRow];
    let i = 0;

    // BFS for nodes in the hierarchy that match IDs of the given nodes
    while (i < queue.length) {
        // performance: indexing into the array instead of using e.g. `.shift` is _much_ faster
        const node = queue[i];
        i++;
        if (node === undefined) {
            continue;
        }

        const { id, childrenAfterGroup } = node;

        const found = id && idLookup.get(id);
        if (found) {
            sortedNodes.push(found);
            stillToFind.delete(id);
        }

        // we can stop early if we've already found all the nodes
        if (stillToFind.size === 0) {
            return sortedNodes;
        }

        if (childrenAfterGroup) {
            for (let i = 0; i < childrenAfterGroup.length; i++) {
                queue.push(childrenAfterGroup[i]);
            }
        }
    }

    return sortedNodes;
}
