import { _pushToMapArray } from 'ag-stack';

import type { BeanCollection } from '../../../context/context';
import type { AgColumn } from '../../../entities/agColumn';
import type { AgProvidedColumnGroup } from '../../../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef } from '../../../entities/colDef';
import { _mergedEqual } from '../../../utils/mergeDeep';
import type { ColumnTreeBuild } from '../columnTreeBuilder';
import type { ColumnIdAllocator } from './columnIdAllocator';
import { _isSuffixedId } from './columnIdAllocator';

/** Per leaf of the definitions, depth first, its definition (`null`: removed by the user) and the old column it takes. */
export interface ColumnMatch {
    readonly leafDefs: readonly (ColDef | null)[];
    readonly leafClaims: readonly (AgColumn | undefined)[];
    readonly treeDepth: number;
    /** Per group without groupId, in definition order: the old group it keeps (stamped with the build's token), else
     *  the one whose open state it takes; `null` without old groups. */
    readonly anonymousGroupPriors: readonly (AgProvidedColumnGroup | undefined)[] | null;
    /** How many ids the definitions take by position in a new grid. */
    readonly positionalIdCount: number;
}

/** A leaf repeating a colId an earlier definition declares. */
const REPEAT = 1;
/** A held leaf: its object's column is another leaf's, so it adds a column and takes none. */
const HELD = 2;
/** A held leaf whose column a declared id sets aside: neither counts for position. */
const SET_ASIDE = 4;
/** A leaf whose colId a column outside the definitions holds: all leaves with it repeat it, paired after the field pass. */
const RESERVED = 8;

/** Each leaf's old column (by colId, object, field, headerName, then position) and each groupId-less group's old group,
 *  before any is built; `ids` learns the declared ids, the fields and the ids the calculated-columns service holds. */
