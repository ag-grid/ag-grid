import type {
    ChangedPath,
    GridOptions,
    NestedDataGetter,
    StageExecuteParams,
    _ChangedRowNodes,
} from 'ag-grid-community';
import { BeanStub, RowNode, _EmptyArray, _removeFromArray, _warn } from 'ag-grid-community';

import { setRowNodeGroup } from '../rowGrouping/rowGroupingUtils';
import type { IRowGroupingStrategy } from '../rowHierarchy/rowHierarchyUtils';
import { _getRowDefaultExpanded } from '../rowHierarchy/rowHierarchyUtils';
import { fieldGetter } from './fieldAccess';

// The approach used here avoids complex incremental updates by using linear passes and a final traversal.
// We reduce memory allocations and footprint and we ensure consistent performance without keeping additional per node map.
//
// All leaf nodes are scanned in input order, and the tree is built by setting the treeParent field.
// Then we execute a single traversal to set the level, expanded state, and allLeafChildren invalidation.
// This guarantees correct parent-child relationships without requiring sorting or post-processing.
//
// No new arrays are allocated for childrenAfterGroup — existing arrays are reused.
// The treeNodeFlags field encodes temporary state, child counters, and expanded status.
// The treeParent field tracks hierarchy changes and supports re-parenting (e.g., drag-and-drop).
// Setting a node treeParent to a desired node and then executing grouping without full reload will generate a valid tree.
//
// This model handles both full reloads and partial updates (such as subtree moves) uniformly,
// avoiding the need for complex data structures, delta tracking, or transaction staging,
// while providing reliable performance across large datasets.

const FLAG_CHILDREN_CHANGED = 0x80000000;
const FLAG_CHANGED = 0x40000000;

/** Toggling this flag is used to mark a filler node as used or already processed */
const FLAG_MARKED_FILLER = 0x20000000;

/** This is the only flag that stays in the node, to indicate that the expanded state was initialized */
const FLAG_EXPANDED_INITIALIZED = 0x10000000;

/** Mask used to keep track of the number of children in a node */
const MASK_CHILDREN_LEN = 0x0fffffff; // This equates to 268,435,455 maximum children per parent, more than enough

/** Path key separator used to flatten hierarchical paths. Includes uncommon characters to reduce the risk of collisions. */
const PATH_KEY_SEPARATOR = String.fromCodePoint(31, 41150, 8291);
const PATH_KEY_SEPARATOR_LEN = 3;

type ParentIdGetter<TData> = ((data: TData) => string | null | undefined) | null;

export class TreeGroupStrategy<TData = any> extends BeanStub implements IRowGroupingStrategy<TData> {
    public nestedDataGetter: NestedDataGetter<TData> | null = null;
    private parentIdGetter: ParentIdGetter<TData> = null;

    public nonLeafsById: Map<string, RowNode<TData>> | null = null;
    private nodesToUnselect: RowNode<TData>[] | null = null;
    private fullReload: boolean = false;

    public postConstruct(): void {
        this.onPropChange(null);
    }

    public onPropChange(changedProps: ReadonlySet<keyof GridOptions<any>> | null): void {
        const gos = this.gos;
        if (!changedProps || changedProps.has('treeDataParentIdField')) {
            const parentIdField = gos.get('treeDataParentIdField');
            const getter: ParentIdGetter<TData> = parentIdField ? fieldGetter(parentIdField) : null;
            this.fullReload ||= this.parentIdGetter !== getter;
            this.parentIdGetter = getter;
            if (getter) {
                this.nestedDataGetter = null; // Mutually exclusive getters
            }
        }
        if (!changedProps || changedProps.has('treeDataChildrenField')) {
            const childrenField = this.parentIdGetter ? '' : gos.get('treeDataChildrenField');
            const getter: NestedDataGetter<TData> | null = childrenField ? fieldGetter(childrenField) : null;
            this.fullReload ||= this.nestedDataGetter !== getter;
            this.nestedDataGetter = getter;
        }
    }

    public override destroy(): void {
        this.nodesToUnselect = null;
        this.reset();
        super.destroy();
    }

    public reset(): void {
        this.clearNonLeafs();
        this.deselectHiddenNodes(false);
        this.fullReload = true;
    }

