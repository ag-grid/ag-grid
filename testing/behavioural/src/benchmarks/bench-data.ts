// Shared, browser-safe row-data builders for the benchmark suites. Only depends on SimplePRNG, so it
// stays loadable under the real-browser runner (no node/jsdom helpers). Builders are deterministic
// (fixed seeds) so base and test sides measure identical data.
import { SimplePRNG } from '../test-utils/prng';

// ── Flat data (id / name / value) — shared by the flat-pipelines benches. ────────────────────────

export interface FlatRow {
    id: string;
    name: string;
    value: number;
}

export function buildFlatData(rowCount: number, seed = 0x12345678): FlatRow[] {
    const prng = new SimplePRNG(seed);
    const rows = new Array<FlatRow>(rowCount);
    for (let i = 0; i < rowCount; ++i) {
        rows[i] = { id: i.toString(), name: prng.nextString(10), value: prng.nextFloat(0, 1000) };
    }
    return rows;
}

/** Cell-churn update: rewrite `fraction` of rows (same ids) with fresh name + value. */
export function buildFlatUpdate(rows: FlatRow[], fraction = 0.3, seed = 0x9abcdef0): FlatRow[] {
    const prng = new SimplePRNG(seed);
    const updateCount = Math.floor(rows.length * fraction);
    const result = rows.slice();
    for (let i = 0; i < updateCount; ++i) {
        result[i] = { id: rows[i].id, name: prng.nextString(10), value: rows[i].value };
    }
    return result;
}

/**
 * Sorting-update variant: rewrite `updateRatio` of rows AND shuffle `shuffleRatio` of the untouched
 * tail, so a delta sort has both changed keys and reordered-but-unchanged rows to reconcile.
 */
export function buildFlatSortUpdate(
    rows: FlatRow[],
    updateRatio = 0.3,
    shuffleRatio = 0.05,
    seed = 0x9abcdef0
): FlatRow[] {
    const prng = new SimplePRNG(seed);
    const total = rows.length;
    const updateCount = Math.floor(total * updateRatio);
    const result = new Array<FlatRow>(total);
    for (let i = 0; i < updateCount; ++i) {
        result[i] = { id: rows[i].id, name: prng.nextString(10), value: rows[i].value };
    }
    const tail = rows.slice(updateCount);
    shuffleSome(tail, shuffleRatio, prng);
    for (let i = 0, len = tail.length; i < len; ++i) {
        result[updateCount + i] = tail[i];
    }
    return result;
}

/** In-place: move `ratio` of rows to random new positions (used to perturb order without changing data). */
function shuffleSome<T>(rows: T[], ratio: number, prng: SimplePRNG): void {
    const moveCount = Math.floor(rows.length * ratio);
    if (moveCount <= 0 || rows.length < 2) {
        return;
    }
    for (let i = 0; i < moveCount; ++i) {
        const [row] = rows.splice(prng.nextInt(0, rows.length - 1), 1);
        rows.splice(prng.nextInt(0, rows.length), 0, row);
    }
}

export const GROUP_LABELS: readonly (readonly string[])[] = [
    ['Department A', 'Department B', 'Department C', 'Department D', 'Department E'],
    ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6'],
    ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta', 'Project Epsilon'],
    ['North', 'South', 'East', 'West', 'Central'],
    ['Group A', 'Group B', 'Group C', 'Group D', 'Group E'],
];

export interface GroupedRow {
    id: string;
    group1: string;
    group2: string;
    group3: string;
    group4: string;
    group5: string;
    name: string;
    value: number;
    count: number;
}

function pickGroups(prng: SimplePRNG): Pick<GroupedRow, 'group1' | 'group2' | 'group3' | 'group4' | 'group5'> {
    return {
        group1: prng.pick(GROUP_LABELS[0])!,
        group2: prng.pick(GROUP_LABELS[1])!,
        group3: prng.pick(GROUP_LABELS[2])!,
        group4: prng.pick(GROUP_LABELS[3])!,
        group5: prng.pick(GROUP_LABELS[4])!,
    };
}

