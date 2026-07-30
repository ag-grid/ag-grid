import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { ColDef, ColGroupDef } from '../../entities/colDef';
import type { UserColumnProperty, UserColumnPropertyKey, UserColumnState } from '../../interfaces/gridState';
import { _mergedEqual } from '../../utils/mergeDeep';

/** One column's user-owned layer entry. `properties` holds the definition the user configured; a
 *  `removed` entry is a tombstone for a `columnDefs`-declared column the user deleted. */
interface UserColumnEntry {
    properties?: ColDef;
    /** The user created this column, rather than changing one the developer declared. */
    created?: boolean;
    parentGroupId?: string | null;
    removed?: boolean;
}

/** Owns the user-column layer: columns created at runtime (e.g. through the Calculated Column dialog),
 *  property overrides on `columnDefs`-declared columns, and tombstones for ones the user removed. The
 *  layer is merged where developer `columnDefs` enter the column tree build, so every other service sees
 *  ordinary column definitions and needs no knowledge of grid state.
 *
 *  Entries are the record of what the user changed — nothing is derived by diffing definitions, and no
 *  marker is stamped on the column. Only serialisable definition properties belong here: properties owned
 *  by other state sections (width, hide, pinned, sort, …) stay with those sections.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class UserColumnService extends BeanStub implements NamedBean {
    beanName = 'userColumnSvc' as const;

    private readonly entries = new Map<string, UserColumnEntry>();
    /** Owners' enabled checks. An entry only reaches the built columns while an owner is active, so a
     *  disabled feature (or an unregistered module) preserves state without acting on it. */
    private readonly owners: (() => boolean)[] = [];
    /** Union of the properties the registered owners' UI can produce, or `null` while none have registered. */
    private ownedProperties: Set<UserColumnPropertyKey> | null = null;
    /** `colModel.colDefs` the declared lookup was built from; a new array rebuilds it. */
    private declaredDefsSource: (ColDef | ColGroupDef)[] | null | undefined;
    private declaredDefs = new Map<string, ColDef>();

    /** Registers a feature that builds user columns, along with its enabled check and the definition
     *  properties its UI lets a user configure. Incoming state is filtered to the registered properties, so
     *  the layer stays a record of user choices rather than a second route into `columnDefs`. */
    public registerOwner(isEnabled: () => boolean, ownedProperties: readonly UserColumnPropertyKey[]): void {
        this.owners.push(isEnabled);
        const properties = this.ownedProperties ?? new Set<UserColumnPropertyKey>();
        for (let i = 0, len = ownedProperties.length; i < len; ++i) {
            properties.add(ownedProperties[i]);
        }
        this.ownedProperties = properties;
    }

    public isActive(): boolean {
        const owners = this.owners;
        for (let i = 0, len = owners.length; i < len; ++i) {
            if (owners[i]()) {
                return true;
            }
        }
        return false;
    }

    /** The definition the developer declared for `colId`, untouched by any entry. The built column cannot
     *  serve: after the first rebuild its `userProvidedColDef` is the declaration with the entry already
     *  merged in, and a tombstoned column is not built at all. */
    public getDeclaredDef(colId: string): ColDef | undefined {
        const colDefs = this.beans.colModel.colDefs ?? null;
        if (this.declaredDefsSource !== colDefs) {
            const declaredDefs = new Map<string, ColDef>();
            collectDeclaredDefs(colDefs, declaredDefs);
            this.declaredDefs = declaredDefs;
            this.declaredDefsSource = colDefs;
        }
        return this.declaredDefs.get(colId);
    }

    public isDeclared(colId: string): boolean {
        return this.getDeclaredDef(colId) !== undefined;
    }

    public getEntry(colId: string): UserColumnEntry | undefined {
        return this.entries.get(colId);
    }

    public forEachEntry(callback: (entry: UserColumnEntry, colId: string) => void): void {
        this.entries.forEach(callback);
    }

    public hasEntries(): boolean {
        return this.entries.size > 0;
    }

    /** Records a column the user created, along with the group it belongs to. */
    public setCreatedColumn(colId: string, properties: ColDef, parentGroupId: string | null): void {
        this.entries.set(colId, { properties, parentGroupId, created: true });
    }

    /** Records the properties the user changed on a `columnDefs`-declared column. Placement is left alone:
     *  the declared column stays where the developer put it. */
    public setOverride(colId: string, properties: ColDef): void {
        this.entries.set(colId, { properties });
    }

    /** Tombstones a `columnDefs`-declared column so it stays removed across restores; a created column is
     *  simply dropped, as nothing would resurrect it. */
    public removeColumn(colId: string, declared: boolean): void {
        if (declared) {
            this.entries.set(colId, { removed: true });
        } else {
            this.entries.delete(colId);
        }
    }

    /** Drops a column's entry, reverting it to whatever `columnDefs` declares. */
    public clearColumn(colId: string): void {
        this.entries.delete(colId);
    }

    /** Drops the whole layer, returning whether it held anything. */
    public clear(): boolean {
        const { entries } = this;
        this.declaredDefsSource = undefined;
        if (!entries.size) {
            return false;
        }
        entries.clear();
        return true;
    }

    /** Build hook for `columnDefs`-declared columns: `null` when the user removed the column (never
     *  built), the merged definition when the user overrode properties, else `undefined`.
     *
     *  Matching happens on the declared key, before the build allocates a suffixed id for duplicates, so
     *  entries for several definitions sharing a `field` follow declaration order rather than the ids they
     *  end up with. */
    public overrideFor(def: ColDef): ColDef | null | undefined {
        const colId = def.colId ?? def.field;
        if (colId == null) {
            return undefined;
        }
        const entry = this.entries.get(colId);
        if (entry === undefined) {
            return undefined;
        }
        if (!this.isActive()) {
            // No owner to build or interpret these entries, so leave the developer's columns alone. The
            // entries stay in the layer and re-save unchanged, so restoring elsewhere is not lossy.
            return undefined;
        }
        if (entry.removed) {
            return null;
        }
        if (entry.created) {
            return undefined; // a created column is never declared, so this def is a different column
        }
        return entry.properties ? { ...def, ...entry.properties } : undefined;
    }

    public getState(): UserColumnState[] | undefined {
        const entries = this.entries;
        if (!entries.size) {
            return undefined;
        }
        const state: UserColumnState[] = [];
        entries.forEach((entry, colId) => {
            if (entry.removed) {
                state.push({ colId, removed: true });
                return;
            }
            const { parentGroupId, created } = entry;
            state.push(
                created
                    ? {
                          colId,
                          created,
                          parentGroupId: parentGroupId ?? null,
                          properties: toProperties(entry.properties),
                      }
                    : { colId, properties: toProperties(entry.properties) }
            );
        });
        return state;
    }

    /** Replaces the layer with `states`. Returns whether anything changed, so the caller can skip the
     *  column tree rebuild when a re-applied state is identical. */
    public setState(states: UserColumnState[] | undefined): boolean {
        const entries = this.entries;
        const next = new Map<string, UserColumnEntry>();
        for (let i = 0, len = states?.length ?? 0; i < len; ++i) {
            const state = states![i];
            const { colId } = state;
            if (colId == null) {
                continue;
            }
            if (state.removed) {
                next.set(colId, { removed: true });
            } else if (state.created) {
                next.set(colId, {
                    properties: this.acceptProperties(state.properties),
                    parentGroupId: state.parentGroupId ?? null,
                    created: true,
                });
            } else if (this.isDeclared(colId)) {
                // Changes to a column the developer no longer declares are dropped: state configures the
                // developer's columns, it cannot reinstate one they have taken away. Resolved against the
                // declarations, not the built columns — a tombstoned column is absent from the build.
                next.set(colId, { properties: this.acceptProperties(state.properties) });
            }
        }
        if (entriesEqual(entries, next)) {
            return false;
        }
        entries.clear();
        next.forEach((entry, colId) => entries.set(colId, entry));
        return true;
    }

    /** Converts a state entry's properties into a definition, keeping only what a registered owner's UI can
     *  produce with a serialisable value. `UserColumnProperty` already refuses anything else at compile
     *  time, so what reaches here is untyped state — a stored payload or hand-written JavaScript — and is
     *  dropped silently rather than merged into the column.
     *
     *  With no owner registered the properties pass through untouched: there is nothing to validate against,
     *  the entries never reach the built columns, and they must re-save unchanged so a state saved on a
     *  grid that has the feature is not lossy on one that does not. */
    private acceptProperties(properties: UserColumnProperty[] | undefined): ColDef {
        const owned = this.ownedProperties;
        const result: Record<string, any> = {};
        for (let i = 0, len = properties?.length ?? 0; i < len; ++i) {
            const { property, value } = properties![i];
            const accept = owned ? owned.has(property) && typeof value !== 'function' : property != null;
            if (accept) {
                result[property] = value;
            }
        }
        return result as ColDef;
    }
}