    public clearNonLeafs(): void {
        const fillers = this.nonLeafsById;
        if (fillers) {
            for (const node of fillers.values()) {
                node._destroy(false);
            }
            fillers.clear();
            this.nonLeafsById = null;
        }
    }

    public getNonLeaf(id: string): RowNode<TData> | undefined {
        return this.nonLeafsById?.get(id);
    }

    public loadGroupData(node: RowNode<TData>): Record<string, any> | null {
        const key = node.key;
        if (key == null) {
            node._groupData = null;
            return null;
        }
        const groupData: Record<string, any> = {};
        node._groupData = groupData;
        const groupDisplayCols = this.beans.showRowGroupCols?.columns;
        if (groupDisplayCols) {
            for (let i = 0, len = groupDisplayCols.length; i < len; ++i) {
                groupData[groupDisplayCols[i].getColId()] = key;
            }
        }
        return groupData;
    }

    public execute(params: StageExecuteParams<TData>): boolean {
        if (this.fullReload) {
            this.reset();
        }

        const { changedRowNodes, changedPath } = params;

        const rootNode = params.rowNode;

        const activeChangedPath = changedPath?.active ? changedPath : undefined;
        const fullReload = this.fullReload || (!changedRowNodes && !activeChangedPath);

        const hasUpdates = !!changedRowNodes && this.flagUpdatedNodes(changedRowNodes);
        if (fullReload || hasUpdates) {
            this.fullReload = false;
            if (this.parentIdGetter) {
                this.loadSelfRef(params, fullReload);
            } else if (this.nestedDataGetter) {
                this.loadNested(params, fullReload);
            } else {
                this.loadDataPath(params, fullReload);
            }
        }

        const parentsChanged = this.initRowsParents(rootNode);

        this.destroyFillerRows();

        this.initRowsChildrenSize(rootNode);

        let preprocessedCount = this.preprocessRows(rootNode);
        const treeChanged = parentsChanged || (preprocessedCount & FLAG_CHILDREN_CHANGED) !== 0;
        preprocessedCount &= ~FLAG_CHILDREN_CHANGED;

        const traverseCount = this.traverseRoot(rootNode, activeChangedPath);
        if (preprocessedCount > 0 && preprocessedCount !== traverseCount) {
            this.handleCycles(rootNode); // We have unprocessed nodes, this means we have at least one cycle to fix
            this.traverseRoot(rootNode, activeChangedPath); // Re-traverse the root
        }

        rootNode.treeNodeFlags = 0;

        this.deselectHiddenNodes(parentsChanged || fullReload);

        return treeChanged;
    }

    private flagUpdatedNodes(changedRowNodes: _ChangedRowNodes<TData>): boolean {
        const { adds, updates, removals } = changedRowNodes;
        let hasUpdates = removals.length > 0;
        if (adds.size > 0) {
            hasUpdates = true;
            for (const node of adds) {
                node.treeNodeFlags |= FLAG_CHANGED;
            }
        }
        if (updates.size > 0) {
            hasUpdates = true;
            for (const node of updates) {
                node.treeNodeFlags |= FLAG_CHANGED;
            }
        }
        return hasUpdates;
    }

    private initRowsParents(rootNode: RowNode<TData>): boolean {
        const allLeafs = rootNode._leafs!;
        const allLeafsLen = allLeafs.length;
        let parentsChanged = false;
        for (let i = 0; i < allLeafsLen; ++i) {
            if (this.initRowParent(allLeafs[i])) {
                parentsChanged = true;
            }
        }
        return parentsChanged;
    }

