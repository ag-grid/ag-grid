import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import { _mergedEqual } from '../utils/mergeDeep';
import { _createUserColumn } from './colDefUtils';
import type { ColWrapperCache } from './columnGroups/colWrapperCache';

/** Opaque edit session over a build's leaves; splicing is enterprise-only (hierarchy/calc cols).
 *  Community only calls {@link commit} from `finalizeColumnTree`. @internal AG_GRID_INTERNAL */
export interface ColumnTreeEdit {
    commit(build: ColumnTreeBuild): void;
}

/** Result of {@link _buildColumnTree}; the mutable tree spliced across one rebuild, emitted by
 *  `finalizeColumnTree`. At depth 0 `columnTree` === `columns`. @internal AG_GRID_INTERNAL */
export interface ColumnTreeBuild {
    columnTree: (AgColumn | AgProvidedColumnGroup)[];
    treeDepth: number;
    columns: AgColumn[];
    /** Every group built/reused (padding + non-padding); fed back as the next build's sweep input. */
    allGroups: AgProvidedColumnGroup[];
    marryChildren: boolean;
    /** Non-padding groups by `groupId`; fed back as next call's `existingGroupsById`. */
    groupsById: Map<string, AgProvidedColumnGroup>;
    /** Cols keyed by `colId` / `userProvidedColDef` ref / `field`; for O(1) reuse. */
    colsByKey: Map<string | ColDef, AgColumn>;
    source: ColumnEventType;
    /** True = user (re)set the definitions, so reused cols re-apply stateful attrs; see {@link AgColumn.reapplyColDef}. */
    newColDefs: boolean;
    buildToken: number;
    /** Padding-wrapper cache for the editable (hierarchy/calc) path; `null` for pivot result trees
     *  (a one-shot build that never splices). */
    wrapperCache: ColWrapperCache | null;
    /** Open edit session; null until the first splice. */
    edit?: ColumnTreeEdit | null;
}

