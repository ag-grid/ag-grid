import { Bean } from "../context/context";
import { Column } from "./column";
import { RowPosition } from "./rowPosition";

// this is what gets pass into and out of the api, as JavaScript users
export interface CellPosition<T> extends RowPosition {
    column: Column<T>;
}

@Bean('cellPositionUtils')
export class CellPositionUtils {

    public createId(cellPosition: CellPosition<unknown>): string {
        const { rowIndex, rowPinned, column } = cellPosition;
        return `${rowIndex}.${rowPinned == null ? 'null' : rowPinned}.${column.getId()}`;
    }

    public equals(cellA: CellPosition<unknown>, cellB: CellPosition<unknown>): boolean {
        const colsMatch = cellA.column === cellB.column;
        const floatingMatch = cellA.rowPinned === cellB.rowPinned;
        const indexMatch = cellA.rowIndex === cellB.rowIndex;
        return colsMatch && floatingMatch && indexMatch;
    }

}