    private initRowParent(current: RowNode<TData>): boolean {
        let parentsChanged = false;
        while (true) {
            const oldParent = current.parent;
            const parent = current.treeParent;
            if (parent === null) {
                if (oldParent) {
                    parentsChanged = true;
                    this.hideRow(current); // Hide the row if it has no parent
                }
                break; // No more parents to process, we are at the root
            }

            // Increment the number of children in the parent
            let parentFlags = parent.treeNodeFlags + 1;

            const parentChanged = oldParent !== parent;
            if (parentChanged) {
                parentsChanged = true;
                parentFlags |= FLAG_CHANGED;
                current.parent = parent;
            }

            if (parentChanged && oldParent) {
                if (oldParent.destroyed && maybeExpandFromRemovedParent(parent, oldParent)) {
                    parentFlags |= FLAG_EXPANDED_INITIALIZED;
                }
                oldParent.treeNodeFlags |= FLAG_CHANGED;
            }

            if (parent.sourceRowIndex >= 0 || parent.treeNodeFlags & FLAG_MARKED_FILLER || parent.treeParent === null) {
                parent.treeNodeFlags = parentFlags;
                break; // Continue up only if parent is a non-processed filler
            }

            // Mark filler as processed
            parent.treeNodeFlags = parentFlags | FLAG_MARKED_FILLER | (current.treeNodeFlags & FLAG_CHANGED);
            current = parent;
        }
        return parentsChanged;
    }

    private destroyFillerRows(): void {
        const nonLeafsById = this.nonLeafsById;
        if (nonLeafsById) {
            for (const node of nonLeafsById.values()) {
                if (node.treeParent === null || (node.treeNodeFlags & MASK_CHILDREN_LEN) === 0) {
                    nonLeafsById.delete(node.id!); // This filler node is unused
                    node._destroy(true);
                    this.hideRow(node);
                }
            }
            if (nonLeafsById.size === 0) {
                this.nonLeafsById = null;
            }
        }
    }

    private initRowsChildrenSize(rootNode: RowNode<TData>) {
        this.initRowChildrenSize(rootNode);
        const allLeafs = rootNode._leafs!;
        const allLeafsLen = allLeafs.length;
        for (let i = 0; i < allLeafsLen; ++i) {
            this.initRowChildrenSize(allLeafs[i]);
        }

        const nonLeafsById = this.nonLeafsById;
        if (nonLeafsById !== null) {
            for (const filler of nonLeafsById.values()) {
                this.initRowChildrenSize(filler);
            }
        }
    }

    private initRowChildrenSize(row: RowNode<TData>) {
        let { childrenAfterGroup, _leafs: rowLeafs, treeNodeFlags } = row;
        const oldLen = childrenAfterGroup?.length;
        const len = treeNodeFlags & MASK_CHILDREN_LEN;
        row.treeNodeFlags = (treeNodeFlags & ~MASK_CHILDREN_LEN) | ((oldLen || 0) === len ? 0 : FLAG_CHILDREN_CHANGED);
        if (len === 0 && row.level >= 0) {
            if (childrenAfterGroup !== _EmptyArray) {
                row.childrenAfterGroup = _EmptyArray;
                const sibling = row.sibling;
                if (sibling) {
                    sibling.childrenAfterGroup = _EmptyArray;
                }
            }
        } else if (oldLen !== len || childrenAfterGroup === rowLeafs) {
            if (!childrenAfterGroup || childrenAfterGroup === _EmptyArray || childrenAfterGroup === rowLeafs) {
                row.childrenAfterGroup = childrenAfterGroup = new Array(len);
                const sibling = row.sibling;
                if (sibling) {
                    sibling.childrenAfterGroup = childrenAfterGroup;
                }
            } else {
                childrenAfterGroup.length = len;
            }
        }
    }

    private preprocessRows(rootNode: RowNode<TData>): number {
        const allLeafs = rootNode._leafs!;
        const allLeafsLen = allLeafs.length;
        let preprocessedCount = 0;
        let treeChanged = false;
        for (let i = 0; i < allLeafsLen; ++i) {
            let current = allLeafs[i];
            while (true) {
                const parent = current.treeParent;
                if (parent === null) {
                    break;
                }
                ++preprocessedCount;

                let parentFlags = parent.treeNodeFlags;
                const parentChildren = parent.childrenAfterGroup!;
                const indexInParent = parentFlags & MASK_CHILDREN_LEN;
                parentFlags = (parentFlags & ~MASK_CHILDREN_LEN) | (indexInParent + 1);
                if (parentFlags & FLAG_CHILDREN_CHANGED || parentChildren[indexInParent] !== current) {
                    parentFlags |= FLAG_CHILDREN_CHANGED;
                    parentChildren[indexInParent] = current; // insert into parent.childrenAfterGroup[]
                    treeChanged = true;
                }
                parent.treeNodeFlags = parentFlags;

                if (parent.data || (parent.treeNodeFlags & FLAG_MARKED_FILLER) === 0 || parent.treeParent === null) {
                    break; // Continue up only if parent is a non-processed filler
                }
                parent.treeNodeFlags = (parentFlags & ~FLAG_MARKED_FILLER) | (current.treeNodeFlags & FLAG_CHANGED); // Mark filler as processed
                current = parent;
            }
        }
        return preprocessedCount | (treeChanged ? FLAG_CHILDREN_CHANGED : 0);
    }

