import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { AgProvidedColumnGroup } from '../../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef } from '../../entities/colDef';
import type { ColumnEventType } from '../../events';
import type { KeptHierarchyLevels } from '../../interfaces/iGroupHierarchyColService';
import { _mergedEqual } from '../../utils/mergeDeep';
import { _createUserColumn } from '../colDefUtils';
import type { ColWrapperCache } from '../columnGroups/colWrapperCache';
import { ColumnIdAllocator } from './matching/columnIdAllocator';
import type { ColumnMatch } from './matching/columnMatcher';
import { _mergeGroupDef, matchColumns } from './matching/columnMatcher';

/** Opaque edit session over a build's leaves; enterprise splices (hierarchy, calc cols). @internal AG_GRID_INTERNAL */
export interface ColumnTreeEdit {
    commit(build: ColumnTreeBuild): void;
}

/** {@link _buildColumnTree}'s tree, spliced across one rebuild; at depth 0 `columnTree` === `columns`.
 *  @internal AG_GRID_INTERNAL */
export interface ColumnTreeBuild {
    columnTree: (AgColumn | AgProvidedColumnGroup)[];
    treeDepth: number;
    columns: AgColumn[];
    /** Every group built/reused (padding + non-padding); fed back as the next build's sweep input. */
    allGroups: AgProvidedColumnGroup[];
    marryChildren: boolean;
    /** Non-padding groups by `groupId`; the next build reuses them by id, those without one by header and position. */
    groupsById: Map<string, AgProvidedColumnGroup>;
    /** User cols by `colId`, in build order; for O(1) reuse. */
    colsById: Map<string, AgColumn>;
    /** Each `userProvidedColDef` object's first col. */
    colsByDef: Map<ColDef, AgColumn>;
    source: ColumnEventType;
    /** The user (re)set the definitions: reused cols re-apply stateful attrs ({@link AgColumn.reapplyColDef}). */
    newColDefs: boolean;
    buildToken: number;
    /** Padding-wrapper cache of the hierarchy and calc cols path; `null` for pivot result trees, which never splice. */
    wrapperCache: ColWrapperCache | null;
    /** Open edit session; null until the first splice and once the build commits it. */
    edit: ColumnTreeEdit | null;
    /** Every `columns` colId, hierarchy and calculated ones included; built on first use, as `columns` is final. */
    colIds: Set<string> | null;
}

/** Build a balanced column tree from `defs` (columns matched as Matching Columns documents), with a primary build's
 *  hierarchy and calculated columns, and destroy the nodes of `previous` it did not keep.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _buildColumnTree(
    beans: BeanCollection,
    defs: (ColDef | ColGroupDef)[],
    primaryColumns: boolean,
    previous: ColumnTreeBuild | null,
    source: ColumnEventType,
    newColDefs: boolean
): ColumnTreeBuild {
    try {
        const builder = new ColumnTreeBuilder(beans, defs, primaryColumns, previous, source, newColDefs);
        const build = builder.build();
        if (primaryColumns) {
            beans.groupHierarchyColSvc?.contributeTo(build, builder.ids, builder.keptHierarchyLevels);
            beans.calculatedColsSvc?.contributeTo(build);
        }
        finalizeColumnTree(build, previous);
        return build;
    } catch (e) {
        // a callback threw (a `dataTypeMatcher`): `previous` stays the live build, so its nodes get its token back
        if (previous !== null) {
            restampBuild(previous);
        }
        throw e;
    }
}

const restampBuild = (build: ColumnTreeBuild): void => {
    const buildToken = build.buildToken;
    const cols = build.columns;
    for (let i = 0, len = cols.length; i < len; ++i) {
        cols[i].buildToken = buildToken;
    }
    const groups = build.allGroups;
    for (let i = 0, len = groups.length; i < len; ++i) {
        groups[i].buildToken = buildToken;
    }
};

/** Commits the build's splices and destroys the nodes of `previous` it did not keep. */
const finalizeColumnTree = (build: ColumnTreeBuild, previous: ColumnTreeBuild | null): void => {
    build.edit?.commit(build);
    build.edit = null; // the build outlives this rebuild as the next one's input: free the session's nodes
    const buildToken = build.buildToken;
    build.wrapperCache?.evict(buildToken);
    if (previous === null) {
        return;
    }
    // By the flat lists: they reach orphans `.children` misses.
    const prevCols = previous.columns;
    for (let i = 0, len = prevCols.length; i < len; ++i) {
        const col = prevCols[i];
        if (col.buildToken !== buildToken && col.isAlive()) {
            col.buildToken = buildToken; // isSameCol tells it from a column this build created
            col.destroy();
        }
    }
    const prevGroups = previous.allGroups;
    for (let i = 0, len = prevGroups.length; i < len; ++i) {
        const group = prevGroups[i];
        if (group.buildToken !== buildToken && group.isAlive()) {
            group.destroy();
        }
    }
};

