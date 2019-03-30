import { Column } from "./column";
import { RowPosition } from "./rowPosition";

// this is what gets pass into and out of the api, as JavaScript users
export interface CellPosition extends RowPosition {
    column: Column;
}

export class CellPositionUtils {

    public static createId(cellPosition: CellPosition): string {
        return `${cellPosition.rowIndex}.${cellPosition.rowPinned}.${cellPosition.column.getId()}`;
    }

    public static equals(cellA: CellPosition, cellB: CellPosition): boolean {
        const colsMatch = cellA.column === cellB.column;
        const floatingMatch = cellA.rowPinned === cellB.rowPinned;
        const indexMatch = cellA.rowIndex === cellB.rowIndex;
        return colsMatch && floatingMatch && indexMatch;
    }

}
