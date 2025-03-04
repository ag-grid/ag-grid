import type { RowNode } from '../entities/rowNode';
import type { RowPinnedType } from './iRowNode';

export interface IManualPinnedRowModel {
    pinRow(node: RowNode, container: RowPinnedType): void;

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
