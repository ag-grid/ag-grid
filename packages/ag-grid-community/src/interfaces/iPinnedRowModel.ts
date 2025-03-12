import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { RowPinnedType } from './iRowNode';

export interface IPinnedRowModel {
    pinRow(node: RowNode, container: RowPinnedType, column?: AgColumn | null): void;

    isManual(): boolean;

    isEmpty(container: NonNullable<RowPinnedType>): boolean;

    isRowsToRender(container: NonNullable<RowPinnedType>): boolean;

    ensureRowHeightsValid(): boolean;

    getPinnedTopTotalHeight(): number;

    getPinnedBottomTotalHeight(): number;

    getPinnedTopRowCount(): number;

    getPinnedBottomRowCount(): number;

    getPinnedTopRow(index: number): RowNode | undefined;

    getPinnedBottomRow(index: number): RowNode | undefined;

    getPinnedRowById(id: string, container: NonNullable<RowPinnedType>): RowNode | undefined;

    forEachPinnedRow(container: NonNullable<RowPinnedType>, callback: (node: RowNode, index: number) => void): void;

    populatePinnedState(top: string[], bottom: string[]): void;
}