/** One build: the columns the matcher gave each leaf, updated or created in def order, in their groups and padding. */
class ColumnTreeBuilder {
    /** The build's ids, for the hierarchy columns spliced in after it. */
    public readonly ids: ColumnIdAllocator;
    /** The hierarchy levels the build keeps; `null` without hierarchy columns. */
    public keptHierarchyLevels: KeptHierarchyLevels | null = null;
    private readonly matched: ColumnMatch;
    private readonly prevGroupsById: ReadonlyMap<string, AgProvidedColumnGroup> | undefined;
    private readonly defaultColGroupDef: Readonly<Partial<ColGroupDef>> | undefined;
    // Stateless padded groups share one colGroupDef ref; the cast is safe (padding owns its own `children`).
    private readonly paddingDef: ColGroupDef | null;
    /** The build being made, written as it goes; at depth 0 its `columnTree` is its `columns`. */
    private readonly result: ColumnTreeBuild;
    private leafIndex = 0;
    private anonymousGroupIndex = 0;

    public constructor(
        private readonly beans: BeanCollection,
        private readonly defs: (ColDef | ColGroupDef)[],
        private readonly primaryColumns: boolean,
        previous: ColumnTreeBuild | null,
        source: ColumnEventType,
        newColDefs: boolean
    ) {
        const colModel = beans.colModel;
        const defaultColGroupDef = beans.gos.get('defaultColGroupDef');
        this.prevGroupsById = previous?.groupsById;
        this.defaultColGroupDef = defaultColGroupDef;
        const paddingDef =
            defaultColGroupDef?.groupId === undefined
                ? defaultColGroupDef
                : { ...defaultColGroupDef, groupId: undefined };
        this.paddingDef = (paddingDef ?? null) as ColGroupDef | null;
        const ids = new ColumnIdAllocator(colModel.colsById, previous?.buildToken, colModel.nextBuildToken());
        this.ids = ids;
        const matched = matchColumns(beans, ids, previous, defaultColGroupDef, defs);
        this.matched = matched;
        const columns: AgColumn[] = [];
        this.result = {
            columnTree: columns,
            treeDepth: matched.treeDepth,
            columns,
            allGroups: [],
            marryChildren: false,
            groupsById: new Map(),
            colsById: new Map(),
            colsByDef: new Map(),
            source,
            newColDefs,
            buildToken: ids.buildToken,
            wrapperCache: primaryColumns ? colModel.hierarchyWrapperCache : null,
            edit: null,
            colIds: null,
        };
    }

    public build(): ColumnTreeBuild {
        const { defs, matched, result } = this;
        const hierarchyColSvc = this.primaryColumns ? this.beans.groupHierarchyColSvc : undefined;
        if (hierarchyColSvc?.columns.length) {
            // Before any new column or group allocates, so a kept level's id does not depend on where they sit.
            this.keptHierarchyLevels = hierarchyColSvc.reserveKeptLevels(
                matched.leafDefs,
                matched.leafClaims,
                this.ids
            );
        }
        if (matched.treeDepth === 0) {
            const columns = result.columns;
            const len = defs.length;
            for (let i = 0; i < len; ++i) {
                const col = this.buildColumn();
                if (col === undefined) {
                    continue; // removed leaf: never built
                }
                col.originalParent = null;
                columns.push(col);
            }
            return result;
        }

        const ids = this.ids;
        // Reserve each kept column's padding group ids, unless a definition's id or field claims one (rebuilt then).
        const { leafClaims, treeDepth } = matched;
        for (let i = 0, len = leafClaims.length; i < len; ++i) {
            const kept = leafClaims[i];
            const innermost = kept ? innermostPaddingHead(kept, treeDepth) : null;
            if (innermost === null || ids.held.get(innermost.groupId) === innermost) {
                continue; // no chain, or one shared by several leaves: reserved by the first
            }
            let node: AgProvidedColumnGroup | null = innermost;
            while (node?.padding && !ids.isUserKey(node.groupId)) {
                node = node.originalParent;
            }
            if (node?.padding) {
                continue;
            }
            for (node = innermost; node?.padding; node = node.originalParent) {
                ids.held.set(node.groupId, node);
            }
        }

        const paddingDef = this.paddingDef;
        if (paddingDef) {
            this.beans.gos.validateColDef(paddingDef, '');
        }

        result.columnTree = this.buildSubtree(defs, 0, null);
        return result;
    }

