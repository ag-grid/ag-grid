import type { BeanCollection } from '../../../context/context';
import type { AgColumn } from '../../../entities/agColumn';
import type { AgProvidedColumnGroup } from '../../../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef } from '../../../entities/colDef';
import { _mergedEqual } from '../../../utils/mergeDeep';
import type { ColumnTreeBuild } from '../columnTreeBuilder';
import type { ColumnIdAllocator } from './columnIdAllocator';

/** A header key: the header alone when no definition is grouped (`null`: no header), else built with its groups. */
type MatchKey = string | null;

/** Per leaf of the definitions, depth first, its definition (`null`: removed by the user) and the old column it takes. */
export interface ColumnMatch {
    readonly leafDefs: readonly (ColDef | null)[];
    readonly leafClaims: readonly (AgColumn | undefined)[];
    readonly treeDepth: number;
    /** Per group without groupId, in definition order: the old group it keeps (stamped with the build's token), else
     *  the one whose open state it takes; `null` without old groups. */
    readonly anonymousGroupPriors: readonly (AgProvidedColumnGroup | undefined)[] | null;
}

/** Each leaf's old column (by colId, object, field, then headerName and position) and each groupId-less group's old
 *  group; `ids` learns the declared ids, the fields, the calculated columns' ids and where padding ids start. */
