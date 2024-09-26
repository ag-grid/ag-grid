import type { CellPosition } from '../interfaces/iCellPosition';

export function _createCellId(cellPosition: CellPosition): string {
    const { rowIndex, rowPinned, column } = cellPosition;
    return `${rowIndex}.${rowPinned == null ? 'null' : rowPinned}.${column.getId()}`;
}

export function _areCellsEqual(cellA: CellPosition, cellB: CellPosition): boolean {
    const colsMatch = cellA.column === cellB.column;
    const floatingMatch = cellA.rowPinned === cellB.rowPinned;
    const indexMatch = cellA.rowIndex === cellB.rowIndex;
    return colsMatch && floatingMatch && indexMatch;
}
