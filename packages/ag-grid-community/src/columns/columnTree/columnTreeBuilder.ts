import { _pushToMapArray } from 'ag-stack';

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
import type { ColumnMatch, Keyed } from './matching/columnMatcher';
import { _mergeGroupDef, addKeyed, matchByKey, matchColumns, newKeyed } from './matching/columnMatcher';

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
    /** A colDef object's cols after its first, in build order; `null` unless one object built several. */
    laterColsByDef: Map<ColDef, AgColumn[]> | null;
    /** Cols built from a colId at another id (a duplicate, or one a group took), in build order; `null` if none. */
    laterColsByColId: Map<string, AgColumn[]> | null;
    /** The build's ids, for the hierarchy columns spliced in after it; `null` once `_finalizeColumnTree` ran. */
    ids: ColumnIdAllocator | null;
    /** The hierarchy levels the build keeps; `null` without hierarchy columns, and once `_finalizeColumnTree` ran. */
    keptHierarchyLevels: KeptHierarchyLevels | null;
    source: ColumnEventType;
    /** The user (re)set the definitions: reused cols re-apply stateful attrs ({@link AgColumn.reapplyColDef}). */
    newColDefs: boolean;
    buildToken: number;
    /** Padding-wrapper cache of the hierarchy and calc cols path; `null` for pivot result trees, which never splice. */
    wrapperCache: ColWrapperCache | null;
    /** Open edit session; null until the first splice and once `_finalizeColumnTree` commits it. */
    edit: ColumnTreeEdit | null;
}

