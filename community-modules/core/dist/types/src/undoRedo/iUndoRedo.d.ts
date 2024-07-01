import type { RowPinnedType } from '../interfaces/iRowNode';
export interface CellValueChange {
    rowPinned: RowPinnedType;
    rowIndex: number;
    columnId: string;
    oldValue: any;
    newValue: any;
}
export interface LastFocusedCell {
    rowPinned: RowPinnedType;
    rowIndex: number;
    columnId: string;
}
