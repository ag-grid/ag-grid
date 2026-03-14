import type { ChangedRowsPath, IRowNode, RowNode } from 'ag-grid-community';

import { _sortNodesByDepthFirst } from '../sortNodesByDepthFirst';

/**
 * Set-based ChangedPath — no column tracking.
 * All columns are considered changed for every node in the path.
 *
 * Total space: O(R), where R = number of tracked rows (including ancestors).
 */
export class ChangedRowsPathImpl implements ChangedRowsPath {
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

    /** {@inheritDoc ChangedRowsPath.addRow} Time: O(D), D = depth. */
    public addRow(rowNode: IRowNode | null | undefined): void {
        let node = rowNode as RowNode | null | undefined;
        if (node == null) {
            return;
        }
        const rowSet = this.rowSet;
        if (rowSet.has(node)) {
            return;
        }
        const rows = this.rows;
        do {
            rowSet.add(node);
            rows.push(node);
            node = node.parent;
        } while (node != null && !rowSet.has(node));
        this.unsorted = true;
    }

    /** {@inheritDoc ChangedRowsPath.addCell} */
    public addCell(rowNode: IRowNode | null | undefined, _colId: string | null | undefined): void {
        this.addRow(rowNode);
    }

    /** {@inheritDoc ChangedRowsPath.hasRow} Time: O(1). */
    public hasRow(rowNode: IRowNode): boolean {
        return this.rowSet.has(rowNode as RowNode);
    }

    /** {@inheritDoc ChangedRowsPath.getSortedRows} Time: O(1) cached, O(R) if sort was invalidated. */
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