/** Build a balanced column tree from `defs`, reusing cols/groups by colId / field / userColDef ref /
 *  groupId. Id allocation is deterministic (master/slave grids produce identical ids). Static calc-col
 *  overrides ({@link ICalculatedColumnsService.overrideFor}) drop/replace a leaf mid-build, never its group.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _buildColumnTree(
    beans: BeanCollection,
    defs: (ColDef | ColGroupDef)[] | null | undefined,
    primaryColumns: boolean,
    existingGroupsById: Map<string, AgProvidedColumnGroup>,
    existingColsByKey: Map<string | ColDef, AgColumn>,
    existingColsById: { readonly [id: string]: AgColumn },
    source: ColumnEventType,
    newColDefs: boolean,
    buildToken: number,
    wrapperCache: ColWrapperCache | null
): ColumnTreeBuild {
    const { context, dataTypeSvc, gos, calculatedColsSvc } = beans;
    const defaultColGroupDef = gos.get('defaultColGroupDef');
    // Stateless padded groups share one colGroupDef ref; the cast is safe (padding owns its own `children`).
    const paddingDef = (defaultColGroupDef ?? null) as ColGroupDef | null;
    // Reserved = ids allocated this call + every live colId (primary / pivot / service / hierarchy).
    const allocatedKeys = new Set<string>();
    const reservedUserKeys = new Set<string>();
    const isReserved = (id: string): boolean => allocatedKeys.has(id) || id in existingColsById;

    // Pre-walk for maxDepth + anonymous-slot count. Padded ids start AFTER anonymous-col ids
    // (`'0'..'<N-1>'` vs `'<N>'+`) so the streams stay disjoint — needed for master/slave determinism.
    let treeDepth = 0;
    let paddedIdHint = 0;
    if (defs) {
        const measure = (nodes: (ColDef | ColGroupDef)[], level: number): void => {
            if (level > treeDepth) {
                treeDepth = level;
            }
            for (let i = 0, len = nodes.length; i < len; ++i) {
                const def = nodes[i];
                const childDefs = (def as ColGroupDef).children;
                if (childDefs) {
                    if ((def as ColGroupDef).groupId == null) {
                        ++paddedIdHint;
                    }
                    measure(childDefs, level + 1);
                } else {
                    const base = (def as ColDef).colId ?? (def as ColDef).field;
                    if (base == null) {
                        ++paddedIdHint;
                    } else {
                        reservedUserKeys.add(base);
                    }
                }
            }
        };
        measure(defs, 0);

        // Reserve reusable padding-chain ids before any allocation: a reused chain keeps its prior id, so a
        // fresh group must not be handed it (keeps allocation collision-free regardless of def order).
        if (treeDepth > 0) {
            const reserveReusedPaddingIds = (nodes: (ColDef | ColGroupDef)[]): void => {
                for (let i = 0, len = nodes.length; i < len; ++i) {
                    const def = nodes[i];
                    const childDefs = (def as ColGroupDef).children;
                    if (childDefs) {
                        reserveReusedPaddingIds(childDefs);
                        continue;
                    }
                    const colDef = def as ColDef;
                    const existing = existingColsByKey.get(colDef.colId ?? colDef.field ?? def);
                    let node = existing ? innermostPaddingHead(existing, treeDepth) : null;
                    while (node?.padding) {
                        allocatedKeys.add(node.groupId);
                        node = node.originalParent;
                    }
                }
            };
            reserveReusedPaddingIds(defs);
        }
    }

    let userIdHint = 0;
    const getUniqueKey = (groupId: string | null | undefined): string => {
        let id: string;
        if (groupId == null) {
            do {
                id = `${userIdHint++}`;
            } while (isReserved(id) || reservedUserKeys.has(id));
            allocatedKeys.add(id);
            return id;
        }
        if (!isReserved(groupId)) {
            allocatedKeys.add(groupId);
            return groupId;
        }
        let count = 1;
        do {
            id = `${groupId}_${count++}`;
        } while (isReserved(id));
        beans.log.warn(273, { providedId: groupId, usedId: id });
        allocatedKeys.add(id);
        return id;
    };

    const columns: AgColumn[] = [];
    // The next build's sweep walks this rather than `.children`, which would miss orphans when a
    // parent's array was replaced.
    const allGroups: AgProvidedColumnGroup[] = [];
    let hasMarryChildren = false;
    const newColsByKey = new Map<string | ColDef, AgColumn>();

    const isReusableUserCol = (col: AgColumn): boolean =>
        col.colKind === 'user' && col.primary === primaryColumns && col.buildToken !== buildToken;

    /** Reuse/create an anonymous leaf (no colId/field) after the ref missed. Positional reuse on the
     *  `userIdHint` stream keeps a recreated `{...}` def on its id instead of drifting (losing state). */
    const buildAnonymousColumn = (def: ColDef): AgColumn => {
        while (true) {
            const id = `${userIdHint++}`;
            if (allocatedKeys.has(id) || reservedUserKeys.has(id)) {
                continue;
            }
            const existing = existingColsById[id];
            if (existing !== undefined) {
                const userDef = existing.userProvidedColDef;
                if (isReusableUserCol(existing) && userDef && userDef.colId == null && userDef.field == null) {
                    allocatedKeys.add(id);
                    existing.buildToken = buildToken;
                    existing.reapplyColDef(def, source, newColDefs);
                    return existing;
                }
                continue;
            }
            allocatedKeys.add(id);
            return _createUserColumn(beans, def, id, primaryColumns, buildToken);
        }
    };

    /** Reuse/create a keyed (`colId`/`field`) leaf after the ref missed: key for the unique case, else a
     *  positional scan so a replaced-ref duplicate keeps its state. `buildToken` skips a claimed col. */
    const buildKeyedColumn = (def: ColDef, colId: string | undefined, field: string | undefined): AgColumn => {
        const base = colId ?? field!;
        const keyed = existingColsByKey.get(base);
        if (keyed?.colId === base && isReusableUserCol(keyed)) {
            keyed.buildToken = buildToken;
            keyed.reapplyColDef(def, source, newColDefs);
            return keyed;
        }
        let count = 0;
        while (true) {
            const id = count === 0 ? base : `${base}_${count}`;
            count++;
            if (allocatedKeys.has(id)) {
                continue;
            }
            const existing = existingColsById[id];
            if (existing !== undefined) {
                const existingDef = existing.userProvidedColDef;
                const existingBase = existingDef ? (existingDef.colId ?? existingDef.field) : null;
                if (existingBase !== base || !isReusableUserCol(existing)) {
                    continue; // a different col owns this id, it's already claimed, or it's not a reusable user col
                }
            }
            allocatedKeys.add(id);
            if (colId != null && id !== colId) {
                beans.log.warn(273, { providedId: colId, usedId: id }); // colId collided; suffixed
            }
            if (existing !== undefined) {
                existing.buildToken = buildToken;
                existing.reapplyColDef(def, source, newColDefs);
                return existing;
            }
            return _createUserColumn(beans, def, id, primaryColumns, buildToken);
        }
    };

    /** Build/reuse a leaf for `def` (or `undefined` if a calc-col override dropped it). Identity is the
     *  `colId` when present (reuse only the same-colId column — a changed colId is a new column even on a
     *  retained colDef ref); without a colId it is the colDef ref, then field/positional in buildKeyedColumn. */
    const buildColumn = (def: ColDef): AgColumn | undefined => {
        const override = calculatedColsSvc?.overrideFor(def);
        if (override === null) {
            return undefined; // dropped (e.g. a calc col the user deleted): never built
        }
        if (override !== undefined) {
            def = override;
        }
        const colId = def.colId;
        let column: AgColumn | undefined;
        if (colId != null) {
            const byId = existingColsByKey.get(colId);
            column = byId?.colId === colId && isReusableUserCol(byId) ? byId : undefined;
        } else {
            const byRef = existingColsByKey.get(def);
            column = byRef !== undefined && isReusableUserCol(byRef) ? byRef : undefined;
        }
        if (column !== undefined) {
            column.buildToken = buildToken;
            column.reapplyColDef(def, source, newColDefs);
        } else {
            const field = def.field;
            column = colId == null && field == null ? buildAnonymousColumn(def) : buildKeyedColumn(def, colId, field);
        }
        // Hierarchy / service cols have no `userProvidedColDef` and are never looked up by ref / field.
        const userDef = column.userProvidedColDef;
        if (userDef) {
            newColsByKey.set(column.colId, column);
            if (!newColsByKey.has(userDef)) {
                newColsByKey.set(userDef, column);
            }
            const userField = userDef.field;
            if (userField && !newColsByKey.has(userField)) {
                newColsByKey.set(userField, column);
            }
        }
        dataTypeSvc?.addColumnListeners(column);
        return column;
    };

    // Non-padding groups by `groupId`; exposed via ColumnModel for group-lookup hot paths.
    const newGroupsById = new Map<string, AgProvidedColumnGroup>();

    if (treeDepth === 0) {
        // Flat case: `columnTree` and `columns` share one array.
        const flat: AgColumn[] = [];
        const len = defs?.length ?? 0;
        for (let i = 0; i < len; ++i) {
            const col = buildColumn(defs![i] as ColDef);
            if (col === undefined) {
                continue; // removed leaf: never built
            }
            col.originalParent = null;
            flat.push(col);
        }
        return {
            columnTree: flat,
            treeDepth: 0,
            columns: flat,
            allGroups,
            marryChildren: false,
            groupsById: newGroupsById,
            colsByKey: newColsByKey,
            source,
            newColDefs,
            buildToken,
            wrapperCache,
        };
    }

    /** Reuse `col`'s prior padding chain when valid. Atomic chain builds mean validating only the
     *  innermost padding suffices — the rest follows by invariant. */
    const tryReusePaddingChain = (
        col: AgColumn,
        level: number,
        parent: AgProvidedColumnGroup | null
    ): AgProvidedColumnGroup | null => {
        let node = innermostPaddingHead(col, treeDepth);
        if (node === null || node.buildToken === buildToken) {
            return null;
        }
        while (node.level > level) {
            node.buildToken = buildToken;
            allGroups.push(node);
            node = node.originalParent!;
        }
        node.buildToken = buildToken;
        allGroups.push(node);
        node.originalParent = parent;
        return node;
    };

    if (paddingDef) {
        gos.validateColDef(paddingDef, '');
    }

    /** Wrap `payload` in synthetic padded groups from `level` up to `maxDepth`; returns the OUTERMOST. */
    const buildPaddedChain = (
        level: number,
        parent: AgProvidedColumnGroup | null,
        payload: AgColumn[]
    ): AgProvidedColumnGroup => {
        let outer: AgProvidedColumnGroup | undefined;
        let current: AgProvidedColumnGroup | undefined;
        for (let j = level; j < treeDepth; ++j) {
            let newId: string;
            do {
                newId = `${paddedIdHint++}`;
            } while (isReserved(newId) || reservedUserKeys.has(newId));
            allocatedKeys.add(newId);
            const padded = new AgProvidedColumnGroup(paddingDef, newId, true, j);
            padded.buildToken = buildToken;
            context.createBean(padded);
            allGroups.push(padded);
            if (current) {
                current.children = [padded];
                current.setExpandable();
                padded.originalParent = current;
            } else {
                padded.originalParent = parent;
                outer = padded;
            }
            current = padded;
        }
        const innermost = current!;
        innermost.children = payload;
        innermost.setExpandable();
        for (let i = 0, n = payload.length; i < n; ++i) {
            payload[i].originalParent = innermost;
        }
        return outer!;
    };

    /** Reuse an existing non-padded group matching `userGroupId` with a structurally identical merged
     *  def (ignoring `children`). `null` when no candidate; else `{ reused, existing }` with `existing`
     *  always set and `reused` null when the candidate's def changed (caller carries `expanded` over). */
    const tryReuseGroup = (
        userGroupId: string | undefined,
        merged: ColGroupDef
    ): { reused: AgProvidedColumnGroup | null; existing: AgProvidedColumnGroup } | null => {
        if (userGroupId == null) {
            return null;
        }
        const candidate = existingGroupsById.get(userGroupId);
        if (!candidate || candidate.buildToken === buildToken || candidate.padding) {
            return null;
        }
        if (allocatedKeys.has(candidate.groupId) || !_mergedEqual(merged, candidate.colGroupDef, 'children')) {
            // Rejected: leave `buildToken` stale so the post-build sweep destroys this orphan.
            return { reused: null, existing: candidate };
        }
        candidate.buildToken = buildToken; // stamp only on success — also the "already claimed" guard
        // Refresh def ref so `getColGroupDef().children` reflects current children (excluded from compare).
        candidate.colGroupDef = merged;
        allocatedKeys.add(candidate.groupId);
        return { reused: candidate, existing: candidate };
    };

    /** Single-pass tree build: cols/groups, padding, parent wiring, `setExpandable`. */
    const buildSubtree = (
        defs: (ColDef | ColGroupDef)[],
        level: number,
        parent: AgProvidedColumnGroup | null
    ): (AgColumn | AgProvidedColumnGroup)[] => {
        const len = defs.length;
        if (len === 0) {
            return [];
        }
        const needsPadding = level < treeDepth;
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
                for (let i = 0; i < len; ++i) {
                    const col = buildColumn(defs[i] as ColDef);
                    if (col === undefined) {
                        continue; // removed leaf: never built
                    }
                    columns.push(col);
                    wrapped.push(col);
                }
                if (wrapped.length === 0) {
                    return wrapped; // every leaf removed — nothing to wrap (empty array)
                }
                // Reuse the chain only when every col still shares one innermost padding (this
                // all-leaves chain existed last refresh); refresh children on reuse.
                const sharedInnermost = wrapped[0].originalParent;
                let allShareChain = sharedInnermost !== null;
                if (allShareChain) {
                    for (let i = 1, wLen = wrapped.length; i < wLen; ++i) {
                        if (wrapped[i].originalParent !== sharedInnermost) {
                            allShareChain = false;
                            break;
                        }
                    }
                }
                if (allShareChain) {
                    const reusedTop = tryReusePaddingChain(wrapped[0], level, parent);
                    if (reusedTop !== null) {
                        sharedInnermost!.children = wrapped;
                        for (let i = 0, wLen = wrapped.length; i < wLen; ++i) {
                            wrapped[i].originalParent = sharedInnermost!;
                        }
                        return [reusedTop];
                    }
                }
                return [buildPaddedChain(level, parent, wrapped)];
            }
        }
        const result: (AgColumn | AgProvidedColumnGroup)[] = [];
        for (let i = 0; i < len; ++i) {
            const def = defs[i];
            const groupChildren = (def as ColGroupDef).children;
            if (groupChildren) {
                const groupDef = def as ColGroupDef;
                const userGroupId = groupDef.groupId;
                const merged: ColGroupDef = { ...defaultColGroupDef, ...groupDef };

                const candidate = tryReuseGroup(userGroupId, merged);
                const reused = candidate?.reused;
                let group: AgProvidedColumnGroup;
                if (reused) {
                    reused.level = level;
                    group = reused;
                } else {
                    const groupId = getUniqueKey(userGroupId);
                    gos.validateColDef(merged, groupId);
                    group = new AgProvidedColumnGroup(merged, groupId, false, level);
                    group.buildToken = buildToken;
                    context.createBean(group);
                    // Preserve expand state: a recreated (e.g. generated-id) group copies it from the prior same-id group.
                    const prior = candidate?.existing ?? existingGroupsById.get(groupId);
                    if (prior) {
                        group.setExpanded(prior.expanded);
                    }
                }
                group.children = buildSubtree(groupChildren, level + 1, group);
                group.originalParent = parent;
                group.setExpandable();
                hasMarryChildren ||= !!merged.marryChildren;
                newGroupsById.set(group.groupId, group);
                allGroups.push(group);
                result.push(group);
            } else {
                const col = buildColumn(def as ColDef);
                if (col === undefined) {
                    continue; // removed leaf: never built
                }
                columns.push(col);
                if (needsPadding) {
                    // Naked col in a mixed level — pad under its own chain to preserve def order.
                    result.push(tryReusePaddingChain(col, level, parent) ?? buildPaddedChain(level, parent, [col]));
                } else {
                    col.originalParent = parent;
                    result.push(col);
                }
            }
        }
        return result;
    };

    const columnTree = buildSubtree(defs!, 0, null);

    return {
        columnTree,
        treeDepth,
        columns,
        allGroups,
        marryChildren: hasMarryChildren,
        groupsById: newGroupsById,
        colsByKey: newColsByKey,
        source,
        newColDefs,
        buildToken,
        wrapperCache,
    };
}

const innermostPaddingHead = (col: AgColumn, maxDepth: number): AgProvidedColumnGroup | null => {
    const node = col.originalParent;
    return node != null && node.padding && node.level === maxDepth - 1 ? node : null;
};

export const finalizeColumnTree = (build: ColumnTreeBuild): void => {
    build.edit?.commit(build);
    build.wrapperCache?.evict(build.buildToken);
};
