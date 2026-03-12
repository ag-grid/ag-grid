import type { RowNode } from '../../entities/rowNode';
import { _sortNodesByDepthFirst } from '../sortNodesByDepthFirst';

/**
 * Tracks changed rows and which columns changed on each, using bitmasks for fast lookups.
 *
 * Used by the CSRM pipeline to skip unchanged rows/columns during aggregation.
 * Rows added via `addRow` are marked as all-columns-changed.
 * Rows added via `addCell` track specific columns.
 *
 * A single Map stores both row and column mappings — RowNode keys hold the row's bitmask
 * index (or -1 for all-columns), string keys hold the column slot number. Object and string
 * keys never collide in a Map. Changed columns are stored as bitmask arrays of 32-bit integers,
 * one array per group of 32 columns.
 *
 * Total space: O(R × ⌈C/32⌉ + C), where R = tracked rows (including ancestors), C = tracked columns.
 *
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export class ChangedCellsPath {
    readonly kind = 'cells' as const;

    /**
     * All tracked rows, lazily sorted by depth-first when `getSortedRows` is called.
     * Space: O(R) where R = number of tracked rows (including ancestors).
     */
    private rows: RowNode[] = [];

    /**
     * True when `rows` needs resorting, set after new tracked rows are added.
     * Space: O(1).
     */
    private unsorted: boolean = false;

    /**
     * Maps RowNode to row slot (or -1 for all-columns) and colId string to column slot.
     * Used also to check if a row is tracked (has a slot) in O(1).
     * RowNode keys never collide with string keys in a Map.
     * Space: O(R + C) where R = number of tracked rows (including ancestors), C = number of tracked columns.
     */
    private readonly slots: Map<RowNode | string, number> = new Map();

    /**
     * Bitmask array for the first 32 columns. Always present.
     * Space: O(R) where R = number of tracked rows (including ancestors).
     */
    private readonly bits: number[] = [];

    /**
     * Extra bitmask arrays for columns 32+. `null` when C ≤ 32; `extraBits[0]` covers columns 32–63, etc.
     * Space: O(R × max(0, ⌈C/32⌉ − 1)) where R = number of tracked rows (including ancestors), C = number of tracked columns.
     */
    private extraBits: number[][] | null = null;

    /**
     * Number of distinct column IDs added via `addCell`, used to assign column slots.
     * Does not include columns tracked via `addRow` (all-columns). Time: O(1).
     * Space: O(1).
     */
    private colCount: number = 0;

    /**
     * Adds `rowNode` and all its ancestors. All columns are considered changed. No-op if null/undefined.
     * Time: O(D), D = depth.
     * Space: O(D) for new ancestors.
     */
    public addRow(rowNode: RowNode | null | undefined): void {
        if (rowNode == null) {
            return;
        }
        const slots = this.slots;
        let node: RowNode | null = rowNode;
        if (slots.get(node) !== undefined) {
            // Upgrade cell-tracked ancestors to all-columns until we hit one already at -1.
            while (node != null && slots.get(node)! >= 0) {
                slots.set(node, -1);
                node = node.parent;
            }
            return;
        }
        const rows = this.rows;
        do {
            slots.set(node, -1);
            rows.push(node);
            node = node.parent;
        } while (node != null && !slots.has(node));
        this.unsorted = true;
    }

    /**
     * Adds `rowNode` and its ancestors with a specific column marked as changed.
     * When `colId` is `null`/`undefined`, delegates to `addRow` (all columns changed).
     * Time: O(D × ⌈C/32⌉), D = depth, C = number of tracked columns.
     * Space: O(D × ⌈C/32⌉) for new ancestors.
     */
    public addCell(rowNode: RowNode | null | undefined, colId: string | null | undefined): void {
        if (colId == null) {
            this.addRow(rowNode);
            return;
        }
        if (rowNode == null) {
            return;
        }
        const slots = this.slots;
        const bits = this.bits;
        const colSlot = slots.get(colId) ?? this.ensureCol(colId);
        let rowSlot = slots.get(rowNode);
        if (rowSlot === undefined) {
            rowSlot = this.ensureRow(rowNode);
        } else if (rowSlot < 0) {
            return; // already all-columns-changed
        }
        // extraBits is guaranteed non-null when colSlot >= 32 because ensureCol populates it,
        // and colSlot can only come from the slots Map which was set by ensureCol.
        const word = colSlot < 32 ? bits : this.extraBits![(colSlot >>> 5) - 1];
        const bit = 1 << (colSlot & 31);
        const rowBits = word[rowSlot];
        if ((rowBits & bit) !== 0) {
            return; // already marked
        }
        word[rowSlot] = rowBits | bit;
        // Propagate bit up the ancestor chain. All ancestors are registered by ensureRow.
        let p = rowNode.parent;
        while (p != null) {
            const pSlot = slots.get(p)!;
            if (pSlot < 0) {
                break;
            }
            const pBits = word[pSlot];
            if ((pBits & bit) !== 0) {
                break;
            }
            word[pSlot] = pBits | bit;
            p = p.parent;
        }
    }

    /**
     * Returns true if `rowNode` is tracked (added via `addRow` or `addCell`, or as an ancestor of either).
     * Time: O(1).
     */
    public hasRow(rowNode: RowNode): boolean {
        return this.slots.has(rowNode);
    }

    /**
     * Returns the changed rows sorted deepest-first. Cached — do not modify the returned array.
     * Time: O(1) cached, O(R) if sort was invalidated.
     * Space: O(1) best case if sort happens in place, O(R) where R = number of tracked rows (including ancestors) worst case.
     */
    public getSortedRows(): RowNode[] {
        if (!this.unsorted) {
            return this.rows;
        }
        this.unsorted = false;
        const rows = _sortNodesByDepthFirst(this.rows);
        this.rows = rows;
        return rows;
    }

    /**
     * Returns the slot index for a row or column, or -1 if not tracked.
     * For RowNode keys, -1 also means all-columns-changed (via `addRow`).
     * Read-only — does not allocate slots.
     * Time: O(1).
     */
    public getSlot(key: RowNode | string): number {
        return this.slots.get(key) ?? -1;
    }

    /**
     * Returns true if the column is changed for the row. Always true when `rowSlot < 0`.
     * Time: O(1).
     *
     * ```ts
     * const rowSlot = path.getSlot(rowNode);
     * if (path.hasCellBySlot(rowSlot, colSlot)) { … }
     * ```
     */
    public hasCellBySlot(rowSlot: number, colSlot: number): boolean {
        if (rowSlot < 0) {
            return true;
        }
        if (colSlot < 32) {
            return colSlot >= 0 && (this.bits[rowSlot] & (1 << colSlot)) !== 0;
        }
        return (this.extraBits![(colSlot >>> 5) - 1][rowSlot] & (1 << (colSlot & 31))) !== 0;
    }

    /** Registers a new row and all its unregistered ancestors. Returns the row's bitmask index.
     * Time: O(D × ⌈C/32⌉) where D = depth, C = number of tracked columns. In practice O(D) because
     * C < 32 is the common case (single bitmask word per row, no extraBits loop).
     * Space: O(D × ⌈C/32⌉).
     */
    private ensureRow(rowNode: RowNode): number {
        const slots = this.slots;
        const rows = this.rows;
        const bits = this.bits;
        const extraBits = this.extraBits;
        // bits.push(0) returns the new length; originSlot is one less (the index just pushed).
        let nextSlot = bits.push(0);
        const originSlot = nextSlot - 1;
        if (extraBits !== null) {
            for (let w = 0, len = extraBits.length; w < len; ++w) {
                extraBits[w].push(0);
            }
        }
        slots.set(rowNode, originSlot);
        rows.push(rowNode);
        this.unsorted = true;
        let p = rowNode.parent;
        while (p != null && !slots.has(p)) {
            slots.set(p, nextSlot);
            rows.push(p);
            nextSlot = bits.push(0);
            if (extraBits !== null) {
                for (let w = 0, len = extraBits.length; w < len; ++w) {
                    extraBits[w].push(0);
                }
            }
            p = p.parent;
        }
        return originSlot;
    }

    /**
     * Assigns a new column slot. Appends a bitmask array when crossing a 32-column boundary.
     * Time: O(1) amortised, O(R) when crossing a 32-column boundary, where R = number of tracked rows (including ancestors) due to array extension and copying.
     * Space: O(R) when crossing a 32-column boundary.
     */
    private ensureCol(colId: string): number {
        const colSlot = this.colCount++;
        this.slots.set(colId, colSlot);
        if (colSlot >= 32) {
            const extraBitsIndex = (colSlot >>> 5) - 1;
            let extraBits = this.extraBits;
            if (extraBits === null) {
                extraBits = [];
                this.extraBits = extraBits;
            }
            if (extraBitsIndex >= extraBits.length) {
                extraBits.push(new Array<number>(this.bits.length).fill(0));
            }
        }
        return colSlot;
    }
}