/** Build a balanced column tree from `defs`, reusing columns as Matching Columns documents, groups by groupId, else by
 *  header and position.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _buildColumnTree(
    beans: BeanCollection,
    defs: (ColDef | ColGroupDef)[],
    primaryColumns: boolean,
    previous: ColumnTreeBuild | null,
    source: ColumnEventType,
    newColDefs: boolean,
    wrapperCache: ColWrapperCache | null
): ColumnTreeBuild {
    return new ColumnTreeBuilder(beans, defs, primaryColumns, previous, source, newColDefs, wrapperCache).build();
}

/** Commits the build's splices and destroys the nodes of `previous` it did not keep.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _finalizeColumnTree = (build: ColumnTreeBuild, previous: ColumnTreeBuild | null): void => {
    build.edit?.commit(build);
    build.edit = null; // the build outlives this rebuild as the next one's input: free the session's nodes
    build.ids = null;
    build.keptHierarchyLevels = null;
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
    private readonly ids: ColumnIdAllocator;
    private readonly matched: ColumnMatch;
    private readonly prevGroupsById: Map<string, AgProvidedColumnGroup> | undefined;
    private readonly defaultColGroupDef: Partial<ColGroupDef> | undefined;
    // Stateless padded groups share one colGroupDef ref; the cast is safe (padding owns its own `children`).
    private readonly paddingDef: ColGroupDef | null;
    private readonly columns: AgColumn[] = [];
    private readonly allGroups: AgProvidedColumnGroup[] = [];
    private hasMarryChildren = false;
    private readonly colsById = new Map<string, AgColumn>();
    private readonly colsByDef = new Map<ColDef, AgColumn>();
    private laterColsByDef: Map<ColDef, AgColumn[]> | null = null;
    private keptHierarchyLevels: KeptHierarchyLevels | null = null;
    private laterColsByColId: Map<string, AgColumn[]> | null = null;
    private readonly groupsById = new Map<string, AgProvidedColumnGroup>();
    private leafIndex = 0;
    private anonymousGroupIndex = 0;
    // Groups with groupId the build did not reuse, each after its children, as old groups are listed.
    private recreatedGroups: Keyed<AgProvidedColumnGroup> | undefined = undefined;

    public constructor(
        private readonly beans: BeanCollection,
        private readonly defs: (ColDef | ColGroupDef)[],
        private readonly primaryColumns: boolean,
        previous: ColumnTreeBuild | null,
        private readonly source: ColumnEventType,
        private readonly newColDefs: boolean,
        private readonly wrapperCache: ColWrapperCache | null
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
        this.matched = matchColumns(beans, ids, previous, defaultColGroupDef, defs);
    }

    public build(): ColumnTreeBuild {
        const { defs, matched } = this;
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
            // Flat case: `columnTree` and `columns` share one array.
            const columns = this.columns;
            const len = defs.length;
            for (let i = 0; i < len; ++i) {
                const col = this.buildColumn();
                if (col === undefined) {
                    continue; // removed leaf: never built
                }
                col.originalParent = null;
                columns.push(col);
            }
            return this.result(columns);
        }

        const ids = this.ids;
        ids.endPositionalIds(matched.positionalIdCount);
        // Reserve each kept column's padding group ids, unless one is now a user or positional id (rebuilt then).
        const { leafClaims, treeDepth } = matched;
        for (let i = 0, len = leafClaims.length; i < len; ++i) {
            const kept = leafClaims[i];
            const innermost = kept ? innermostPaddingHead(kept, treeDepth) : null;
            if (innermost === null || ids.paddingOwner(innermost.groupId) === innermost) {
                continue; // no chain, or one shared by several leaves: reserved by the first
            }
            let node: AgProvidedColumnGroup | null = innermost;
            while (node?.padding && !ids.isNowUserOrPositionalId(node.groupId)) {
                node = node.originalParent;
            }
            if (node?.padding) {
                continue;
            }
            for (node = innermost; node?.padding; node = node.originalParent) {
                ids.reserve(node.groupId, node);
            }
        }

        const paddingDef = this.paddingDef;
        if (paddingDef) {
            this.beans.gos.validateColDef(paddingDef, '');
        }

        const columnTree = this.buildSubtree(defs, 0, null);
        const recreatedGroups = this.recreatedGroups;
        if (recreatedGroups !== undefined) {
            // The n-th old group built from its groupId and not reused, as duplicate colIds take columns.
            const olds = newKeyed<AgProvidedColumnGroup>();
            const buildToken = ids.buildToken;
            for (const group of this.prevGroupsById!.values()) {
                const builtFrom = group.colGroupDef?.groupId;
                if (builtFrom != null && group.buildToken !== buildToken) {
                    addKeyed(olds, group, builtFrom);
                }
            }
            const priors = matchByKey(olds, recreatedGroups, false, false);
            const groups = recreatedGroups.items;
            for (let k = 0, len = priors.length; k < len; ++k) {
                const prior = priors[k];
                if (prior) {
                    groups[k]!.setExpanded(prior.expanded); // a prior pairs only with an open slot, which has its group
                }
            }
        }
        return this.result(columnTree);
    }

    private result(columnTree: (AgColumn | AgProvidedColumnGroup)[]): ColumnTreeBuild {
        const ids = this.ids;
        return {
            columnTree,
            treeDepth: this.matched.treeDepth,
            columns: this.columns,
            allGroups: this.allGroups,
            marryChildren: this.hasMarryChildren,
            groupsById: this.groupsById,
            colsById: this.colsById,
            colsByDef: this.colsByDef,
            laterColsByDef: this.laterColsByDef,
            laterColsByColId: this.laterColsByColId,
            ids,
            keptHierarchyLevels: this.keptHierarchyLevels,
            source: this.source,
            newColDefs: this.newColDefs,
            buildToken: ids.buildToken,
            wrapperCache: this.wrapperCache,
            edit: null,
        };
    }

    /** The next leaf: its matched column, else a new one at its key, free suffix or position; `undefined`: dropped. */
    private buildColumn(): AgColumn | undefined {
        const index = this.leafIndex++;
        const matched = this.matched;
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
            column.reapplyColDef(def, this.source, this.newColDefs, this.keptHierarchyLevels?.mergedDefs.get(index));
        }
        const id = column.colId;
        this.colsById.set(id, column);
        const colsByDef = this.colsByDef;
        if (!colsByDef.has(def)) {
            colsByDef.set(def, column);
        } else {
            this.laterColsByDef ??= new Map();
            _pushToMapArray(this.laterColsByDef, def, column);
        }
        if (colId != null && id !== colId) {
            this.beans.log.warn(273, { providedId: colId, usedId: id });
            this.laterColsByColId ??= new Map();
            _pushToMapArray(this.laterColsByColId, colId, column);
        }
        return column;
    }

    /** Reuse `col`'s padding chain up to `level` when no id in it is taken or is now a user or positional id. */
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
            if (ids.paddingOwner(groupId) !== top && (ids.isHeld(groupId) || ids.isNowUserOrPositionalId(groupId))) {
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
        const allGroups = this.allGroups;
        // Outermost first, as a new chain is listed: the group state keeps its order across a rebuild.
        for (let node = top; ; node = node.children[0] as AgProvidedColumnGroup) {
            node.buildToken = buildToken;
            ids.reserve(node.groupId, node);
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
        const { ids, paddingDef, allGroups } = this;
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
     *  open state of the old one paired with it); its children built under it. */
    private buildGroup(
        groupDef: ColGroupDef,
        level: number,
        parent: AgProvidedColumnGroup | null
    ): AgProvidedColumnGroup {
        const { beans, defaultColGroupDef, ids } = this;
        const userGroupId = groupDef.groupId;
        const merged = _mergeGroupDef(groupDef, defaultColGroupDef);
        let prior: AgProvidedColumnGroup | undefined;
        let reused: AgProvidedColumnGroup | null;
        if (userGroupId == null) {
            prior = this.matched.anonymousGroupPriors?.[this.anonymousGroupIndex++];
            reused = prior?.buildToken === ids.buildToken ? prior : null;
        } else {
            const candidate = this.prevGroupsById?.get(userGroupId);
            // A claimed id is held, so a candidate is reused once; rejected, its stale `buildToken` gets it destroyed.
            reused =
                candidate && !ids.isHeld(userGroupId) && _mergedEqual(merged, candidate.colGroupDef, 'children')
                    ? candidate
                    : null;
            if (reused) {
                reused.buildToken = ids.buildToken;
                ids.reserve(userGroupId, null);
            }
        }
        let group: AgProvidedColumnGroup;
        if (reused) {
            reused.level = level;
            // Refresh def ref so `getColGroupDef().children` reflects current children (excluded from compare).
            reused.colGroupDef = merged;
            group = reused;
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
        if (reused === null && prior !== undefined) {
            group.setExpanded(prior.expanded);
        } else if (reused === null && userGroupId != null && this.prevGroupsById) {
            this.recreatedGroups ??= newKeyed();
            addKeyed(this.recreatedGroups, group, userGroupId);
        }
        this.hasMarryChildren ||= !!merged.marryChildren;
        this.groupsById.set(group.groupId, group);
        this.allGroups.push(group);
        return group;
    }

    /** The nodes `defs` build at `level` under `parent`, each leaf above the tree's depth wrapped in padding groups. */
    private buildSubtree(
        defs: (ColDef | ColGroupDef)[],
        level: number,
        parent: AgProvidedColumnGroup | null
    ): (AgColumn | AgProvidedColumnGroup)[] {
        const len = defs.length;
        const columns = this.columns;
        const needsPadding = level < this.matched.treeDepth;
        // All-leaves shortcut: one shared padded chain instead of one chain per col.
        if (needsPadding) {
            let allLeaves = true;
            for (let i = 0; i < len; ++i) {
                if ((defs[i] as ColGroupDef).children !== undefined) {
                    allLeaves = false;
                    break;
                }
            }
            if (allLeaves) {
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