    private traverseRoot(rootNode: RowNode<TData>, activeChangedPath: ChangedPath | undefined): number {
        let traverseCount = 0;
        const rootChildrenAfterGroup = rootNode.childrenAfterGroup!;
        for (let i = 0, len = rootChildrenAfterGroup.length; i < len; ++i) {
            traverseCount += this.traverse(rootChildrenAfterGroup[i], 0, false, activeChangedPath);
        }
        return traverseCount & ~FLAG_CHILDREN_CHANGED;
    }

    /**
     * After all the rows are initialized and treeParent is set and childrenAfterGroup is filled,
     * we traverse the tree to finalize it
     * @returns the number of leaf nodes processed, which is used to detect cycles in the tree, and a flag set if leaf children were changed.
     */
    private traverse(
        row: RowNode<TData>,
        level: number,
        collapsed: boolean,
        activeChangedPath: ChangedPath | undefined
    ): number {
        const children = row.childrenAfterGroup!;
        const len = children.length;
        let flags = row.treeNodeFlags;

        row.treeNodeFlags = flags & FLAG_EXPANDED_INITIALIZED;
        row.level = level;

        // Update group state and children markers
        if (row.group !== !!len) {
            setRowNodeGroup(row, this.beans, !!len);
            flags |= FLAG_CHANGED;
        } else if (row.hasChildren() !== !!len) {
            row.updateHasChildren();
            flags |= FLAG_CHANGED;
        }

        if ((flags & (FLAG_CHANGED | FLAG_CHILDREN_CHANGED)) !== 0) {
            activeChangedPath?.addParentNode(row);
        }

        const canBeExpanded = len !== 0 || row.master;
        if (!canBeExpanded) {
            if (row.expanded) {
                row.expanded = false;
            }
            if ((flags & FLAG_EXPANDED_INITIALIZED) !== 0) {
                row.treeNodeFlags &= ~FLAG_EXPANDED_INITIALIZED;
            }
        } else if ((flags & FLAG_EXPANDED_INITIALIZED) === 0) {
            row.treeNodeFlags |= FLAG_EXPANDED_INITIALIZED;
            row.expanded = _getRowDefaultExpanded(this.beans, row, level); // Initialize the expanded state
        }

        if (collapsed && row.rowIndex !== null) {
            row.clearRowTopAndRowIndex(); // Mark row hidden if collapsed
        }
        collapsed ||= row.expanded === false;

        ++level; // Increment level as it is passed down to children
        flags &= FLAG_CHILDREN_CHANGED;
        for (let i = 0; i < len; ++i) {
            const child = children[i];
            const childFlags = this.traverse(child, level, collapsed, activeChangedPath);
            // Accumulates traversed nodes count and propagates children changed flag
            flags = (flags + (childFlags & ~FLAG_CHILDREN_CHANGED)) | (childFlags & FLAG_CHILDREN_CHANGED);
        }

        if (flags & FLAG_CHILDREN_CHANGED) {
            row._leafs = undefined; // Invalidate allLeafChildren cache when children changed and propagate up.
        }
        return flags + 1;
    }

