import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { ColDef } from '../../entities/colDef';
import type { UserColumnProperty, UserColumnState } from '../../interfaces/gridState';

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
 *  by other state sections (width, hide, pinned, sort, …) stay with those sections. */
export class UserColumnService extends BeanStub implements NamedBean {
    beanName = 'userColumnSvc' as const;

    private readonly entries = new Map<string, UserColumnEntry>();

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

    public clear(): void {
        this.entries.clear();
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
                    properties: fromProperties(state.properties),
                    parentGroupId: state.parentGroupId ?? null,
                    created: true,
                });
            } else if (this.beans.colModel.getCol(colId) !== undefined) {
                // Changes to a column the developer no longer declares are dropped: state configures the
                // developer's columns, it cannot reinstate one they have taken away.
                next.set(colId, { properties: fromProperties(state.properties) });
            }
        }
        if (entriesEqual(entries, next)) {
            return false;
        }
        entries.clear();
        next.forEach((entry, colId) => entries.set(colId, entry));
        return true;
    }
}

const toProperties = (properties: ColDef | undefined): UserColumnProperty[] => {
    if (!properties) {
        return [];
    }
    const keys = Object.keys(properties);
    const result: UserColumnProperty[] = [];
    for (let i = 0, len = keys.length; i < len; ++i) {
        const property = keys[i];
        const value = (properties as Record<string, any>)[property];
        // Functions and components cannot be serialised; a creation path contributing one is a bug there.
        if (typeof value !== 'function') {
            result.push({ property, value });
        }
    }
    return result;
};

const fromProperties = (properties: UserColumnProperty[] | undefined): ColDef => {
    const result: Record<string, any> = {};
    for (let i = 0, len = properties?.length ?? 0; i < len; ++i) {
        const { property, value } = properties![i];
        if (property != null) {
            result[property] = value;
        }
    }
    return result as ColDef;
};

const entriesEqual = (a: Map<string, UserColumnEntry>, b: Map<string, UserColumnEntry>): boolean => {
    if (a.size !== b.size) {
        return false;
    }
    let equal = true;
    a.forEach((entry, colId) => {
        if (!equal) {
            return;
        }
        const other = b.get(colId);
        if (
            other === undefined ||
            !!entry.removed !== !!other.removed ||
            !!entry.created !== !!other.created ||
            entry.parentGroupId !== other.parentGroupId ||
            !propertiesEqual(entry.properties, other.properties)
        ) {
            equal = false;
        }
    });
    return equal;
};

const propertiesEqual = (a: ColDef | undefined, b: ColDef | undefined): boolean => {
    const aKeys = a ? Object.keys(a) : [];
    const bKeys = b ? Object.keys(b) : [];
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    for (let i = 0, len = aKeys.length; i < len; ++i) {
        const key = aKeys[i];
        if ((a as Record<string, any>)[key] !== (b as Record<string, any>)[key]) {
            return false;
        }
    }
    return true;
};
