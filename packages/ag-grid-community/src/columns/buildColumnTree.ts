import { _pushToMapArray } from 'ag-stack';

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
    /** Cols keyed by `colId`, and by `userProvidedColDef` ref for its first col; for O(1) reuse. */
    colsByKey: Map<string | ColDef, AgColumn>;
    /** A colDef object's cols after its first, in build order; `null` unless one object built several. */
    laterColsByDef: Map<ColDef, AgColumn[]> | null;
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
 *  groupId. Id allocation is deterministic (master/slave grids produce identical ids). User-column layer
 *  entries (`UserColumnService.overrideFor`) drop/replace a leaf mid-build, never its group.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _buildColumnTree(
    beans: BeanCollection,
    defs: (ColDef | ColGroupDef)[] | null | undefined,
    primaryColumns: boolean,
    existingGroupsById: Map<string, AgProvidedColumnGroup>,
    existingColsByKey: Map<string | ColDef, AgColumn>,
    existingLaterColsByDef: Map<ColDef, AgColumn[]> | null,
    existingColsById: { readonly [id: string]: AgColumn },
    source: ColumnEventType,
    newColDefs: boolean,
    buildToken: number,
    wrapperCache: ColWrapperCache | null
): ColumnTreeBuild {
    const { context, gos, userColumnSvc } = beans;
    const defaultColGroupDef = gos.get('defaultColGroupDef');
    // Stateless padded groups share one colGroupDef ref; the cast is safe (padding owns its own `children`).
    const paddingDef = (defaultColGroupDef ?? null) as ColGroupDef | null;
    // Ids allocated this call; each held for a padding chain maps to its group.
    const allocatedKeys = new Map<string, AgProvidedColumnGroup | null>();
    const reservedUserKeys = new Set<string>();

    const isReusableUserCol = (col: AgColumn): boolean =>
        col.colKind === 'user' && col.primary === primaryColumns && col.buildToken !== buildToken;
    /** Allocated, or held by a live column kept or not reusable; read after every match, so the rest are swept. */
    const isReserved = (id: string): boolean => {
        if (allocatedKeys.has(id)) {
            return true;
        }
        const live = existingColsById[id];
        return live !== undefined && !isReusableUserCol(live);
    };

    // Per leaf, its column by `colId` or instance, taken before any key or positional match; `null`: dropped.
    const leafClaims: (AgColumn | null | undefined)[] = [];
    let leafOverrides: Map<number, ColDef> | undefined;
    // Uses so far of each colDef object that built several cols last time.
    let defUses: Map<ColDef, number> | undefined;

    const claimLeaf = (colDef: ColDef): AgColumn | null | undefined => {
        const override = userColumnSvc?.overrideFor(colDef);
        if (override === null) {
            return null;
        }
        if (override !== undefined) {
            leafOverrides ??= new Map();
            leafOverrides.set(leafClaims.length, override);
            colDef = override; // a new object: matched by its colId, else by field
        }
        const colId = colDef.colId;
        let claim: AgColumn | undefined;
        if (colId != null) {
            claim = existingColsByKey.get(colId);
        } else if (override === undefined) {
            const later = existingLaterColsByDef?.get(colDef);
            if (later === undefined) {
                claim = existingColsByKey.get(colDef);
            } else {
                // The object built several cols: its n-th use takes the n-th of them.
                defUses ??= new Map();
                const use = defUses.get(colDef) ?? 0;
                defUses.set(colDef, use + 1);
                claim = use === 0 ? existingColsByKey.get(colDef) : later[use - 1];
            }
        }
        if (claim === undefined || !isReusableUserCol(claim)) {
            return undefined;
        }
        allocatedKeys.set(claim.colId, null);
        claim.buildToken = buildToken;
        return claim;
    };

    // Pre-walk: depth, claims, user keys and the count of positional ids; padded ids start after the positional ones.
    let treeDepth = 0;
    let paddedIdHint = 0;
    let anonymousLeafCount = 0;
    // The last build's columns without colId or field, in order; read before any of them is re-applied.
    let oldAnonymousCols: AgColumn[] | undefined;
    // Leaves no claim took, keyed or with a positional candidate: their indexes and (override) defs.
    let deferredLeaves: number[] | undefined;
    let deferredDefs: ColDef[] | undefined;
    // Positional ids: those below it that are not a user key.
    let positionalEnd = 0;
    if (defs) {
        const measure = (nodes: (ColDef | ColGroupDef)[], level: number): void => {
            if (level > treeDepth) {
                treeDepth = level;
            }
            for (let i = 0, len = nodes.length; i < len; ++i) {
                const def = nodes[i];
                const childDefs = (def as ColGroupDef).children;
                if (childDefs) {
                    const groupId = (def as ColGroupDef).groupId;
                    if (groupId == null) {
                        ++paddedIdHint;
                    } else {
                        reservedUserKeys.add(groupId);
                    }
                    measure(childDefs, level + 1);
                    continue;
                }
                const colDef = def as ColDef;
                const base = colDef.colId ?? colDef.field;
                let claim = claimLeaf(colDef);
                let deferredDef: ColDef | undefined;
                if (base != null) {
                    reservedUserKeys.add(base);
                    if (claim === undefined) {
                        deferredDef = leafOverrides?.get(leafClaims.length) ?? colDef;
                    }
                } else {
                    ++paddedIdHint;
                    if (claim === undefined) {
                        oldAnonymousCols ??= collectAnonymousCols(existingColsByKey);
                        claim = oldAnonymousCols[anonymousLeafCount];
                        if (claim !== undefined) {
                            deferredDef = colDef;
                        }
                    }
                    ++anonymousLeafCount;
                }
                if (deferredDef !== undefined) {
                    deferredLeaves ??= [];
                    deferredDefs ??= [];
                    deferredLeaves.push(leafClaims.length);
                    deferredDefs.push(deferredDef);
                }
                leafClaims.push(claim);
            }
        };
        measure(defs, 0);
    }

    // After every claim: a keyed leaf takes the first unclaimed column with its key, at its key or a suffix of it.
    if (deferredLeaves) {
        // A rename keeps the number of anonymous columns, drops the old header and gives one none of them had.
        const canRename = oldAnonymousCols?.length === anonymousLeafCount;
        // The old anonymous columns' and the new anonymous defs' `headerName`s, collected at the first header change.
        let oldHeaders: Set<string | undefined> | undefined;
        let newHeaders: Set<string | undefined> | undefined;
        for (let i = 0, len = deferredLeaves.length; i < len; ++i) {
            const index = deferredLeaves[i];
            const def = deferredDefs![i];
            const colId = def.colId;
            const base = colId ?? def.field;
            if (base != null) {
                for (let count = 0; ; ++count) {
                    const id: string = count === 0 ? base : `${base}_${count}`;
                    const live: AgColumn | undefined = existingColsById[id];
                    if (live === undefined) {
                        break;
                    }
                    // Only a column of this tree's last build its owner still offers for reuse.
                    if (isReusableUserCol(live) && existingColsByKey.get(id) === live) {
                        const liveDef: ColDef = live.userProvidedColDef!;
                        if ((liveDef.colId ?? liveDef.field) === base) {
                            allocatedKeys.set(id, null);
                            live.buildToken = buildToken;
                            leafClaims[index] = live;
                            if (colId != null) {
                                beans.log.warn(273, { providedId: colId, usedId: id }); // its own id was a claim
                            }
                            break;
                        }
                    }
                }
                continue;
            }
            // A positional candidate is kept when free and its header is the same or renamed.
            const col = leafClaims[index]!;
            const oldHeader = col.userProvidedColDef!.headerName;
            const newHeader = def.headerName;
            const free = isReusableUserCol(col) && !reservedUserKeys.has(col.colId);
            let renamed = false;
            if (free && canRename && oldHeader !== newHeader) {
                if (oldHeaders === undefined) {
                    oldHeaders = new Set();
                    for (let j = 0, oldLen = oldAnonymousCols!.length; j < oldLen; ++j) {
                        oldHeaders.add(oldAnonymousCols![j].userProvidedColDef!.headerName);
                    }
                    newHeaders = new Set();
                    collectAnonymousHeaders(defs!, newHeaders);
                }
                renamed = !oldHeaders.has(newHeader) && !newHeaders!.has(oldHeader);
            }
            if (free && (oldHeader === newHeader || renamed)) {
                allocatedKeys.set(col.colId, null);
                col.buildToken = buildToken;
            } else {
                leafClaims[index] = undefined;
            }
        }
    }

    if (treeDepth > 0) {
        let left = paddedIdHint;
        while (left > 0) {
            if (!reservedUserKeys.has(`${positionalEnd}`)) {
                --left;
            }
            ++positionalEnd;
        }
        paddedIdHint = positionalEnd;
        // Hold each kept column's old padding chain unless an id in it is now a user or positional id.
        for (let i = 0, len = leafClaims.length; i < len; ++i) {
            const claim = leafClaims[i];
            const innermost = claim ? innermostPaddingHead(claim, treeDepth) : null;
            let node = innermost;
            while (node?.padding) {
                const groupId = node.groupId;
                if (Number(groupId) < positionalEnd || reservedUserKeys.has(groupId)) {
                    break;
                }
                node = node.originalParent;
            }
            if (node?.padding) {
                continue;
            }
            for (node = innermost; node?.padding; node = node.originalParent) {
                allocatedKeys.set(node.groupId, node);
            }
        }
    }

    let userIdHint = 0;
    /** The next id by position among columns without colId or field and groups without groupId. */
    const nextPositionalId = (): string => {
        let id: string;
        do {
            id = `${userIdHint++}`;
        } while (isReserved(id) || reservedUserKeys.has(id));
        allocatedKeys.set(id, null);
        return id;
    };

    const getUniqueKey = (groupId: string | null | undefined): string => {
        if (groupId == null) {
            return nextPositionalId();
        }
        let id: string;
        if (!isReserved(groupId)) {
            allocatedKeys.set(groupId, null);
            return groupId;
        }
        let count = 1;
        do {
            id = `${groupId}_${count++}`;
        } while (isReserved(id));
        beans.log.warn(273, { providedId: groupId, usedId: id });
        allocatedKeys.set(id, null);
        return id;
    };

    const columns: AgColumn[] = [];
    // The next build's sweep walks this rather than `.children`, which would miss orphans when a
    // parent's array was replaced.
    const allGroups: AgProvidedColumnGroup[] = [];
    let hasMarryChildren = false;
    const newColsByKey = new Map<string | ColDef, AgColumn>();
    let newLaterColsByDef: Map<ColDef, AgColumn[]> | null = null;

    let leafIndex = 0;
    /** The next leaf: the column it matched, else a new one at its key, first free suffix or position; `undefined` if dropped. */
    const buildColumn = (def: ColDef): AgColumn | undefined => {
        const index = leafIndex++;
        let column = leafClaims[index];
        if (column === null) {
            return undefined; // dropped (e.g. a column the user deleted): never built
        }
        def = leafOverrides?.get(index) ?? def;
        if (column === undefined) {
            const colId = def.colId;
            const base = colId ?? def.field;
            let id: string;
            if (base == null) {
                id = nextPositionalId();
            } else {
                id = base;
                let count = 1;
                while (isReserved(id)) {
                    id = `${base}_${count}`;
                    ++count;
                }
                allocatedKeys.set(id, null);
                if (colId != null && id !== colId) {
                    beans.log.warn(273, { providedId: colId, usedId: id });
                }
            }
            column = _createUserColumn(beans, def, id, primaryColumns, buildToken);
        } else {
            column.reapplyColDef(def, source, newColDefs); // here, not at the claim: columns update in def order
        }
        // Hierarchy / service cols have no `userProvidedColDef` and are never looked up by ref.
        const userDef = column.userProvidedColDef;
        if (userDef) {
            newColsByKey.set(column.colId, column);
            if (!newColsByKey.has(userDef)) {
                newColsByKey.set(userDef, column);
            } else {
                newLaterColsByDef ??= new Map();
                _pushToMapArray(newLaterColsByDef, userDef, column);
            }
        }
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
            laterColsByDef: newLaterColsByDef,
            source,
            newColDefs,
            buildToken,
            wrapperCache,
        };
    }

    /** Reuse `col`'s padding chain up to `level` when no id in it is taken or is now a user or positional id. */
    const tryReusePaddingChain = (
        col: AgColumn,
        level: number,
        parent: AgProvidedColumnGroup | null,
        payload: AgColumn[] | null
    ): AgProvidedColumnGroup | null => {
        const innermost = innermostPaddingHead(col, treeDepth);
        if (innermost === null || innermost.buildToken === buildToken) {
            return null;
        }
        let top = innermost;
        while (true) {
            const groupId = top.groupId;
            const owner = allocatedKeys.get(groupId);
            if (
                owner !== top &&
                (owner !== undefined || Number(groupId) < positionalEnd || reservedUserKeys.has(groupId))
            ) {
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
        for (let node = innermost; ; node = node.originalParent!) {
            node.buildToken = buildToken;
            allocatedKeys.set(node.groupId, node);
            allGroups.push(node);
            if (node === top) {
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
            allocatedKeys.set(newId, null);
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
        allocatedKeys.set(candidate.groupId, null);
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
                // Reuse the chain only when every col still shares one innermost padding.
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
                const reusedTop = allShareChain ? tryReusePaddingChain(wrapped[0], level, parent, wrapped) : null;
                return [reusedTop ?? buildPaddedChain(level, parent, wrapped)];
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
                    result.push(
                        tryReusePaddingChain(col, level, parent, null) ?? buildPaddedChain(level, parent, [col])
                    );
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
        laterColsByDef: newLaterColsByDef,
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

const isAnonymousDef = (def: ColDef): boolean => def.colId == null && def.field == null;

/** A build's columns without colId or field, in build order: its `colsByKey` holds each column's colId first. */
const collectAnonymousCols = (colsByKey: Map<string | ColDef, AgColumn>): AgColumn[] => {
    const cols: AgColumn[] = [];
    colsByKey.forEach((col, key) => {
        const userDef = col.userProvidedColDef;
        if (typeof key === 'string' && userDef && isAnonymousDef(userDef)) {
            cols.push(col);
        }
    });
    return cols;
};

const collectAnonymousHeaders = (defs: (ColDef | ColGroupDef)[], headers: Set<string | undefined>): void => {
    for (let i = 0, len = defs.length; i < len; ++i) {
        const def = defs[i];
        const children = (def as ColGroupDef).children;
        if (children) {
            collectAnonymousHeaders(children, headers);
        } else if (isAnonymousDef(def as ColDef)) {
            headers.add(def.headerName);
        }
    }
};

export const finalizeColumnTree = (build: ColumnTreeBuild): void => {
    build.edit?.commit(build);
    build.wrapperCache?.evict(build.buildToken);
};