    /** The next leaf: its matched column, else a new one at its key, free suffix or position; `undefined`: dropped. */
    private buildColumn(): AgColumn | undefined {
        const index = this.leafIndex++;
        const { matched, result } = this;
        const def = matched.leafDefs[index];
        if (def === null) {
            return undefined; // dropped (e.g. a column the user deleted): never built
        }
        let column = matched.leafClaims[index];
        const colId = def.colId;
        if (column === undefined) {
            const ids = this.ids;
            const base = colId ?? def.field;
            const id = ids.allocate(base, colId == null);
            column = _createUserColumn(this.beans, def, id, this.primaryColumns, ids.buildToken);
            if (id !== base) {
                column.markIdGenerated();
            }
        } else {
            // reapplied here, not when the matcher claimed it, so columns update in definition order
            const merged = this.keptHierarchyLevels?.get(column)?.mergedDef;
            column.reapplyColDef(def, result.source, result.newColDefs, merged);
        }
        const id = column.colId;
        result.colsById.set(id, column);
        const colsByDef = result.colsByDef;
        if (!colsByDef.has(def)) {
            colsByDef.set(def, column);
        }
        if (colId != null && id !== colId) {
            this.beans.log.warn(273, { providedId: colId, usedId: id });
        }
        return column;
    }

    /** Reuse `col`'s padding chain up to `level` when no id in it is taken or claimed by a definition's id or field. */
    private tryReusePaddingChain(
        col: AgColumn,
        level: number,
        parent: AgProvidedColumnGroup | null,
        payload: AgColumn[] | null
    ): AgProvidedColumnGroup | null {
        const ids = this.ids;
        const buildToken = ids.buildToken;
        const innermost = innermostPaddingHead(col, this.matched.treeDepth);
        if (innermost === null || innermost.buildToken === buildToken) {
            return null;
        }
        let top = innermost;
        while (true) {
            const groupId = top.groupId;
            if (ids.held.get(groupId) !== top && (ids.isHeld(groupId) || ids.isUserKey(groupId))) {
                return null;
            }
            if (top.level === level) {
                break;
            }
            const up = top.originalParent;
            if (!up?.padding) {
                return null;
            }
            top = up;
        }
        const allGroups = this.result.allGroups;
        // Outermost first, as a new chain is listed: the group state keeps its order across a rebuild.
        for (let node = top; ; node = node.children[0] as AgProvidedColumnGroup) {
            node.buildToken = buildToken;
            ids.held.set(node.groupId, node);
            allGroups.push(node);
            if (node === innermost) {
                break;
            }
        }
        top.originalParent = parent;
        if (payload !== null) {
            innermost.children = payload;
        } else if (innermost.children.length !== 1) {
            innermost.children = [col]; // it was shared: the others left
        }
        return top;
    }

    /** Wrap `payload` in synthetic padded groups from `level` up to `maxDepth`; returns the OUTERMOST. */
    private buildPaddedChain(
        level: number,
        parent: AgProvidedColumnGroup | null,
        payload: AgColumn[]
    ): AgProvidedColumnGroup {
        const { ids, paddingDef } = this;
        const allGroups = this.result.allGroups;
        const treeDepth = this.matched.treeDepth;
        const context = this.beans.context;
        let outer: AgProvidedColumnGroup | undefined;
        let current: AgProvidedColumnGroup | undefined;
        for (let j = level; j < treeDepth; ++j) {
            const padded = new AgProvidedColumnGroup(paddingDef, ids.allocatePadded(), true, j);
            context.createBean(padded);
            allGroups.push(padded);
            if (current) {
                current.children = [padded];
                padded.originalParent = current;
            } else {
                padded.originalParent = parent;
                outer = padded;
            }
            current = padded;
        }
        const innermost = current!;
        innermost.children = payload;
        for (let i = 0, n = payload.length; i < n; ++i) {
            payload[i].originalParent = innermost;
        }
        return outer!;
    }