    /** Handle cycles in a tree. Is not optimal for performance but this is an edge case that shouldn't happen as is a warning. */
    private handleCycles(rootNode: RowNode<TData>) {
        const marked = new Set<RowNode<TData>>();
        const mark = (row: RowNode<TData>): boolean => {
            if (marked.has(row)) {
                return false;
            }
            marked.add(row);
            for (const child of row.childrenAfterGroup!) {
                mark(child);
            }
            return true;
        };
        mark(rootNode);
        const rootChildrenAfterGroup = rootNode.childrenAfterGroup!;
        rootChildrenAfterGroup.length = 0; // Clear the array to repopulate it
        const allLeafs = rootNode._leafs!;
        for (let i = 0, allLeafsLen = allLeafs.length; i < allLeafsLen; ++i) {
            const row = allLeafs[i];
            const parent = row.treeParent;
            if (parent && mark(row)) {
                parent.treeNodeFlags |= FLAG_CHILDREN_CHANGED | FLAG_CHANGED;
                row.parent = rootNode; // Move the row to the root node
                _removeFromArray(parent.childrenAfterGroup!, row); // Remove the row from the root children
                rootChildrenAfterGroup.push(row);
                _warn(270, { id: row.id!, parentId: parent?.id ?? '' });
            } else if (parent === rootNode) {
                rootChildrenAfterGroup.push(row);
            }
        }
    }

    /** Load the tree structure for nested groups, aka children property */
    private loadNested({ rowNode: rootNode, changedRowNodes }: StageExecuteParams<TData>, fullReload: boolean): void {
        if (!fullReload && changedRowNodes) {
            for (const row of changedRowNodes.adds) {
                row.key = row.id!; // Just set the key = id in the new nodes
            }
            return;
        }

        const allLeafs = rootNode._leafs!;
        for (let i = 0, allLeafsLen = allLeafs.length; i < allLeafsLen; ++i) {
            const row = allLeafs[i];
            const id = row.id!;
            if (row.key !== id) {
                updateNodeKey(row, id);
            }
        }
    }

    /** Load the tree structure for self-referencing data, aka parentId field */
    private loadSelfRef({ rowNode: rootNode }: StageExecuteParams<TData>, reload: boolean): void {
        const allLeafs = rootNode._leafs!;
        const allLeafsLen = allLeafs.length;
        const gos = this.gos;

        if (!gos.get('getRowId')) {
            for (let i = 0; i < allLeafsLen; i++) {
                allLeafs[i].treeParent = null;
            }
            return; // Display an empty grid if getRowId missing
        }

        const rowModel = this.beans.rowModel;
        const parentIdGetter = this.parentIdGetter;
        for (let i = 0; i < allLeafsLen; i++) {
            const row = allLeafs[i];
            if (reload || row.treeNodeFlags & FLAG_CHANGED || row.treeParent?.destroyed) {
                let newParent: RowNode<TData> | null | undefined;
                const parentId = parentIdGetter?.(row.data!);
                if (parentId !== null && parentId !== undefined) {
                    newParent = rowModel.getRowNode(parentId);
                    if (!newParent) {
                        _warn(271, { id: row.id!, parentId });
                    }
                }
                row.treeParent = newParent ?? rootNode;
                const id = row.id!;
                if (row.key !== id) {
                    updateNodeKey(row, id);
                }
            } else {
                row.treeParent ??= rootNode;
            }
        }
    }

    private loadFlattened(rootNode: RowNode<TData>): void {
        const allLeafs = rootNode._leafs!;
        for (let i = 0, allLeafsLen = allLeafs.length; i < allLeafsLen; ++i) {
            const row = allLeafs[i];
            row.treeParent = rootNode; // Display all rows as children of the root node
            const id = row.id!;
            if (row.key !== id) {
                updateNodeKey(row, id);
            }
        }
    }

    /** Load the tree structure for data paths, aka getDataPath callback */
    private loadDataPath({ rowNode: rootNode }: StageExecuteParams<TData>, fullReload: boolean): void {
        const getDataPath = this.gos.get('getDataPath');
        if (!getDataPath) {
            this.loadFlattened(rootNode);
            return;
        }

        const nodesByPath = new Map<string, RowNode<TData>>();
        const paths = new Map<RowNode, string>();

        let dupPaths: DuplicatePathsMap<TData> | undefined;
        if (!fullReload) {
            dupPaths = this.loadExistingDataPath(rootNode, nodesByPath, paths);
        }

        const allLeafs = rootNode._leafs!;
        for (let i = 0, allLeafsLen = allLeafs.length; i < allLeafsLen; ++i) {
            const node = allLeafs[i];
            if (!fullReload && node.treeParent !== null && (node.treeNodeFlags & FLAG_CHANGED) === 0) {
                continue;
            }
            const path = getDataPath(node.data);
            const pathLen = path?.length;
            if (!pathLen) {
                _warn(185, { data: node.data });
                continue;
            }
            const key = path[pathLen - 1];
            if (node.key !== key) {
                updateNodeKey(node, key);
            }
            const pathKey = path.join(PATH_KEY_SEPARATOR);
            paths.set(node, pathKey); // Cache the path key for faster access
            const existing = nodesByPath.get(pathKey);
            if (existing === undefined) {
                nodesByPath.set(pathKey, node);
            } else if (existing !== node) {
                dupPaths = this.duplicatedPath(nodesByPath, dupPaths, existing, node, pathKey);
            }
        }

        if (dupPaths) {
            this.processDuplicatePaths(dupPaths, paths);
        }
        this.buildFromPaths(rootNode, nodesByPath, paths);
    }

