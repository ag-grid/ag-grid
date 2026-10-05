import type { ServerSideLevelInconsistency } from 'ag-grid-community';

export interface SettledRowLookup {
    /** Index of the row with this id, if it is loaded and not waiting to be refreshed. */
    getSettledIndex(id: string): number | undefined;
    /** Id of the row at this index, if it is loaded and not waiting to be refreshed. */
    getSettledId(index: number): string | undefined;
}

/**
 * Compares the blocks of one SSRM level as they load. Each block request includes one row past the end of the
 * block, so both blocks either side of a boundary report which row sits at that boundary.
 */
export class LevelConsistencyChecker {
    /** Id of the row each boundary's preceding block saw at that boundary. */
    private readonly boundaryIds = new Map<number, string>();
    private readonly pending = new Map<number, ServerSideLevelInconsistency>();

    constructor(private readonly lookup: SettledRowLookup) {}

    /**
     * Must be called before the block's rows are written into the level.
     * @returns true if inconsistencies are waiting to be reported
     */
    public checkBlock(startRow: number, blockSize: number, rowIds: string[], overlapId: string | undefined): boolean {
        const { boundaryIds, lookup } = this;
        const endRow = startRow + blockSize;
        const rowCount = rowIds.length;
        const duplicates = new Map<number, string[]>();
        const mismatches: number[] = [];

        this.forgetEvictedBoundaries();

        for (let i = 0; i < rowCount; ++i) {
            const id = rowIds[i];
            const index = lookup.getSettledIndex(id);
            if (index === undefined || (index >= startRow && index < endRow)) {
                continue;
            }
            const boundary = index < startRow ? startRow : endRow;
            const ids = duplicates.get(boundary);
            if (ids) {
                ids.push(id);
            } else {
                duplicates.set(boundary, [id]);
            }
        }

        const expectedFirstId = boundaryIds.get(startRow);
        if (
            rowCount > 0 &&
            expectedFirstId !== undefined &&
            expectedFirstId !== rowIds[0] &&
            lookup.getSettledId(startRow - 1) !== undefined
        ) {
            mismatches.push(startRow);
        }

        if (overlapId === undefined || rowCount < blockSize) {
            boundaryIds.delete(endRow);
        } else {
            boundaryIds.set(endRow, overlapId);
            const nextFirstId = lookup.getSettledId(endRow);
            if (nextFirstId !== undefined && nextFirstId !== overlapId) {
                mismatches.push(endRow);
            }
        }

        duplicates.forEach((ids, boundary) => this.record('duplicated', boundary, ids));
        for (let i = 0, len = mismatches.length; i < len; ++i) {
            if (!duplicates.has(mismatches[i])) {
                this.record('dropped', mismatches[i], []);
            }
        }

        return this.pending.size > 0;
    }

    /** Boundary ids and pending inconsistencies are positional, so they must be forgotten whenever rows move for any reason other than a read. */
    public reset(): void {
        this.forgetBoundaries();
        this.pending.clear();
    }

    /** Forgets where rows sat, but keeps inconsistencies already found by earlier reads. */
    public forgetBoundaries(): void {
        this.boundaryIds.clear();
    }

    /** A boundary is only compared while the block before it is cached, so drop the rest to keep this to the cache size. */
    private forgetEvictedBoundaries(): void {
        const { boundaryIds, lookup } = this;
        boundaryIds.forEach((_id, boundary) => {
            if (lookup.getSettledId(boundary - 1) === undefined) {
                boundaryIds.delete(boundary);
            }
        });
    }

    public takeInconsistencies(): ServerSideLevelInconsistency[] {
        const inconsistencies = [...this.pending.values()].sort((a, b) => a.boundaryIndex - b.boundaryIndex);
        this.pending.clear();
        return inconsistencies;
    }

    private record(type: ServerSideLevelInconsistency['type'], boundaryIndex: number, rowIds: string[]): void {
        const existing = this.pending.get(boundaryIndex);
        if (!existing) {
            this.pending.set(boundaryIndex, { type, boundaryIndex, rowIds });
            return;
        }
        if (type === 'duplicated') {
            existing.type = 'duplicated';
            existing.rowIds = [...new Set([...existing.rowIds, ...rowIds])];
        }
    }
}
