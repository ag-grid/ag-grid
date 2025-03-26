import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { RowPinningState } from './gridState';
import type { RowPinnedType } from './iRowNode';

export interface IPinnedRowModel {
    /** Reset the pinned row state. This is a no-op for the static pinned row model. */
    reset(): void;

    /**
     * Pin a row from the main viewport into one of the floating containers. Pass a `column`
     * to have the model check for spanned cells.
     *
     * This is a no-op for the static pinned row model.
     */
    pinRow(node: RowNode, float: RowPinnedType, column?: AgColumn | null): void;

    /**
     * Returns `true` when the underlying implementation is the manual row pinning model.
     * Otherwise `false`.
     */
    isManual(): boolean;

    isEmpty(float: NonNullable<RowPinnedType>): boolean;

    isRowsToRender(float: NonNullable<RowPinnedType>): boolean;

    ensureRowHeightsValid(): boolean;

    getPinnedTopTotalHeight(): number;

    getPinnedBottomTotalHeight(): number;

    getPinnedTopRowCount(): number;

    getPinnedBottomRowCount(): number;

    getPinnedTopRow(index: number): RowNode | undefined;

    getPinnedBottomRow(index: number): RowNode | undefined;

    getPinnedRowById(id: string, float: NonNullable<RowPinnedType>): RowNode | undefined;

    /** Iterate over the pinned rows in a particular floating container. */
    forEachPinnedRow(float: NonNullable<RowPinnedType>, callback: (node: RowNode, index: number) => void): void;

    /** Used by the state service. This is a no-op for the static pinned row model. */
    getPinnedState(): RowPinningState;

    /**
     * Setup the pinned row state based on a state object.
     * Used to allow pinned state to be populated from initial state.
     *
     * This is a no-op for the static pinned row model.
     */
    setPinnedState(state: RowPinningState): void;
}