    private loadExistingDataPath(
        rootNode: RowNode<TData>,
        nodesByPath: Map<string, RowNode<TData>>,
        paths: Map<RowNode, string>
    ): DuplicatePathsMap<TData> | undefined {
        let dupPaths: Map<string, RowNode<TData>[]> | undefined;
        const allLeafs = rootNode._leafs!;
        for (let i = 0, allLeafsLen = allLeafs.length; i < allLeafsLen; ++i) {
            const node = allLeafs[i];
            const treeParent = node.treeParent;
            if (treeParent === null || (node.treeNodeFlags & FLAG_CHANGED) !== 0) {
                continue;
            }
            let pathKey = node.key!;
            let current = treeParent;
            while (current && current !== rootNode && current !== node) {
                pathKey = PATH_KEY_SEPARATOR + pathKey;
                const existingPathKey = paths.get(current);
                if (existingPathKey !== undefined) {
                    pathKey = existingPathKey + pathKey;
                    break; // We found the path key in the parent as it was already processed
                }
                pathKey = current.key! + pathKey;
                current = current.treeParent!;
            }
            if (current !== node) {
                paths.set(node, pathKey);
                const existing = nodesByPath.get(pathKey);
                if (existing === undefined) {
                    nodesByPath.set(pathKey, node);
                } else if (existing !== node) {
                    dupPaths = this.duplicatedPath(nodesByPath, dupPaths, existing, node, pathKey);
                }
            }
        }
        return dupPaths;
    }

    private duplicatedPath<TData>(
        nodesByPath: Map<string, RowNode<TData>>,
        dupPaths: DuplicatePathsMap<TData> | undefined,
        existing: RowNode<TData>,
        node: RowNode<TData>,
        pathKey: string
    ): DuplicatePathsMap<TData> | undefined {
        if (node.sourceRowIndex < existing.sourceRowIndex) {
            nodesByPath.set(pathKey, node); // choose the node with the lowest sourceRowIndex
        }
        const duplicates = (dupPaths ??= new Map()).get(pathKey);
        if (duplicates === undefined) {
            dupPaths.set(pathKey, [existing, node]);
        } else {
            duplicates.push(node);
        }
        return dupPaths;
    }

    private buildFromPaths(
        rootNode: RowNode<TData>,
        nodesByPath: Map<string, RowNode<TData>>,
        paths: Map<RowNode, string>
    ): void {
        const segments = new Array<number>(48); // temporary array to hold the segment positions

        // Rebuild from scratch the tree structure from the path keys.
        // This approach is generally less expensive, than keeping and maintaining a map of children for each node.
        // Also, the presence of map of children per node would make some drag and drop operation impossible or very hard to maintain,
        // think about same key or empty filler nodes. We want to still allow an unconstrained drag and drop of nodes in the tree,
        // String slice is highly optimized in modern JS engines, as it will be just a view of the original string and has low GC pressure.
        const allLeafs = rootNode._leafs!;
        for (let i = 0, allLeafsLen = allLeafs.length; i < allLeafsLen; ++i) {
            const node = allLeafs[i];
            const pathKey = paths.get(node);
            if (pathKey === undefined) {
                continue; // Already processed or duplicated path
            }

            // Collect separators positions, fast string split without allocations
            const segmentsLen = this.splitPathKey(segments, pathKey);

            // Fast path: check immediate parent first (common when data is ordered or siblings processed together)
            // If found, we can skip the backward scan entirely.
            let startLevel = 0;
            let treeParent = rootNode;
            for (let level = segmentsLen - 1; level >= 0; --level) {
                const existing = nodesByPath.get(pathKey.slice(0, segments[level]));
                if (existing) {
                    treeParent = existing;
                    startLevel = level + 1;
                    break; // Found an existing node, we can start from here
                }
            }

            if (startLevel < segmentsLen) {
                treeParent = this.buildMissingFillers(
                    nodesByPath,
                    pathKey,
                    segments,
                    segmentsLen,
                    startLevel,
                    treeParent
                );
            }

            node.treeParent = treeParent;
        }
    }

