import type { AgColumn } from '../../../entities/agColumn';
import type { AgProvidedColumnGroup } from '../../../entities/agProvidedColumnGroup';

/** One column tree build's ids, live while it is built: declared ids beat generated ones, as in a new grid.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ColumnIdAllocator {
    /** Ids this build gave or holds, each with the kept padding group it is reserved for (`null`: anything else). */
    public readonly held = new Map<string, AgProvidedColumnGroup | null>();
    /** The colIds and groupIds the definitions declare. */
    public readonly declared = new Set<string>();
    /** The fields that make the definitions' ids: positional and suffixed ids yield to them. */
    public readonly fields = new Set<string>();
    private nextPositional = 0;
    /** The next padding group id to try: set past the ids the definitions take by position. */
    public nextPadded = 0;
    private lastSuffixes: Map<string, number> | undefined;

    public constructor(
        /** Live columns by id, the last build's and those outside it (pivot results see the primary columns, and the reverse). */
        private readonly existingColsById: { readonly [id: string]: AgColumn },
        /** The last build's token, `undefined` for a first build: a live column carrying it belongs to the last build. */
        private readonly previousBuildToken: number | undefined,
        /** This build's token, stamped on what it creates. */
        public readonly buildToken: number
    ) {}

    /** Whether a definition now declares `id` or makes it from its field: a kept padding group at it is rebuilt. */
    public isUserKey(id: string): boolean {
        return this.declared.has(id) || this.fields.has(id);
    }

    /** A new column's or group's id: by position without `base`, else `base`, else `base` with its first free `_1`,
     *  `_2`… suffix; `generated`: an id from a field or hierarchy part, yielding to declared colIds and groupIds, and claimed ids. */
    public allocate(base: string | null | undefined, generated: boolean): string {
        let id: string;
        if (base == null) {
            const n = this.firstFreeNumber(this.nextPositional);
            this.nextPositional = n + 1;
            id = String(n);
        } else if (!this.isHeld(base) && !(generated && this.declared.has(base))) {
            id = base;
        } else {
            let suffix = 1;
            id = `${base}_1`;
            while (this.isHeld(id) || this.isUserKey(id)) {
                id = `${base}_${++suffix}`;
            }
        }
        this.held.set(id, null);
        return id;
    }

    /** The highest `_n` suffix a generated id of the last build's `colsById` gives `base` (0: none), read once. */
    public lastSuffix(base: string, colsById: ReadonlyMap<string, AgColumn>): number {
        let suffixes = this.lastSuffixes;
        if (suffixes === undefined) {
            suffixes = new Map();
            this.lastSuffixes = suffixes;
            for (const col of colsById.values()) {
                const match = col.isIdGenerated() ? /^(.+)_(\d+)$/.exec(col.colId) : null;
                if (match !== null && Number(match[2]) > (suffixes.get(match[1]) ?? 0)) {
                    suffixes.set(match[1], Number(match[2]));
                }
            }
        }
        return suffixes.get(base) ?? 0;
    }

    /** A new padding group's id, after the positional ones. */
    public allocatePadded(): string {
        const n = this.firstFreeNumber(this.nextPadded);
        this.nextPadded = n + 1;
        const id = String(n);
        this.held.set(id, null);
        return id;
    }

    /** Whether this build gave or holds `id`, or a live column outside the last build has it. */
    public isHeld(id: string): boolean {
        if (this.held.has(id)) {
            return true;
        }
        const token = this.existingColsById[id]?.buildToken;
        return token !== undefined && token !== this.previousBuildToken && token !== this.buildToken;
    }

    private firstFreeNumber(from: number): number {
        let n = from;
        let id = String(n);
        while (this.isHeld(id) || this.isUserKey(id)) {
            id = String(++n);
        }
        return n;
    }
}