const toProperties = (properties: ColDef | undefined): UserColumnProperty[] => {
    if (!properties) {
        return [];
    }
    const keys = Object.keys(properties);
    const result: UserColumnProperty[] = [];
    for (let i = 0, len = keys.length; i < len; ++i) {
        // A creation path can only put an owned property on the definition it hands over, so the key cast
        // matches what `acceptProperties` enforces on the way back in.
        const property = keys[i] as UserColumnPropertyKey;
        const value = (properties as Record<string, any>)[property];
        // Functions and components cannot be serialised; a creation path contributing one is a bug there.
        if (typeof value !== 'function') {
            result.push({ property, value });
        }
    }
    return result;
};

const entriesEqual = (a: Map<string, UserColumnEntry>, b: Map<string, UserColumnEntry>): boolean => {
    if (a.size !== b.size) {
        return false;
    }
    for (const [colId, entry] of a) {
        const other = b.get(colId);
        if (
            other === undefined ||
            !!entry.removed !== !!other.removed ||
            !!entry.created !== !!other.created ||
            entry.parentGroupId !== other.parentGroupId ||
            !_mergedEqual(entry.properties ?? {}, other.properties ?? {})
        ) {
            return false;
        }
    }
    return true;
};

const collectDeclaredDefs = (defs: (ColDef | ColGroupDef)[] | null | undefined, result: Map<string, ColDef>): void => {
    for (let i = 0, len = defs?.length ?? 0; i < len; ++i) {
        const def = defs![i];
        const children = (def as ColGroupDef).children;
        if (children) {
            collectDeclaredDefs(children, result);
            continue;
        }
        const colDef = def as ColDef;
        // Same key the build matches on, before it allocates suffixed ids for duplicates.
        const colId = colDef.colId ?? colDef.field;
        if (colId != null && !result.has(colId)) {
            result.set(colId, colDef);
        }
    }
};
