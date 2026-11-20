import type { AgColumn } from '../../../entities/agColumn';
import type { AgProvidedColumnGroup } from '../../../entities/agProvidedColumnGroup';

/** One column tree build's ids, live while it is built: declared ids beat generated ones, as in a new grid.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ColumnIdAllocator {
    /** Ids this build gave or holds, each with the kept padding group it is reserved for (`null`: anything else). */
    private readonly held = new Map<string, AgProvidedColumnGroup | null>();
    /** The colIds and groupIds the definitions declare. */
    private readonly declared = new Set<string>();
    /** The fields that make the definitions' ids: positional and suffixed ids yield to them. */
    private readonly fields = new Set<string>();
    private nextPositional = 0;
    /** The first number past the positional ids, once {@link endPositionalIds} ran; padded ids start there. */
    private positionalEnd = 0;
    private nextPadded = 0;

    public constructor(
        /** Live columns by id, the last build's and those outside it (pivot results see the primary columns, and the reverse). */
        private readonly existingColsById: { readonly [id: string]: AgColumn },
        /** The last build's token, `undefined` for a first build: a live column carrying it belongs to the last build. */
        private readonly previousBuildToken: number | undefined,
        /** This build's token, stamped on what it creates. */
        public readonly buildToken: number
    ) {}

    /** Records a colId or groupId the definitions declare; `false` when an earlier definition declared it. */
    public declare(id: string): boolean {
        const declared = this.declared;
        const size = declared.size;
        declared.add(id);
        return declared.size !== size;
    }

    /** Records the field a definition without colId takes its id from. */
    public declareField(field: string): void {
        this.fields.add(field);
    }

    public isDeclared(id: string): boolean {
        return this.declared.has(id);
    }

    public isField(id: string): boolean {
        return this.fields.has(id);
    }

    /** Reserves `id` for `owner` (a kept padding group, else `null`): no new column or group is given it. */
    public reserve(id: string, owner: AgProvidedColumnGroup | null): void {
        this.held.set(id, owner);
    }

    /** The kept padding group `id` is reserved for, `null` when none is. */
    public paddingOwner(id: string): AgProvidedColumnGroup | null {
        return this.held.get(id) ?? null;
    }

    /** Whether a kept hierarchy part's id may stay: none took or claims it, no colId or groupId declares it. */
    public canKeep(id: string): boolean {
        return !this.isHeld(id) && !this.declared.has(id);
    }

    /** Whether a kept padding group's id is now a user key or in the positional range: its chain is rebuilt. */
    public isNowUserOrPositionalId(id: string): boolean {
        if (this.declared.has(id) || this.fields.has(id)) {
            return true;
        }
        const n = Number(id);
        return n < this.positionalEnd && String(n) === id;
    }

    /** Ends the positional range after the `count` ids taken by position in a new grid, before padded ids are allocated. */
    public endPositionalIds(count: number): void {
        let n = 0;
        for (let left = count; left > 0; --left) {
            while (this.isTakenInNewGrid(String(n))) {
                ++n;
            }
            ++n;
        }
        this.positionalEnd = n;
        this.nextPadded = n;
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
            while (!this.isFree(id)) {
                id = `${base}_${++suffix}`;
            }
        }
        this.held.set(id, null);
        return id;
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
        return this.held.has(id) || this.isHeldOutside(id);
    }

    private isHeldOutside(id: string): boolean {
        const token = this.existingColsById[id]?.buildToken;
        return token !== undefined && token !== this.previousBuildToken && token !== this.buildToken;
    }

    /** Whether a new grid with the same definitions would give `id` no column by position. */
    private isTakenInNewGrid(id: string): boolean {
        return this.declared.has(id) || this.fields.has(id) || this.isHeldOutside(id);
    }

    /** Whether a generated id may be `id`: none holds it and no definition declares it or takes it from its field. */
    private isFree(id: string): boolean {
        return !this.held.has(id) && !this.isTakenInNewGrid(id);
    }

    private firstFreeNumber(from: number): number {
        let n = from;
        while (!this.isFree(String(n))) {
            ++n;
        }
        return n;
    }
}

/** Whether `id` is `base` with a `_1`, `_2`… suffix, as {@link ColumnIdAllocator.allocate} gives a taken `base`.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _isSuffixedId = (id: string, base: string): boolean => {
    const start = base.length + 1;
    const len = id.length;
    if (len <= start || id.charCodeAt(start - 1) !== 95 || id.charCodeAt(start) === 48 || !id.startsWith(base)) {
        return false; // 95: '_'; 48: '0', which no suffix starts with
    }
    for (let i = start; i < len; ++i) {
        const c = id.charCodeAt(i);
        if (c < 48 || c > 57) {
            return false;
        }
    }
    return true;
};
