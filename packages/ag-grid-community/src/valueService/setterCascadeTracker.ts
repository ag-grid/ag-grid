import type { IRowNode } from '../interfaces/iRowNode';

interface ColumnCascadeState {
    depth: number;
    rows: Map<IRowNode, number>;
}

/**
 * Tracks column-level valueSetter cascades so that:
 *  - leaf nodes skip their setter while a parent group is cascading into the same column (avoids repeated work)
 *  - the originating group row cannot re-enter its own setter recursively
 * Other columns and rows continue to run their setters normally.
 */
export class SetterCascadeTracker {
    private readonly map = new Map<string, ColumnCascadeState>();

    public shouldBypass(columnId: string, rowNode: IRowNode | null | undefined): boolean {
        const columnStates = this.map;
        const columnState = columnStates.get(columnId);
        if (!columnState) {
            return false;
        }

        const rows = columnState.rows;
        if (!rowNode?.group) {
            return columnState.depth > 0;
        }

        return (rows.get(rowNode) ?? 0) > 0;
    }

    public begin(columnId: string, rowNode: IRowNode): void {
        const columnStates = this.map;
        let columnState = columnStates.get(columnId);
        if (!columnState) {
            columnState = { depth: 0, rows: new Map() };
            columnStates.set(columnId, columnState);
        }

        columnState.depth++;
        const rows = columnState.rows;
        rows.set(rowNode, (rows.get(rowNode) ?? 0) + 1);
    }

    public end(columnId: string, rowNode: IRowNode): void {
        const columnStates = this.map;
        const columnState = columnStates.get(columnId);
        if (!columnState) {
            return;
        }

        const rows = columnState.rows;
        const existingRowDepth = rows.get(rowNode);
        if (existingRowDepth != null) {
            const rowDepth = existingRowDepth - 1;
            if (rowDepth <= 0) {
                rows.delete(rowNode);
            } else {
                rows.set(rowNode, rowDepth);
            }
        }

        const depth = columnState.depth - 1;
        if (depth <= 0) {
            columnStates.delete(columnId);
        } else {
            columnState.depth = depth;
        }
    }

    public hasActiveCascade(): boolean {
        return this.map.size > 0;
    }
}