    /** Collect separators positions, fast string split without allocations */
    private splitPathKey(segments: number[], pathKey: string): number {
        let segmentsLen = 0;
        let scanPos = 0;
        const pathKeyLen = pathKey.length;
        while (scanPos < pathKeyLen) {
            const sepPos = pathKey.indexOf(PATH_KEY_SEPARATOR, scanPos);
            if (sepPos === -1) {
                break;
            } // No more separators found
            segments[segmentsLen++] = sepPos;
            scanPos = sepPos + PATH_KEY_SEPARATOR_LEN;
        }
        return segmentsLen;
    }

    /** Walk forward from startLevel to segmentsLen creating missing filler nodes and return the final parent. */
    private buildMissingFillers(
        nodesByPath: Map<string, RowNode<TData>>,
        pathKey: string,
        segments: number[],
        segmentsLen: number,
        level: number,
        treeParent: RowNode<TData>
    ): RowNode<TData> {
        // Maintain a running ID prefix and the next segment index to append.
        let fillerLevel = 0;
        let fillerId = 'row-group';
        if (treeParent.sourceRowIndex < 0 && treeParent.treeParent) {
            fillerLevel = level;
            fillerId = treeParent.id!;
        }
        do {
            const start = level === 0 ? 0 : segments[level - 1] + PATH_KEY_SEPARATOR_LEN;
            const end = segments[level];
            const subPath = pathKey.slice(0, end);
            let current = nodesByPath.get(subPath);
            if (current === undefined) {
                const fillerKey = start === 0 ? subPath : pathKey.slice(start, end);
                fillerId = this.makeFillerIdBase(pathKey, segments, level, fillerId, fillerLevel) + fillerKey;
                current = this.getOrCreateFiller(fillerKey, fillerId);
                nodesByPath.set(subPath, current);
                fillerLevel = level + 1;
            } else if (current.sourceRowIndex < 0) {
                fillerId = current.id!;
                fillerLevel = level + 1; // current filler includes segment at 'level'
            }
            current.treeParent = treeParent;
            treeParent = current;
            ++level;
        } while (level < segmentsLen);
        return treeParent;
    }

    private processDuplicatePaths(duplicatePaths: Map<string, RowNode<TData>[]>, paths: Map<RowNode, string>): void {
        for (const duplicates of duplicatePaths.values()) {
            duplicates.sort(compareSourceRowIndex);
            const len = duplicates.length;
            const duplicateRowsData = new Array(len - 1);
            for (let i = 1; i < len; ++i) {
                const node = duplicates[i];
                paths.delete(node);
                node.treeParent = null;
                duplicateRowsData[i - 1] = node.data;
            }
            const first = duplicates[0];
            _warn(186, { rowId: first.id, rowData: first.data, duplicateRowsData });
        }
    }

    private getOrCreateFiller(key: string, id: string): RowNode<TData> {
        const nonLeafsById = (this.nonLeafsById ??= new Map());
        let node = nonLeafsById.get(id);
        if (node === undefined) {
            node = new RowNode<TData>(this.beans);
            node.id = id;
            node.key = key;
            node.group = true;
            node.leafGroup = false;
            node.rowGroupIndex = null;
            nonLeafsById.set(id, node);
        }
        return node;
    }

