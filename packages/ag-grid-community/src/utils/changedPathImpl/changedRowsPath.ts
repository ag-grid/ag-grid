import type { RowNode } from '../../entities/rowNode';
import { _sortNodesByDepthFirst } from '../sortNodesByDepthFirst';

/**
 * Set-based ChangedPath — no column tracking.
 * All columns are considered changed for every node in the path.
 *
 * Total space: O(R), where R = number of tracked rows (including ancestors).
 *
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export class ChangedRowsPath {
    readonly kind = 'rows' as const;

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
     * Hash set that keeps track of which rows are in `rows` for O(1) lookup.
     * Space: O(R) where R = number of tracked rows (including ancestors).
     */
    private readonly rowSet: Set<RowNode> = new Set();

    /**
     * Adds `rowNode` and all its ancestors. No-op if null/undefined or already present.
     * Time: O(D), D = depth.
     * Space: O(D) for new ancestors
     */
    public addRow(rowNode: RowNode | null | undefined): void {
        if (rowNode == null) {
            return;
        }
        const rowSet = this.rowSet;
        if (rowSet.has(rowNode)) {
            return;
        }
        const rows = this.rows;
        let node: RowNode | null = rowNode;
        do {
            rowSet.add(node);
            rows.push(node);
            node = node.parent;
        } while (node != null && !rowSet.has(node));
        this.unsorted = true;
    }

    /** Delegates to `addRow` — column tracking is ignored for `ChangedRowsPath`. */
    public addCell(rowNode: RowNode | null | undefined, _colId: string | null | undefined): void {
        this.addRow(rowNode);
    }

    /** Time: O(1). */
    public hasRow(rowNode: RowNode): boolean {
        return this.rowSet.has(rowNode);
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
}