    /** A group def's group: the old one the matcher kept or at its groupId when reusable, else a new one (taking the
     *  open state of the old one paired with it, or at its id); its children built under it. */
    private buildGroup(
        groupDef: ColGroupDef,
        level: number,
        parent: AgProvidedColumnGroup | null
    ): AgProvidedColumnGroup {
        const { beans, defaultColGroupDef, ids, result } = this;
        const userGroupId = groupDef.groupId;
        const merged = _mergeGroupDef(groupDef, defaultColGroupDef);
        let prior: AgProvidedColumnGroup | undefined;
        let reused: AgProvidedColumnGroup | null;
        let renamed = false;
        if (userGroupId == null) {
            prior = this.matched.anonymousGroupPriors?.[this.anonymousGroupIndex++];
            reused = prior?.buildToken === ids.buildToken ? prior : null;
        } else {
            const candidate = this.prevGroupsById?.get(userGroupId);
            const previousDef = candidate?.colGroupDef;
            // a rename alone keeps the group, its header refreshed in place as a column's is
            renamed =
                previousDef != null &&
                merged.headerName !== previousDef.headerName &&
                _mergedEqual({ ...merged, headerName: previousDef.headerName }, previousDef, 'children');
            // A claimed id is held, so a candidate is reused once; rejected, its stale `buildToken` gets it destroyed.
            reused =
                candidate && !ids.held.has(userGroupId) && (renamed || _mergedEqual(merged, previousDef, 'children'))
                    ? candidate
                    : null;
            if (reused) {
                reused.buildToken = ids.buildToken;
                ids.held.set(userGroupId, null);
            }
        }
        let group: AgProvidedColumnGroup;
        if (reused) {
            reused.level = level;
            // Refresh def ref so `getColGroupDef().children` reflects current children (excluded from compare).
            reused.colGroupDef = merged;
            group = reused;
            if (renamed) {
                // only its header cell refreshes the name, as on a header name override
                reused.dispatchGroupEvent('headerNameChanged');
            }
        } else {
            const groupId = ids.allocate(userGroupId, false);
            if (userGroupId != null && groupId !== userGroupId) {
                beans.log.warn(273, { providedId: userGroupId, usedId: groupId });
            }
            beans.gos.validateColDef(merged, groupId);
            group = new AgProvidedColumnGroup(merged, groupId, false, level);
            beans.context.createBean(group);
        }
        group.originalParent = parent;
        group.children = this.buildSubtree(groupDef.children, level + 1, group);
        group.setExpandable();
        if (reused === null) {
            const atId = userGroupId == null ? undefined : this.prevGroupsById?.get(group.groupId);
            // a group with groupId takes the open state of the old group its groupId built at its id
            const old = atId !== undefined && atId.colGroupDef?.groupId === userGroupId ? atId : prior;
            if (old !== undefined) {
                group.setExpanded(old.expanded);
            }
        }
        result.marryChildren ||= !!merged.marryChildren;
        result.groupsById.set(group.groupId, group);
        result.allGroups.push(group);
        return group;
    }

    /** The nodes `defs` build at `level` under `parent`, each leaf above the tree's depth wrapped in padding groups. */
    private buildSubtree(
        defs: (ColDef | ColGroupDef)[],
        level: number,
        parent: AgProvidedColumnGroup | null
    ): (AgColumn | AgProvidedColumnGroup)[] {
        const len = defs.length;
        const columns = this.result.columns;
        const needsPadding = level < this.matched.treeDepth;
        // All-leaves shortcut: one shared padded chain instead of one chain per col.
        if (needsPadding) {
            let leaves = 0;
            while (leaves < len && (defs[leaves] as ColGroupDef).children === undefined) {
                ++leaves;
            }
            if (leaves === len) {
                const wrapped: AgColumn[] = [];
                // Reuse the chain only when every col still shares one innermost padding (`null` once two differ).
                let shared: AgProvidedColumnGroup | null | undefined;
                for (let i = 0; i < len; ++i) {
                    const col = this.buildColumn();
                    if (col === undefined) {
                        continue; // removed leaf: never built
                    }
                    columns.push(col);
                    wrapped.push(col);
                    const innermost = col.originalParent;
                    shared = shared === undefined || shared === innermost ? innermost : null;
                }
                if (shared === undefined) {
                    return wrapped; // every leaf removed — nothing to wrap (empty array)
                }
                const reusedTop = shared ? this.tryReusePaddingChain(wrapped[0], level, parent, wrapped) : null;
                return [reusedTop ?? this.buildPaddedChain(level, parent, wrapped)];
            }
        }
        const result: (AgColumn | AgProvidedColumnGroup)[] = [];
        for (let i = 0; i < len; ++i) {
            const def = defs[i];
            if ((def as ColGroupDef).children) {
                result.push(this.buildGroup(def as ColGroupDef, level, parent));
                continue;
            }
            const col = this.buildColumn();
            if (col === undefined) {
                continue; // removed leaf: never built
            }
            columns.push(col);
            if (needsPadding) {
                // Naked col in a mixed level — pad under its own chain to preserve def order.
                result.push(
                    this.tryReusePaddingChain(col, level, parent, null) ?? this.buildPaddedChain(level, parent, [col])
                );
            } else {
                col.originalParent = parent;
                result.push(col);
            }
        }
        return result;
    }
}

const innermostPaddingHead = (col: AgColumn, maxDepth: number): AgProvidedColumnGroup | null => {
    const node = col.originalParent;
    return node != null && node.padding && node.level === maxDepth - 1 ? node : null;
};
