import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowGroupingEditValueSvc {
    /**
     * Resolves and executes groupRowValueSetter for a group row edit.
     * Returns `undefined` if no groupRowValueSetter is configured (caller should use normal path).
     * Returns `true` if children were changed, `false` if not.
     */
    setGroupDataValue(
        rowNode: RowNode,
        column: AgColumn,
        newValue: unknown,
        oldValue: unknown,
        eventSource: string | undefined,
        valueChanged: boolean
    ): boolean | undefined;
}
