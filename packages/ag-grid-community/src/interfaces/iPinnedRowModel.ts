import type { RowNode } from '../entities/rowNode';
import type { RowPinnedType } from './iRowNode';

export interface IPinnedRowModel {
    pinRow(node: RowNode, container: RowPinnedType): void;

    isManual(): boolean;

    isEmpty(floating: NonNullable<RowPinnedType>): boolean;

    isRowsToRender(floating: NonNullable<RowPinnedType>): boolean;

    ensureRowHeightsValid(): boolean;

    getPinnedTopTotalHeight(): number;

    getPinnedBottomTotalHeight(): number;

    getPinnedTopRowCount(): number;

    getPinnedBottomRowCount(): number;

    getPinnedTopRow(index: number): RowNode | undefined;

    getPinnedBottomRow(index: number): RowNode | undefined;

    getPinnedRowById(id: string, floating: NonNullable<RowPinnedType>): RowNode | undefined;

    forEachPinnedRow(floating: NonNullable<RowPinnedType>, callback: (node: RowNode, index: number) => void): void;
}