export const matchColumns = (
    beans: BeanCollection,
    ids: ColumnIdAllocator,
    previous: ColumnTreeBuild | null,
    defaultColGroupDef: Partial<ColGroupDef> | undefined,
    defs: (ColDef | ColGroupDef)[]
): ColumnMatch => {
    beans.calculatedColsSvc?.reserveDynamicColIds(ids);
    const userCols = beans.userColumnSvc;
    const userColumnSvc = userCols?.hasEntries() ? userCols : undefined; // the common grid has no user columns
    const leafDefs: (ColDef | null)[] = [];
    const leafClaims: (AgColumn | undefined)[] = [];
    const leafFlags: number[] = [];
    /** Per leaf, the part of its header key its groups give. */
    const groupKeys: string[] = [];
    let repeats: Map<string, number[]> | null = null;
    let treeDepth = 0;
    let positional = 0;
    const prevGroupsById = previous?.groupsById;
    // Per group definition, after its children as the old groups are listed, for pairing the groups without groupId.
    const groupSlots = prevGroupsById?.size ? newKeyed<number>() : null;
    const anonymousGroupDefs: ColGroupDef[] = [];
    const declaredGroupIds = new Set<string>();
    const walk = (children: (ColDef | ColGroupDef)[], depth: number, groupsKey: string): void => {
        for (let i = 0, len = children.length; i < len; ++i) {
            const def = children[i];
            const groupChildren = (def as ColGroupDef).children;
            if (groupChildren) {
                const groupId = (def as ColGroupDef).groupId;
                const at = anonymousGroupDefs.length;
                let firstOfId = false;
                if (groupId == null) {
                    anonymousGroupDefs.push(def as ColGroupDef);
                    ++positional;
                } else {
                    ids.declare(groupId);
                    firstOfId = !declaredGroupIds.has(groupId); // as the old side reads it: group ids only
                    declaredGroupIds.add(groupId);
                }
                treeDepth = Math.max(treeDepth, depth + 1);
                const header = 'headerName' in def ? def.headerName : defaultColGroupDef?.headerName;
                walk(groupChildren, depth + 1, groupSegment(groupId, header) + groupsKey);
                if (groupSlots !== null) {
                    if (groupId == null) {
                        addKeyed(groupSlots, at, headerSegment(header) + groupsKey);
                    } else if (firstOfId && prevGroupsById!.get(groupId)?.colGroupDef?.groupId === groupId) {
                        addSlot(groupSlots, SLOT_KEPT); // one group on both sides by its id, for position
                    }
                }
                continue;
            }
            const override = userColumnSvc?.overrideFor(def as ColDef);
            const leafDef = override === undefined ? (def as ColDef) : override;
            let flags = 0;
            const colId = leafDef?.colId;
            if (colId != null && !ids.declare(colId)) {
                flags = REPEAT;
            } else if (colId != null) {
                flags = ids.isHeld(colId) ? REPEAT | RESERVED : 0;
            } else if (leafDef?.field != null) {
                ids.declareField(leafDef.field);
            } else if (leafDef !== null) {
                ++positional;
            }
            if (flags !== 0) {
                repeats ??= new Map();
                _pushToMapArray(repeats, colId!, leafDefs.length);
            }
            leafDefs.push(leafDef);
            leafClaims.push(undefined);
            leafFlags.push(flags);
            groupKeys.push(groupsKey);
        }
    };
    walk(defs, 0, '');
    let anonymousGroupPriors: (AgProvidedColumnGroup | undefined)[] | null = null;
    if (previous !== null) {
        const grouped = treeDepth > 0 || previous.treeDepth > 0;
        new ColumnPairing(ids, previous, leafDefs, leafClaims, leafFlags, groupKeys, grouped).pair(repeats);
        if (groupSlots !== null && anonymousGroupDefs.length !== 0) {
            // Groups without groupId pair as columns do; a pair is kept when its def is the same but `children`.
            const olds = newKeyed<AgProvidedColumnGroup>();
            for (const group of previous.groupsById.values()) {
                const def = group.colGroupDef;
                if (!group.padding && def?.groupId == null) {
                    addKeyed(olds, group, headerSegment(def?.headerName) + oldGroupsKey(group.originalParent));
                } else if (declaredGroupIds.has(group.groupId) && def?.groupId === group.groupId) {
                    addSlot(olds, SLOT_KEPT); // one group on both sides by its id, for position
                }
            }
            anonymousGroupPriors = new Array(anonymousGroupDefs.length).fill(undefined);
            const matches = matchByKey(olds, groupSlots, true, true);
            const items = groupSlots.items;
            const buildToken = ids.buildToken;
            for (let k = 0, len = matches.length; k < len; ++k) {
                const prior = matches[k];
                if (prior === undefined) {
                    continue;
                }
                const at = items[k]!;
                anonymousGroupPriors[at] = prior;
                const id = prior.groupId;
                if (
                    ids.canKeep(id) &&
                    !ids.isField(id) &&
                    _mergedEqual(
                        _mergeGroupDef(anonymousGroupDefs[at], defaultColGroupDef),
                        prior.colGroupDef,
                        'children'
                    )
                ) {
                    prior.buildToken = buildToken;
                    ids.reserve(id, null);
                }
            }
        }
    }
    return { leafDefs, leafClaims, treeDepth, anonymousGroupPriors, positionalIdCount: positional };
};

/** The passes pairing the leaves with the old columns, each claim stamped with the build's token and its id reserved. */
class ColumnPairing {
    private readonly buildToken: number;
    /** The use of its object each leaf with a colId held outside is, for its pairing after the field pass. */
    private reservedUses: Map<number, number> | null = null;

    public constructor(
        private readonly ids: ColumnIdAllocator,
        private readonly previous: ColumnTreeBuild,
        private readonly leafDefs: readonly (ColDef | null)[],
        private readonly leafClaims: (AgColumn | undefined)[],
        private readonly leafFlags: number[],
        private readonly groupKeys: readonly string[],
        /** Whether a key, old or new, may hold a group part. */
        private readonly grouped: boolean
    ) {
        this.buildToken = ids.buildToken;
    }