    /**
     * Build the base filler ID up to the given 'level' and include the final level separator prefix.
     * Caller should append only the 'fillerKey' after this base.
     * Result format:
     * - With no prefix and level === 0: _ROW_ID_PREFIX_ROW_GROUP + '0-'
     * - With no prefix and level > 0: _ROW_ID_PREFIX_ROW_GROUP + '0-key0-1-key1-...-(level-1)-key(level-1)-level-'
     * - With prefix present: prefixId + '-level-'
     */
    private makeFillerIdBase(
        pathKey: string,
        segments: number[],
        level: number,
        prefix: string,
        prefixLevel: number
    ): string {
        // Append intermediate segments up to level-1 (exclusive)
        while (prefixLevel < level) {
            const start = prefixLevel > 0 ? segments[prefixLevel - 1] + PATH_KEY_SEPARATOR_LEN : 0;
            const end = segments[prefixLevel];
            prefix += '-' + prefixLevel + '-' + pathKey.slice(start, end);
            ++prefixLevel;
        }
        return prefix + '-' + level + '-';
    }

    private deselectHiddenNodes(updated: boolean): void {
        const selectionSvc = this.beans.selectionSvc;
        const nodes = this.nodesToUnselect;
        const source = 'rowDataChanged';
        if (nodes) {
            this.nodesToUnselect = null; // Reset the array
            selectionSvc?.setNodesSelected({ newValue: false, nodes, suppressFinishActions: true, source });
        }
        if (nodes || updated) {
            // we do this regardless of nodes to unselect or not, as it's possible a new node was inserted,
            // so a parent that was previously selected (as all children were selected) should not be tri-state
            // (as new one unselected against all other selected children).
            selectionSvc?.updateGroupsFromChildrenSelections?.(source);
        }
        if (nodes) {
            const selectedNodes = selectionSvc?.getSelectedNodes() ?? null;
            this.eventSvc.dispatchEvent({ type: 'selectionChanged', source, selectedNodes, serverSideState: null });
        }
    }

    private hideRow(row: RowNode<TData>): void {
        if (row.isSelected()) {
            (this.nodesToUnselect ??= []).push(row); // Collect nodes to unselect
        }
        row.parent = null;
        row.group = false;
        row.treeParent = null;
        row.treeNodeFlags = 0;
        row.childrenAfterGroup = _EmptyArray;
        row._leafs = undefined;
        row._groupData = null;
        const sibling = row.sibling;
        if (sibling) {
            sibling.childrenAfterGroup = _EmptyArray;
        }
        row.updateHasChildren();
        if (row.rowIndex !== null) {
            row.clearRowTopAndRowIndex();
        }
    }

    public onShowRowGroupColsSetChanged(): void {
        const allLeafs = this.beans.rowModel.rootNode!._leafs;
        if (!allLeafs) {
            return;
        }

        for (let i = 0, len = allLeafs.length; i < len; ++i) {
            allLeafs[i]._groupData = undefined;
        }

        const fillers = this.nonLeafsById;
        if (fillers) {
            for (const rowNode of fillers.values()) {
                rowNode._groupData = undefined;
            }
        }
    }
}

const compareSourceRowIndex = <TData>(a: RowNode<TData>, b: RowNode<TData>): number =>
    a.sourceRowIndex - b.sourceRowIndex;

type DuplicatePathsMap<TData> = Map<string, RowNode<TData>[]>;

/**
 * If parent is a new filler node, copy the expanded flag from old removed parent.
 * Returns true if the expanded flag was copied.
 */
const maybeExpandFromRemovedParent = <TData>(parent: RowNode<TData>, oldParent: RowNode<TData>): boolean => {
    if (
        (oldParent.treeNodeFlags & FLAG_EXPANDED_INITIALIZED) !== 0 &&
        (parent.treeNodeFlags & FLAG_EXPANDED_INITIALIZED) === 0 &&
        parent.treeParent !== null &&
        parent.sourceRowIndex < 0
    ) {
        parent.expanded = oldParent.expanded;
        return true;
    }
    return false;
};

const updateNodeKey = (node: RowNode, key: string): void => {
    const hadData = node._groupData !== undefined;
    node.key = key;
    node.groupValue = key;
    const sibling = node.sibling;
    if (sibling) {
        sibling.key = key;
    }
    if (hadData) {
        node._groupData = undefined;
        // trigger any data change events or group will not update with the new key
        node.setData(node.data!);
    }
};
