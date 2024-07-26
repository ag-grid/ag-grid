import type {
    BeanCollection,
    ChangedPath,
    GetDataPath,
    InitialGroupOrderComparatorParams,
    IsGroupOpenByDefaultParams,
    RowNodeTransaction,
    WithoutGridCommon,
} from '@ag-grid-community/core';
import { RowNode } from '@ag-grid-community/core';

export const RESULT_NOOP = 0 as const;
export const RESULT_OK = 2 as const;
export const RESULT_KEY_ALREADY_EXISTS = -1 as const;
export const RESULT_INVALID_OPERATION = -2 as const;
export const RESULT_CYCLE_DETECTED = -3 as const;

export type Result =
    | typeof RESULT_NOOP
    | typeof RESULT_OK
    | typeof RESULT_KEY_ALREADY_EXISTS
    | typeof RESULT_INVALID_OPERATION
    | typeof RESULT_CYCLE_DETECTED;

const FLAG_NEW = 0x0001;
const FLAG_CHILDREN_CHANGED = 0x0002;
const FLAG_LEAFS_CHANGED = 0x0004;
const FLAG_PATH_CHANGED = 0x0008;
const FLAG_GROUP_DATA_CHANGED = 0x0010;
const FLAG_FILLER = 0x0020;

const COMMITTED_FLAGS_TO_REMOVE =
    FLAG_NEW | FLAG_GROUP_DATA_CHANGED | FLAG_CHILDREN_CHANGED | FLAG_LEAFS_CHANGED | FLAG_PATH_CHANGED;

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

export class TreeNode {
    public parent: TreeNode | null = null;

    public level: number = -2;

    public map: Map<string, TreeNode> | null = null;

    /** The RowNode associated to this tree node */
    public row: RowNode | null = null;

    /** List of direct children to update in the commit stage */
    public updates: Set<TreeNode> | null = null;

    public flags: number = FLAG_NEW | FLAG_GROUP_DATA_CHANGED;

    public key: string;

    public constructor(key: string) {
        this.key = key;
    }
}

export class TreeManager {
    private rowsToNodes: WeakMap<RowNode, TreeNode> | null = new WeakMap();
    public beans: BeanCollection;
    public root: TreeNode | null;

    public setRoot(rootRow: RowNode | null) {
        const oldRoot = this.root;
        if (oldRoot && oldRoot.row !== rootRow) {
            // Free memory

            const children = oldRoot.map?.values();
            if (children) {
                oldRoot.map = null;
                for (const child of children) {
                    this.finalizeDeletion(child);
                }
            }
            this.root = null;
            this.rowsToNodes = null;
        }

        if (rootRow && (!oldRoot || oldRoot.row !== rootRow)) {
            const root = new TreeNode('');
            this.root = root;
            this.rowsToNodes = new WeakMap<RowNode, TreeNode>().set(rootRow, root);
            root.row = rootRow;
            root.parent = null;
            root.level = -1;
            root.flags |= FLAG_CHILDREN_CHANGED;
            // set .leafGroup always to false for tree data, as .leafGroup is only used when pivoting, and pivoting
            // isn't allowed with treeData, so the grid never actually use .leafGroup when doing treeData.
            rootRow.leafGroup = false;
            rootRow.childrenAfterGroup = [];
            rootRow.updateHasChildren();
            const sibling = rootRow.sibling;
            if (sibling) {
                sibling.childrenAfterGroup = rootRow.childrenAfterGroup;
            }
        }
    }

    public getTreeNode(row: RowNode): TreeNode | null {
        return this.rowsToNodes?.get(row) || null;
    }

    public getOrCreateTreeNode(row: RowNode, key: string): TreeNode {
        const weakMap = (this.rowsToNodes ??= new WeakMap());
        let node = weakMap.get(row);
        if (!node) {
            node = new TreeNode(key);
            node.row = row;
            weakMap.set(row, node);
        }
        return node;
    }

    public upsertNode(parent: TreeNode, key: string): TreeNode {
        const node = parent.map?.get(key);
        if (node) {
            return node;
        }
        const filler = new TreeNode(key);
        filler.flags |= FLAG_FILLER;
        this.updateParent(filler, parent, null);
        return filler;
    }