    public pair(repeats: ReadonlyMap<string, number[]> | null): void {
        this.pairByColId();
        this.pairByObject();
        // Repeats of an id an earlier definition takes go before the field pass, those of an id held outside after.
        repeats?.forEach((members, colId) => this.pairRepeats(colId, members, false));
        this.pairByField();
        this.reservedUses?.forEach((use, i) => this.pairReservedByObject(i, use));
        repeats?.forEach((members, colId) => this.pairRepeats(colId, members, true));
        this.pairAnonymous();
    }

    /** A colId takes the old column at that id, and only it. */
    private pairByColId(): void {
        const { leafDefs, leafFlags } = this;
        const colsById = this.previous.colsById;
        for (let i = 0, len = leafDefs.length; i < len; ++i) {
            const colId = leafDefs[i]?.colId;
            const col = colId == null || leafFlags[i] !== 0 ? undefined : colsById.get(colId);
            if (col !== undefined && this.isAvailable(col)) {
                this.claim(i, col);
            }
        }
    }

    /** The n-th use of an object takes the n-th column it built; one it cannot take holds the leaf. */
    private pairByObject(): void {
        const { leafDefs, leafFlags, previous } = this;
        const colsByDef = previous.colsByDef;
        // Per object, how many of the columns it built its leaves so far took or were held by.
        const uses = new Map<ColDef, number>();
        for (let i = 0, len = leafDefs.length; i < len; ++i) {
            const def = leafDefs[i];
            if (def === null || !colsByDef.has(def)) {
                continue; // an object that built no column has none to take (laterColsByDef holds only these objects)
            }
            const use = uses.get(def) ?? 0;
            const flags = leafFlags[i];
            if (def.colId != null && flags === 0) {
                // Matched by its colId alone: it uses its object's next column only when it took that one.
                const own = ownColumn(previous, def, use);
                uses.set(def, own !== undefined && this.leafClaims[i] === own ? use + 1 : use);
                continue;
            }
            uses.set(def, use + 1);
            if ((flags & RESERVED) !== 0) {
                const reserved = this.reservedUses ?? new Map<number, number>();
                this.reservedUses = reserved;
                reserved.set(i, use); // paired with its repeats, after the field pass
                continue;
            }
            const col = ownColumn(previous, def, use);
            if (col === undefined) {
                continue;
            }
            if (this.canTake(col, def.field)) {
                this.claim(i, col);
            } else {
                leafFlags[i] = flags | (col.buildToken === this.buildToken ? HELD : SET_ASIDE);
            }
        }
    }

    /** After the field pass, a leaf whose colId is held outside takes its object's first column, from its use on, left free. */
    private pairReservedByObject(i: number, use: number): void {
        const previous = this.previous;
        const def = this.leafDefs[i]!;
        let n = use;
        let col = ownColumn(previous, def, n);
        while (col !== undefined && !this.canTake(col, def.field)) {
            col = ownColumn(previous, def, ++n);
        }
        if (col !== undefined) {
            this.claim(i, col);
        }
    }

    /** The leaves left with a field take, in order, the old columns created from it. */
    private pairByField(): void {
        const leafDefs = this.leafDefs;
        let firstByField: Map<string, AgColumn> | null = null;
        let laterByField: Map<string, AgColumn[]> | null = null;
        for (let i = 0, len = leafDefs.length; i < len; ++i) {
            const def = leafDefs[i];
            if (def === null || def.colId != null || def.field == null || !this.isOpen(i)) {
                continue;
            }
            if (firstByField === null) {
                firstByField = new Map();
                for (const col of this.previous.colsById.values()) {
                    const built = builtField(col);
                    if (built === undefined || !isBuiltFromField(col, built)) {
                        continue;
                    }
                    if (firstByField.has(built)) {
                        laterByField ??= new Map();
                        _pushToMapArray(laterByField, built, col); // OPTIMIZATION: an array only for a repeated field
                    } else {
                        firstByField.set(built, col);
                    }
                }
            }
            const field = def.field;
            const first = firstByField.get(field);
            const later = laterByField?.get(field);
            const col =
                first === undefined || this.canTake(first, field)
                    ? first
                    : later && this.firstTakeable(later, def, false);
            if (col !== undefined) {
                this.claim(i, col);
            }
        }
    }