export const matchColumns = (
    beans: BeanCollection,
    ids: ColumnIdAllocator,
    previous: ColumnTreeBuild | null,
    defaultColGroupDef: Partial<ColGroupDef> | undefined,
    defs: (ColDef | ColGroupDef)[]
): ColumnMatch => {
    beans.calculatedColsSvc?.beginBuild(ids);
    const userCols = beans.userColumnSvc;
    const userColumnSvc = userCols?.hasEntries() ? userCols : undefined; // the common grid has no user columns
    const leafDefs: (ColDef | null)[] = [];
    const leafClaims: (AgColumn | undefined)[] = [];
    /** Per leaf, the part of its header key its groups give. */
    const groupKeys: string[] = [];
    let treeDepth = 0;
    let positional = 0;
    const anonymousGroupDefs: ColGroupDef[] = [];
    // The groups without groupId after their children, as the old groups are listed: index in definition order, key.
    const anonymousGroupAts: number[] = [];
    const anonymousGroupKeys: string[] = [];
    /** The leaves whose colId an earlier definition declares, or a column outside the definitions holds. */
    const repeats: number[] = [];
    const walk = (children: (ColDef | ColGroupDef)[], depth: number, groupsKey: string): void => {
        for (let i = 0, len = children.length; i < len; ++i) {
            const def = children[i];
            const groupChildren = (def as ColGroupDef).children;
            if (groupChildren) {
                const groupId = (def as ColGroupDef).groupId;
                const at = anonymousGroupDefs.length;
                if (groupId == null) {
                    anonymousGroupDefs.push(def as ColGroupDef);
                    ++positional;
                } else {
                    ids.declared.add(groupId);
                }
                treeDepth = Math.max(treeDepth, depth + 1);
                if (previous === null) {
                    walk(groupChildren, depth + 1, ''); // a first build matches nothing, so needs no keys
                    continue;
                }
                const header = 'headerName' in def ? def.headerName : defaultColGroupDef?.headerName;
                walk(groupChildren, depth + 1, groupSegment(groupId, header) + groupsKey);
                if (groupId == null) {
                    anonymousGroupAts.push(at);
                    anonymousGroupKeys.push(headerSegment(header) + groupsKey);
                }
                continue;
            }
            const override = userColumnSvc?.overrideFor(def as ColDef);
            const leafDef = override === undefined ? (def as ColDef) : override;
            const colId = leafDef?.colId;
            if (colId != null) {
                if (previous !== null && (ids.declared.has(colId) || ids.isHeld(colId))) {
                    repeats.push(leafDefs.length);
                }
                ids.declared.add(colId);
            } else {
                const field = leafDef?.field;
                if (field != null) {
                    ids.fields.add(field);
                } else {
                    positional += leafDef === null ? 0 : 1;
                }
            }
            leafDefs.push(leafDef);
            leafClaims.push(undefined);
            if (previous !== null) {
                groupKeys.push(groupsKey);
            }
        }
    };
    walk(defs, 0, '');
    ids.nextPadded = positional;
    let anonymousGroupPriors: (AgProvidedColumnGroup | undefined)[] | null = null;
    if (previous === null) {
        return { leafDefs, leafClaims, treeDepth, anonymousGroupPriors };
    }
    const buildToken = ids.buildToken;
    const { colsById, colsByDef, groupsById } = previous;
    const claim = (i: number, col: AgColumn): void => {
        leafClaims[i] = col;
        col.buildToken = buildToken;
        ids.held.set(col.colId, null);
    };
    const len = leafDefs.length;
    // A colId takes the old column at that id; a definition without one the column its object built, unless a
    // colId now declares that column's id.
    for (let i = 0; i < len; ++i) {
        const def = leafDefs[i];
        if (def === null) {
            continue;
        }
        const colId = def.colId;
        const col = colId == null ? colsByDef.get(def) : colsById.get(colId);
        if (col !== undefined && (colId == null ? canTake(col, ids, def.field) : isAvailable(col, ids))) {
            claim(i, col);
        }
    }
    // Then a repeated colId, and a field, take the first free column they built.
    for (let r = 0, repeatsLen = repeats.length; r < repeatsLen; ++r) {
        const i = repeats[r];
        const col = leafClaims[i] === undefined ? firstBuiltFrom(colsById, ids, leafDefs[i]!.colId!, true) : undefined;
        if (col !== undefined) {
            claim(i, col);
        }
    }
    let news: number[] | null = null;
    for (let i = 0; i < len; ++i) {
        const def = leafDefs[i];
        if (def == null || leafClaims[i] !== undefined || def.colId != null) {
            continue;
        }
        const field = def.field;
        if (field == null) {
            news ??= [];
            news.push(i);
            continue;
        }
        const col = firstBuiltFrom(colsById, ids, field, false);
        if (col !== undefined) {
            claim(i, col);
        }
    }
    if (news !== null) {
        const grouped = treeDepth > 0 || previous.treeDepth > 0;
        const newKeys: MatchKey[] = [];
        for (let k = 0, newsLen = news.length; k < newsLen; ++k) {
            const i = news[k];
            const header = leafDefs[i]!.headerName;
            newKeys.push(grouped ? headerSegment(header) + groupKeys[i] : (header ?? null));
        }
        const olds: AgColumn[] = [];
        const oldKeys: MatchKey[] = [];
        // An old column whose id a column outside the definitions took is neither matched nor replaced by position.
        let byPosition = true;
        for (const col of colsById.values()) {
            if (col.buildToken === buildToken || !isAnonymousColumn(col)) {
                continue;
            }
            if (canTake(col, ids, undefined)) {
                const header = col.userProvidedColDef!.headerName;
                olds.push(col);
                oldKeys.push(grouped ? headerSegment(header) + oldGroupsKey(col.originalParent) : (header ?? null));
            } else {
                byPosition &&= !ids.isHeld(col.colId);
            }
        }
        const matches = matchByKey(olds, oldKeys, newKeys, grouped, byPosition);
        for (let k = 0, newsLen = news.length; k < newsLen; ++k) {
            const col = matches[k];
            if (col !== undefined) {
                claim(news[k], col);
            }
        }
    }
    if (anonymousGroupDefs.length !== 0 && groupsById.size !== 0) {
        const olds: AgProvidedColumnGroup[] = [];
        const oldKeys: string[] = [];
        for (const group of groupsById.values()) {
            const def = group.colGroupDef;
            if (!group.padding && def?.groupId == null) {
                olds.push(group);
                oldKeys.push(headerSegment(def?.headerName) + oldGroupsKey(group.originalParent));
            }
        }
        anonymousGroupPriors = new Array(anonymousGroupDefs.length).fill(undefined);
        const matches = matchByKey(olds, oldKeys, anonymousGroupKeys, true, true);
        for (let k = 0, matchesLen = matches.length; k < matchesLen; ++k) {
            const prior = matches[k];
            if (prior === undefined) {
                continue;
            }
            const at = anonymousGroupAts[k];
            anonymousGroupPriors[at] = prior;
            const id = prior.groupId;
            // kept when its id is free and its definition the same but `children`
            if (
                !ids.isHeld(id) &&
                !ids.isUserKey(id) &&
                _mergedEqual(_mergeGroupDef(anonymousGroupDefs[at], defaultColGroupDef), prior.colGroupDef, 'children')
            ) {
                prior.buildToken = buildToken;
                ids.held.set(id, null);
            }
        }
    }
    return { leafDefs, leafClaims, treeDepth, anonymousGroupPriors };
};