export function buildGroupedData(rowCount: number, seed = 0x13d24a75): GroupedRow[] {
    const prng = new SimplePRNG(seed);
    const rows = new Array<GroupedRow>(rowCount);
    for (let i = 0; i < rowCount; ++i) {
        rows[i] = {
            id: i.toString(),
            ...pickGroups(prng),
            name: prng.nextString(10),
            value: prng.nextFloat(1, 1000),
            count: prng.nextInt(1, 100),
        };
    }
    return rows;
}

/** Incremental structural update: delete ~3%, regroup ~5% (new group keys), add ~3% — a realistic delta. */
export function buildGroupedStructuralUpdate(rows: GroupedRow[], seed = 0x3d24a75): GroupedRow[] {
    const prng = new SimplePRNG(seed);
    const result = rows.slice();

    let count = result.length;
    const deletes = Math.floor(count * 0.03);
    for (let i = 0; i < deletes; ++i) {
        result.splice(prng.nextInt(0, count - 1), 1);
        --count;
    }

    const moves = Math.floor(count * 0.05);
    for (let i = 0; i < moves; ++i) {
        const idx = prng.nextInt(0, count - 1);
        const row = result[idx];
        result[idx] = { ...row, ...pickGroups(prng), value: row.value * prng.nextFloat(0.8, 1.2) };
    }

    const adds = Math.floor(count * 0.03);
    for (let i = 0; i < adds; ++i) {
        result.push({
            id: `new-${result.length + i}`,
            ...pickGroups(prng),
            name: prng.nextString(10),
            value: prng.nextFloat(1, 1000),
            count: prng.nextInt(1, 100),
        });
    }

    return result;
}

/** Cell-churn update: rewrite name + value of `fraction` of rows; same ids and group structure. */
export function buildGroupedCellUpdate(rows: GroupedRow[], fraction = 0.3, seed = 0x9abcdef0): GroupedRow[] {
    const prng = new SimplePRNG(seed);
    const updateCount = Math.floor(rows.length * fraction);
    const result = rows.slice();
    for (let i = 0; i < updateCount; ++i) {
        result[i] = { ...rows[i], name: prng.nextString(10), value: prng.nextFloat(1, 1000) };
    }
    return result;
}

/** `fraction` distinct row indices, no repeats. */
function sampleIndices(total: number, fraction: number, prng: SimplePRNG): number[] {
    const target = Math.floor(total * fraction);
    const picked = new Set<number>();
    while (picked.size < target) {
        picked.add(prng.nextInt(0, total - 1));
    }
    return [...picked];
}

/** Immutable partial update: clone `fraction` of rows and randomise their first `colCount` v-columns. */
export function buildValuePartialUpdate<T extends Record<string, string | number>>(
    rows: T[],
    colCount: number,
    fraction: number,
    seed: number
): T[] {
    const prng = new SimplePRNG(seed);
    const result = rows.slice();
    for (const idx of sampleIndices(rows.length, fraction, prng)) {
        const row = { ...result[idx] };
        for (let v = 0; v < colCount; ++v) {
            row[`v${v}` as keyof T] = prng.nextFloat(1, 1000) as T[keyof T];
        }
        result[idx] = row;
    }
    return result;
}

/** Transaction edits for `fraction` of rows: forward scales the first `colCount` v-cols, reverse restores. */
export function buildValueEdits<T extends Record<string, string | number>>(
    rows: T[],
    colCount: number,
    fraction: number,
    seed: number
): { forward: T[]; reverse: T[] } {
    const prng = new SimplePRNG(seed);
    const forward: T[] = [];
    const reverse: T[] = [];
    for (const idx of sampleIndices(rows.length, fraction, prng)) {
        const original = rows[idx];
        const modified = { ...original };
        for (let v = 0; v < colCount; ++v) {
            const key = `v${v}` as keyof T;
            modified[key] = ((modified[key] as number) * prng.nextFloat(0.5, 1.5)) as T[keyof T];
        }
        forward.push(modified);
        reverse.push(original);
    }
    return { forward, reverse };
}