    /** The leaves repeating `colId` take its suffixed old columns by field, header key, then position. */
    private pairRepeats(colId: string, members: readonly number[], afterField: boolean): void {
        const pool = this.previous.laterColsByColId?.get(colId);
        if (pool === undefined || ((this.leafFlags[members[0]] & RESERVED) !== 0) !== afterField) {
            return;
        }
        const { leafDefs, leafClaims } = this;
        const len = members.length;
        for (let k = 0; k < len; ++k) {
            const i = members[k];
            const field = this.isOpen(i) ? leafDefs[i]!.field : undefined;
            const col = field == null ? undefined : this.firstTakeable(pool, leafDefs[i]!, true);
            if (col !== undefined) {
                this.claim(i, col);
            }
        }
        const olds = newKeyed<AgColumn>();
        if (afterField && this.previous.colsById.has(colId)) {
            addSlot(olds, SLOT_UNPAIRED); // the column at the id held outside: removed, as its first leaf takes another
        }
        for (let j = 0, poolLen = pool.length; j < poolLen; ++j) {
            const col = pool[j];
            if (col.buildToken === this.buildToken) {
                addSlot(olds, members.some((i) => leafClaims[i] === col) ? SLOT_KEPT : SLOT_UNPAIRED);
            } else if (this.ids.isHeld(col.colId)) {
                addSlot(olds, SLOT_KEPT); // its id is held for a column kept, outside the build or still to build
            } else if (this.canTake(col, undefined) && builtField(col) === undefined) {
                addKeyed(olds, col, columnKey(col));
            }
        }
        const news = newKeyed<number>();
        for (let k = 0; k < len; ++k) {
            this.addLeaf(news, members[k]);
        }
        this.claimMatches(olds, news);
    }

    /** The leaves without colId or field take old ones without, by header key, then at their position. */
    private pairAnonymous(): void {
        const leafDefs = this.leafDefs;
        const len = leafDefs.length;
        let first = 0;
        while (first < len) {
            const def = leafDefs[first];
            if (def !== null && def.colId == null && def.field == null && this.isOpen(first)) {
                break;
            }
            ++first;
        }
        if (first === len) {
            return; // none left to pair
        }
        const news = newKeyed<number>();
        for (let i = 0; i < len; ++i) {
            const def = leafDefs[i];
            if (def !== null && (def.colId == null || this.leafClaims[i] !== undefined)) {
                this.addLeaf(news, i);
            }
        }
        const olds = newKeyed<AgColumn>();
        for (const col of this.previous.colsById.values()) {
            if (col.buildToken === this.buildToken || this.ids.isHeld(col.colId)) {
                addSlot(olds, SLOT_KEPT); // kept, or its id is held for another column
            } else if (isAnonymousColumn(col) && this.canTake(col, undefined)) {
                addKeyed(olds, col, columnKey(col));
            }
        }
        this.claimMatches(olds, news);
    }

    /** Adds leaf `i` to a position list, unless it takes no column and has a field or a set aside column. */
    private addLeaf(news: Keyed<number>, i: number): void {
        const def = this.leafDefs[i]!;
        const flags = this.leafFlags[i];
        if (this.leafClaims[i] !== undefined) {
            addSlot(news, SLOT_KEPT);
        } else if ((flags & HELD) !== 0) {
            addSlot(news, SLOT_UNPAIRED);
        } else if (def.field == null && (flags & SET_ASIDE) === 0) {
            addKeyed(news, i, headerSegment(def.headerName) + this.groupKeys[i]);
        }
    }

    private claimMatches(olds: Keyed<AgColumn>, news: Keyed<number>): void {
        const matches = matchByKey(olds, news, true, this.grouped);
        const items = news.items;
        for (let k = 0, len = matches.length; k < len; ++k) {
            const col = matches[k];
            if (col !== undefined) {
                this.claim(items[k]!, col);
            }
        }
    }