    /** Adds or removes a node from its parent */
    public updateParent(node: TreeNode, newParent: TreeNode | null, newKey: string | null): Result {
        const oldParent = node.parent;
        if (oldParent === newParent && (newKey === null || newKey === node.key)) {
            return RESULT_NOOP; // nothing to do, node is already in the right spot
        }

        if (newParent) {
            for (let parent: TreeNode | null = newParent; parent; parent = parent.parent) {
                if (parent === node) {
                    return RESULT_CYCLE_DETECTED;
                }
            }

            const existing = newParent.map?.get(newKey ?? node.key);
            if (existing) {
                // If the existing node is not a leaf node (has no row.data) it can be swapped out
                if (existing.row?.data) {
                    return RESULT_KEY_ALREADY_EXISTS; // Not a filler node, cannot be swapped out
                }

                if (node.map?.size) {
                    return RESULT_INVALID_OPERATION; // Cannot swap out a node that has children
                }

                // Swap node children

                node.map = existing.map;
                node.updates = existing.updates;
                node.flags |=
                    (existing.flags & ~(FLAG_NEW | FLAG_FILLER)) | (FLAG_CHILDREN_CHANGED | FLAG_GROUP_DATA_CHANGED);

                // Dispose existing node

                newParent.updates?.delete(existing);
                existing.map = null;
                existing.parent = null;
                existing.updates = null;
                this.finalizeDeletion(existing);
            }
        }

        if (oldParent) {
            oldParent.flags |= FLAG_CHILDREN_CHANGED | FLAG_PATH_CHANGED;
            oldParent.updates?.delete(node);
            oldParent.map?.delete(node.key);
            this.invalidateUpToRoot(oldParent);
        }

        if (newParent) {
            if (newKey !== null && node.row && node.row.key !== newKey) {
                node.row.key = newKey;
                node.flags |= FLAG_GROUP_DATA_CHANGED;
            }

            newParent.flags |= FLAG_CHILDREN_CHANGED | FLAG_PATH_CHANGED;
            (newParent.map ??= new Map()).set(node.key, node);
            (newParent.updates ??= new Set()).add(node);
            this.invalidateUpToRoot(newParent);
            this.updateAllChildrenParentsAndLevels(node, newParent, newParent.level + 1);
        } else {
            this.finalizeDeletion(node);
        }

        return RESULT_OK;
    }

    public invalidateUpToRoot(node: TreeNode) {
        const parent = node.parent;
        if (parent) {
            const updates = (parent.updates ??= new Set());
            if (!updates.has(node)) {
                updates.add(node);
                this.invalidateUpToRoot(parent);
            }
        }
    }

    public setGroupData(row: RowNode): void {
        const key = row.key!;
        const groupData: Record<string, string> = {};
        row.groupData = groupData;
        const groupDisplayCols = this.beans.showRowGroupColsService?.getShowRowGroupCols();
        if (groupDisplayCols) {
            for (const col of groupDisplayCols) {
                // newGroup.rowGroupColumn=null when working off GroupInfo, and we always display the group in the group column
                // if rowGroupColumn is present, then it's grid row grouping and we only include if configuration says so
                groupData![col.getColId()] = key;
            }
        }
    }

    public commitRoot(details: TreeGroupingDetails) {
        const root = this.root;
        if (root) {
            if (root.updates?.size) {
                for (const node of root.updates) {
                    this.commitNode(details, node, root);
                }
                root.updates = null;

                rebuildChildrenAfterGroup(root);
            }

            if (root.flags & FLAG_PATH_CHANGED && details.changedPath.isActive()) {
                details.changedPath.addParentNode(root.row);
            }

            root.flags &= ~COMMITTED_FLAGS_TO_REMOVE;
        }
    }

    private removeFillerNode(node: TreeNode, parent: TreeNode) {
        parent.flags |= FLAG_CHILDREN_CHANGED;
        parent.map?.delete(node.key);
        this.finalizeDeletion(node); // This is a filler node with no leafs
    }

    private commitNode(details: TreeGroupingDetails, node: TreeNode, parent: TreeNode) {
        let row = node.row;

        if (!row?.data && node.flags & FLAG_FILLER && !node.map?.size) {
            this.removeFillerNode(node, parent);
            return;
        }

        if (!row) {
            row = this.createFillerNode(node, parent);
            node.row = row;
        } else {
            row.parent = parent.row;
            row.level = node.level;
        }

        row.allLeafChildren ??= [];
        row.childrenAfterGroup ??= [];

        if (node.updates) {
            for (const child of node.updates) {
                this.commitNode(details, child, node);
            }
            node.updates = null;
        }

        if (!row.data && node.flags & FLAG_FILLER && !node.map?.size) {
            this.removeFillerNode(node, parent);
            return;
        }

        if (node.flags & FLAG_GROUP_DATA_CHANGED) {
            this.setGroupData(row);
        }

        const childrenChanged = node.flags & FLAG_CHILDREN_CHANGED && rebuildChildrenAfterGroup(node);

        if (childrenChanged || node.flags & FLAG_LEAFS_CHANGED) {
            if (rebuildLeafChildren(node)) {
                parent.flags |= FLAG_LEAFS_CHANGED; // propagate up
            }
        }

        if (node.flags & FLAG_NEW) {
            this.setExpandedInitialValue(details, row);
        }

        if (node.flags & FLAG_PATH_CHANGED && details.changedPath.isActive()) {
            details.changedPath.addParentNode(node.row);
        }

        node.flags &= ~COMMITTED_FLAGS_TO_REMOVE;
    }