/** Whether no leaf took `col`, no column outside the last build holds its id, and its source column (a pivot result
 *  column's value column) lives. */
const isAvailable = (col: AgColumn, ids: ColumnIdAllocator): boolean =>
    !ids.isHeld(col.colId) && col.pivotValueColumn?.isAlive() !== false;

/** Whether `col` is available and no definition other than one with `ownField` now declares its id. */
const canTake = (col: AgColumn, ids: ColumnIdAllocator, ownField: string | null | undefined): boolean => {
    const id = col.colId;
    return (
        isAvailable(col, ids) &&
        !ids.declared.has(id) &&
        !(col.isIdGenerated() && id !== ownField && ids.fields.has(id))
    );
};

/** The first old column a leaf can take among those `key` (a colId, else a field) built at its id or a `_1`, `_2`…
 *  suffix; none past a column whose id one outside the definitions took. */
const firstBuiltFrom = (
    colsById: ReadonlyMap<string, AgColumn>,
    ids: ColumnIdAllocator,
    key: string,
    byColId: boolean
): AgColumn | undefined => {
    for (let suffix = 0, id = key; suffix === 0 || suffix <= ids.lastSuffix(key, colsById); id = `${key}_${++suffix}`) {
        const col = colsById.get(id);
        const def = col?.userProvidedColDef;
        if (
            col !== undefined &&
            def != null &&
            col.isIdGenerated() === suffix > 0 &&
            (byColId ? def.colId === key : isBuiltFromField(col, def, key))
        ) {
            if (canTake(col, ids, undefined)) {
                return col;
            }
            if (col.buildToken !== ids.buildToken && ids.isHeld(col.colId)) {
                return undefined;
            }
        }
    }
    return undefined;
};

/** Whether the matching rules pair `current`'s definition with `prev`, the column that had its id (for maintainColumnOrder). */
export const _isMatchedAtId = (prev: AgColumn, current: AgColumn): boolean => {
    const def = current.userProvidedColDef;
    const prevDef = prev.userProvidedColDef;
    if (prev.colKind !== current.colKind || def === null || prevDef === null || def === prevDef) {
        return prev.colKind === current.colKind && def === prevDef; // generated columns: the caller judged their sources
    }
    const colId = def.colId;
    if (colId != null) {
        return current.colId === colId || prevDef.colId === colId; // its own id, or a suffixed column of that colId
    }
    const field = def.field;
    if (field != null) {
        return isBuiltFromField(prev, prevDef, field);
    }
    return isAnonymousColumn(prev) && headerSegment(prevDef.headerName) === headerSegment(def.headerName);
};

/** A group definition merged over `defaultColGroupDef`, whose groupId is no group's id, as allocation reads it. */
export const _mergeGroupDef = (def: ColGroupDef, defaultColGroupDef: Partial<ColGroupDef> | undefined): ColGroupDef => {
    const merged: ColGroupDef = { ...defaultColGroupDef, ...def };
    if (defaultColGroupDef?.groupId !== undefined) {
        merged.groupId = def.groupId;
    }
    return merged;
};

/** Per new key its old item: those of equal keys in order, then (`grouped`: a key may hold a group part) of equal own
 *  headers, then the rest in order when as many are left on both sides. */