    /** The first column of `cols` `def` can take by its field; `repeated`: among its colId's suffixed columns. */
    private firstTakeable(cols: readonly AgColumn[], def: ColDef, repeated: boolean): AgColumn | undefined {
        const field = def.field;
        for (let j = 0, len = cols.length; j < len; ++j) {
            const col = cols[j];
            if ((!repeated || builtField(col) === field) && this.canTake(col, field)) {
                return col;
            }
        }
        return undefined;
    }

    /** Whether leaf `i` is built and neither took a column nor is held. */
    private isOpen(i: number): boolean {
        return (
            this.leafDefs[i] !== null &&
            this.leafClaims[i] === undefined &&
            (this.leafFlags[i] & (HELD | SET_ASIDE)) === 0
        );
    }

    /** Whether no leaf took `col`, its id is neither held by this build nor by a live column outside the last build, and
     *  its source column (a pivot result column's value column) lives. */
    private isAvailable(col: AgColumn): boolean {
        return (
            col.buildToken !== this.buildToken &&
            !this.ids.isHeld(col.colId) &&
            col.pivotValueColumn?.isAlive() !== false
        );
    }

    /** Whether `col` is available and no definition other than one with `ownField` now declares its id. */
    private canTake(col: AgColumn, ownField: string | null | undefined): boolean {
        if (!this.isAvailable(col)) {
            return false;
        }
        const ids = this.ids;
        const colId = col.colId;
        return !ids.isDeclared(colId) && !(col.isIdGenerated() && colId !== ownField && ids.isField(colId));
    }

    private claim(i: number, col: AgColumn): void {
        this.leafClaims[i] = col;
        col.buildToken = this.buildToken;
        this.ids.reserve(col.colId, null);
    }
}

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
        return isBuiltFromField(prev, field);
    }
    return isAnonymousColumn(prev) && headerSegment(prevDef.headerName) === headerSegment(def.headerName);
};

/** A slot to pair: it has an item and a match key. */
const SLOT_OPEN = 0;
/** A kept item: it counts for position as kept, and pairs with none. */
const SLOT_KEPT = 1;
/** An item removed or added that pairs with none, as a held leaf: it counts for position as open. */
const SLOT_UNPAIRED = 2;
type SlotKind = typeof SLOT_OPEN | typeof SLOT_KEPT | typeof SLOT_UNPAIRED;

/** Slots in order, each with its kind; an open one with its item and match key (own header first, then its groups'). */
export interface Keyed<T> {
    readonly kinds: SlotKind[];
    readonly items: (T | undefined)[];
    readonly keys: string[];
}

export const newKeyed = <T>(): Keyed<T> => ({ kinds: [], items: [], keys: [] });

/** Adds an open slot. */
export const addKeyed = <T>(keyed: Keyed<T>, item: T, key: string): void => {
    keyed.kinds.push(SLOT_OPEN);
    keyed.items.push(item);
    keyed.keys.push(key);
};

/** Adds a slot without item or key. */
const addSlot = (keyed: Keyed<unknown>, kind: typeof SLOT_KEPT | typeof SLOT_UNPAIRED): void => {
    keyed.kinds.push(kind);
    keyed.items.push(undefined);
    keyed.keys.push('');
};

/** A group definition merged over `defaultColGroupDef`, whose groupId is no group's id, as allocation reads it. */
export const _mergeGroupDef = (def: ColGroupDef, defaultColGroupDef: Partial<ColGroupDef> | undefined): ColGroupDef => {
    const merged: ColGroupDef = { ...defaultColGroupDef, ...def };
    if (defaultColGroupDef?.groupId !== undefined) {
        merged.groupId = def.groupId;
    }
    return merged;
};

/** Per new item its old one: by key, then (with `byPosition`) by own header when `grouped` (a key may hold a group
 *  part), then at its position when as many are removed as added, and as many kept or matched come before it on both sides. */