    private createFillerNode(node: TreeNode, parent: TreeNode): RowNode {
        const row = new RowNode(this.beans);
        row.group = true;
        row.field = null;
        row.key = node.key;
        row.parent = parent.row;
        row.level = node.level;
        row.leafGroup = false;
        row.rowGroupIndex = null;

        // we put 'row-group-' before the group id, so it doesn't clash with standard row id's. we also use 't-' and 'b-'
        // for top pinned and bottom pinned rows.
        row.id = this.makeRowId(node);

        this.rowsToNodes!.set(row, node);

        // why is this done here? we are not updating the children count as we go,
        // i suspect this is updated in the filter stage
        row.setAllChildrenCount(0);

        row.updateHasChildren();
        return row;
    }

    private makeRowId(node: TreeNode): string {
        let result = node.level + '-' + node.key;
        for (let p = node.parent; p?.parent; p = p.parent) {
            result = `${p.level}-${p.key}-${result}`;
        }
        // we put 'row-group-' before the group id, so it doesn't clash with standard row id's.
        // we also use 't-' and 'b-' for top pinned and bottom pinned rows.
        return RowNode.ID_PREFIX_ROW_GROUP + result;
    }

    private updateAllChildrenParentsAndLevels(node: TreeNode, parent: TreeNode | null, level: number) {
        const { map } = node;
        node.parent = parent;
        node.level = level;
        if (map) {
            ++level;
            for (const child of map.values()) {
                if (child.parent !== node || node.level !== level) {
                    this.invalidateUpToRoot(child);
                    this.updateAllChildrenParentsAndLevels(child, node, level);
                }
            }
        }
    }

    private finalizeDeletion(node: TreeNode) {
        node.parent = null;
        node.updates = null;
        const nodeMap = node.map;
        if (nodeMap) {
            node.map = null;
            for (const child of nodeMap.values()) {
                this.finalizeDeletion(child);
            }
        }

        const row = node.row;
        if (!row) {
            return; // No row to delete
        }

        this.rowsToNodes?.delete(row);
        row.parent = null;

        if (row.childrenAfterGroup) {
            row.childrenAfterGroup.length = 0;
        }
        if (row.allLeafChildren) {
            row.allLeafChildren.length = 0;
        }

        if (node.flags & FLAG_NEW) {
            return; // This node was never committed
        }

        updateRowGroupState(node);

        // this is important for transition, see rowComp removeFirstPassFuncs. when doing animation and
        // remove, if rowTop is still present, the rowComp thinks it's just moved position.
        row.setRowTop(null);

        row.setRowIndex(null);

        if (!row.data || node.flags & FLAG_FILLER) {
            // we remove selection on filler nodes here, as the selection would not be removed
            // from the RowNodeManager, as filler nodes don't exist on the RowNodeManager
            row.setSelectedParams({ newValue: false, source: 'rowGroupChanged' });
        }

        node.row = null;
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
}

function rebuildChildrenAfterGroup(node: TreeNode): boolean {
    let result = false;
    const childrenAfterGroup = (node.row!.childrenAfterGroup ??= []);
    const oldCount = childrenAfterGroup.length;
    let count = 0;
    const map = node.map;
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
        updateRowGroupState(node);
    }
    return result;
}

function rebuildLeafChildren(node: TreeNode): boolean {
    const row = node.row!;
    const allLeafChildren = (row.allLeafChildren ??= []);
    const oldCount = allLeafChildren!.length;
    let count = 0;
    let changed = false;
    const map = node.map;
    if (map && map.size) {
        for (const childNode of map.values()) {
            const childRow = childNode.row!;
            if (!(childNode.flags & FLAG_FILLER)) {
                if (count >= oldCount || allLeafChildren[count] !== childRow) {
                    allLeafChildren![count] = childRow;
                    changed = true;
                }
                ++count;
            }
            const childAllLeafChildren = childRow.allLeafChildren!;
            for (let j = 0, jLen = childAllLeafChildren.length; j < jLen; j++) {
                const leaf = childAllLeafChildren[j];
                if (count >= oldCount || allLeafChildren[count] !== leaf) {
                    allLeafChildren[count] = leaf;
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

function updateRowGroupState(node: TreeNode) {
    const row = node.row;
    if (row) {
        const isGroup = !!node.map?.size;
        if (isGroup !== row.group) {
            row.setGroup(isGroup);
        } else if (row.hasChildren() !== isGroup) {
            row.updateHasChildren();
        }
    }
}