const matchByKey = <T>(
    olds: readonly T[],
    oldKeys: readonly MatchKey[],
    newKeys: readonly MatchKey[],
    grouped: boolean,
    byPosition: boolean
): (T | undefined)[] => {
    const oldsLen = olds.length;
    const newsLen = newKeys.length;
    const result: (T | undefined)[] = new Array(newsLen).fill(undefined);
    let prefix = 0;
    while (prefix < oldsLen && prefix < newsLen && oldKeys[prefix] === newKeys[prefix]) {
        result[prefix] = olds[prefix];
        ++prefix;
    }
    if (prefix === newsLen || prefix === oldsLen) {
        return result;
    }
    const taken: boolean[] = new Array(oldsLen).fill(false);
    pairEqual(olds, oldKeys, newKeys, taken, result, prefix, false);
    if (grouped) {
        pairEqual(olds, oldKeys, newKeys, taken, result, prefix, true);
    }
    if (!byPosition || oldsLen !== newsLen) {
        return result;
    }
    for (let k = prefix, j = prefix; k < newsLen; ++k) {
        if (result[k] !== undefined) {
            continue;
        }
        while (taken[j]) {
            ++j;
        }
        result[k] = olds[j++];
    }
    return result;
};

/** Pairs, in order, the items from `from` on left whose keys (`own`: own headers) are equal. */
const pairEqual = <T>(
    olds: readonly T[],
    oldKeys: readonly MatchKey[],
    newKeys: readonly MatchKey[],
    taken: boolean[],
    result: (T | undefined)[],
    from: number,
    own: boolean
): void => {
    // per key its first old index left, each index chained to the next with that key
    const firstByKey = new Map<MatchKey, number>();
    const next: number[] = new Array(olds.length);
    for (let j = oldKeys.length - 1; j >= from; --j) {
        if (taken[j]) {
            continue;
        }
        const key = own ? ownSegment(oldKeys[j] as string) : oldKeys[j];
        next[j] = firstByKey.get(key) ?? -1;
        firstByKey.set(key, j);
    }
    for (let k = from, len = newKeys.length; k < len; ++k) {
        if (result[k] !== undefined) {
            continue;
        }
        const key = own ? ownSegment(newKeys[k] as string) : newKeys[k];
        const j = firstByKey.get(key);
        if (j !== undefined && j >= 0) {
            firstByKey.set(key, next[j]);
            taken[j] = true;
            result[k] = olds[j];
        }
    }
};

/** The segment of a key for no header. */
const NO_HEADER = '~';
/** The mark starting a group's segment of a key made from its groupId. */
const GROUP_ID_MARK = '#';

/** A header in a key: self-delimiting, so a key's first one is its own header. */
const headerSegment = (header: string | null | undefined): string =>
    header == null ? NO_HEADER : header.length + ':' + header;

/** A group in a header key: its groupId when it declares one, else its header. */
const groupSegment = (groupId: string | null | undefined, header: string | null | undefined): string =>
    groupId == null ? headerSegment(header) : GROUP_ID_MARK + groupId.length + ':' + groupId;

const ownSegment = (key: string): string => {
    if (key[0] === NO_HEADER) {
        return NO_HEADER;
    }
    const colon = key.indexOf(':');
    return key.slice(0, colon + 1 + Number(key.slice(0, colon)));
};

/** The part of a header key the real groups from `group` up give, padding skipped. */
const oldGroupsKey = (group: AgProvidedColumnGroup | null): string => {
    let key = '';
    for (let node = group; node !== null; node = node.originalParent) {
        const def = node.colGroupDef;
        key += node.padding ? '' : groupSegment(def?.groupId, def?.headerName);
    }
    return key;
};

/** Whether `def`, `col`'s definition, built it from `field` (a type's field is none) and declares no other colId. */
const isBuiltFromField = (col: AgColumn, def: ColDef, field: string): boolean =>
    (def.colId == null || def.colId === field) && def.field != null && col.colDef.field === field;

const isAnonymousColumn = (col: AgColumn): boolean => {
    const def = col.userProvidedColDef;
    return def != null && def.colId == null && def.field == null;
};