export const matchByKey = <T>(
    olds: Keyed<T>,
    news: Keyed<unknown>,
    byPosition: boolean,
    grouped: boolean
): (T | undefined)[] => {
    const oldKinds = olds.kinds;
    const newKinds = news.kinds;
    const matched = new Uint8Array(oldKinds.length);
    const result: (T | undefined)[] = new Array(newKinds.length).fill(undefined);
    pairEqual(olds, news, matched, result, false);
    if (!byPosition) {
        return result;
    }
    if (grouped) {
        pairEqual(olds, news, matched, result, true);
    }
    let removed = 0;
    for (let j = 0, len = oldKinds.length; j < len; ++j) {
        removed += oldKinds[j] === SLOT_UNPAIRED || (oldKinds[j] === SLOT_OPEN && matched[j] === 0) ? 1 : 0;
    }
    let added = 0;
    for (let k = 0, len = newKinds.length; k < len; ++k) {
        added += newKinds[k] === SLOT_UNPAIRED || (newKinds[k] === SLOT_OPEN && result[k] === undefined) ? 1 : 0;
    }
    if (removed !== added) {
        return result;
    }
    let oldKept = 0;
    let newKept = 0;
    for (let p = 0, len = Math.min(oldKinds.length, newKinds.length); p < len; ++p) {
        const oldOpen = oldKinds[p] === SLOT_OPEN && matched[p] === 0;
        const newOpen = newKinds[p] === SLOT_OPEN && result[p] === undefined;
        if (oldOpen && newOpen && oldKept === newKept) {
            result[p] = olds.items[p];
            ++oldKept;
            ++newKept;
            continue;
        }
        oldKept += oldKinds[p] !== SLOT_UNPAIRED && !oldOpen ? 1 : 0;
        newKept += newKinds[p] !== SLOT_UNPAIRED && !newOpen ? 1 : 0;
    }
    return result;
};

/** Pairs, in order, the open items whose keys (`own`: own headers) are equal. */
const pairEqual = <T>(
    olds: Keyed<T>,
    news: Keyed<unknown>,
    matched: Uint8Array,
    result: (T | undefined)[],
    own: boolean
): void => {
    const { kinds, keys } = olds;
    const byKey = new Map<string, number[]>();
    for (let j = kinds.length - 1; j >= 0; --j) {
        if (kinds[j] !== SLOT_OPEN || matched[j] !== 0) {
            continue;
        }
        _pushToMapArray(byKey, own ? ownSegment(keys[j]) : keys[j], j);
    }
    const newKinds = news.kinds;
    const newKeys = news.keys;
    for (let k = 0, len = newKinds.length; k < len; ++k) {
        const candidates =
            newKinds[k] === SLOT_OPEN && result[k] === undefined
                ? byKey.get(own ? ownSegment(newKeys[k]) : newKeys[k])
                : undefined;
        const j = candidates?.pop();
        if (j !== undefined) {
            matched[j] = 1;
            result[k] = olds.items[j];
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

const columnKey = (col: AgColumn): string =>
    headerSegment(col.userProvidedColDef?.headerName) + oldGroupsKey(col.originalParent);

/** The field `col`'s definition set at its last build, `undefined` when it set none (one from a column type is none). */
const builtField = (col: AgColumn): string | undefined =>
    col.userProvidedColDef?.field != null ? (col.colDef.field as string | undefined) : undefined;

/** Whether `col` was created from `field`: its id is the field's, or the field's suffixed, and no other colId set it. */
const isBuiltFromField = (col: AgColumn, field: string): boolean => {
    const colId = col.userProvidedColDef?.colId;
    const id = col.colId;
    return (
        builtField(col) === field &&
        (colId == null || colId === field) &&
        (col.isIdGenerated() ? _isSuffixedId(id, field) : id === field)
    );
};

/** The n-th column `def` built as the same object, 0-based. */
const ownColumn = (previous: ColumnTreeBuild, def: ColDef, use: number): AgColumn | undefined =>
    use === 0 ? previous.colsByDef.get(def) : previous.laterColsByDef?.get(def)?.[use - 1];

const isAnonymousColumn = (col: AgColumn): boolean => {
    const def = col.userProvidedColDef;
    return def != null && def.colId == null && def.field == null;
};
