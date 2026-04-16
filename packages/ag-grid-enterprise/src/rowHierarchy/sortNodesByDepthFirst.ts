import type { IRowNode, RowNode } from 'ag-grid-community';

/**
 * Reusable counting-sort bucket buffer, one entry per tree level.
 * Lazily allocated on first sort. Self-cleaning: only used entries are zeroed after each sort.
 * Grows by power of two (never shrunk); initial size 64 entries (256 bytes).
 */
let _sortBuckets: Uint32Array | null = null;

/** Cold path: allocates or grows the bucket buffer. */
const sortBucketsAlloc = (minBucket: number): Uint32Array => {
    const old = _sortBuckets;
    const newBuckets = new Uint32Array(1 << (32 - Math.clz32(minBucket | 63)));
    if (old) {
        newBuckets.set(old); // preserve counts accumulated so far
    }
    _sortBuckets = newBuckets;
    return newBuckets;
};

/**
 * In-place stable two-level partition: deep nodes first, then shallow.
 * Single-element minorities use copyWithin (zero allocation).
 * General case buffers the shallow minority into a short-lived local array.
 */
const sortTwoLevels = (nodes: IRowNode[], nodeCount: number, deepest: number, deepCount: number): IRowNode[] => {
    const shallowCount = nodeCount - deepCount;
    const deepLevel = deepest - 1; // precomputed to avoid repeated + 1 in tight loops

    // Single shallow node — find it and rotate to end. Zero allocation.
    if (shallowCount === 1) {
        let si = 0;
        while (nodes[si].level === deepLevel) {
            ++si;
        }
        if (si < nodeCount - 1) {
            const shallow = nodes[si];
            nodes.copyWithin(si, si + 1);
            nodes[nodeCount - 1] = shallow;
        }
        return nodes;
    }

    // Single deep node — find it and rotate to front. Zero allocation.
    if (deepCount === 1) {
        let di = 0;
        while (nodes[di].level !== deepLevel) {
            ++di;
        }
        if (di > 0) {
            const deep = nodes[di];
            nodes.copyWithin(1, 0, di);
            nodes[0] = deep;
        }
        return nodes;
    }

    // General case: buffer shallow nodes, compact deep nodes left, append shallow.
    const shallow = new Array<IRowNode>(shallowCount);
    let di = 0;
    let si = 0;
    for (let i = 0; i < nodeCount; ++i) {
        const node = nodes[i];
        if (node.level === deepLevel) {
            nodes[di++] = node;
        } else {
            shallow[si++] = node;
        }
    }
    for (let i = 0; i < shallowCount; ++i) {
        nodes[deepCount + i] = shallow[i];
    }
    return nodes;
};

const countingSort = (nodes: IRowNode[], nodesLen: number): RowNode[] => {
    // Single-pass: find level range, check sorted order, and count per-level.
    // `unsorted` accumulates sign bits: `prevB - b` is negative when a shallower node
    // precedes a deeper one. `unsorted >= 0` => already sorted.
    let deepest = nodes[0].level + 1;
    let shallowest = deepest;
    let unsorted = 0;
    let prevB = deepest;

    // Bucket index = level + 1 (because root is -1)
    let buckets = _sortBuckets;
    if (!buckets || deepest >= buckets.length) {
        buckets = sortBucketsAlloc(deepest);
    }
    ++buckets[deepest];

    for (let i = 1; i < nodesLen; ++i) {
        const b = nodes[i].level + 1;
        if (b > deepest) {
            deepest = b;
            if (deepest >= buckets.length) {
                buckets = sortBucketsAlloc(deepest);
            }
        } else if (b < shallowest) {
            shallowest = b;
        }
        ++buckets[b];
        unsorted |= prevB - b;
        prevB = b;
    }

    if (unsorted >= 0) {
        buckets.fill(0, shallowest, deepest + 1); // clean up counts
        return nodes as RowNode[];
    }

    const sCount = buckets[shallowest];
    const dCount = buckets[deepest];

    // Fast path: exactly 2 distinct levels.
    if (sCount + dCount === nodesLen) {
        buckets[shallowest] = 0;
        buckets[deepest] = 0;
        return sortTwoLevels(nodes, nodesLen, deepest, dCount) as RowNode[];
    }

    // Prefix-sum — convert counts to write cursors, deepest bucket at position 0.
    let pos = 0;
    for (let b = deepest; b >= shallowest; --b) {
        const count = buckets[b];
        buckets[b] = pos;
        pos += count;
    }

    // Scatter — sequential writes per bucket for cache-friendly output.
    const output = new Array<IRowNode>(nodesLen);
    for (let i = 0; i < nodesLen; ++i) {
        const node = nodes[i];
        output[buckets[node.level + 1]++] = node;
    }

    buckets.fill(0, shallowest, deepest + 1); // self-clean for next call
    return output as RowNode[];
};

/**
 * Sorts `nodes` by `RowNode.level` descending (deepest first).
 * Returns the input array (mutated in-place) or a new sorted array.
 * The sort is stable: nodes at the same level preserve their input order.
 *
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _sortNodesByDepthFirst = (nodes: IRowNode[], nodesLen = nodes.length): RowNode[] => {
    // Just two nodes - swap them if we need to, O(1).
    if (nodesLen === 2) {
        if (nodes[0].level < nodes[1].level) {
            const tmp = nodes[0];
            nodes[0] = nodes[1];
            nodes[1] = tmp;
        }
        return nodes as RowNode[];
    }

    if (nodesLen > 16) {
        // More than 16 nodes, use counting sort, which is O(n)
        return countingSort(nodes, nodesLen);
    }

    // Insertion sort for tiny arrays, where overhead of counting sort isn't worth it.
    // O(n*n) but very efficient for data sets that are already substantially sorted.
    // https://en.wikipedia.org/wiki/Insertion_sort
    for (let i = 1; i < nodesLen; i++) {
        const value = nodes[i];
        const valueLevel = value.level;
        let j = i - 1;
        if (nodes[j].level < valueLevel) {
            let k = i;
            do {
                nodes[k] = nodes[j];
                k = j--;
            } while (j >= 0 && nodes[j].level < valueLevel);
            nodes[k] = value;
        }
    }
    return nodes as RowNode[];
};
