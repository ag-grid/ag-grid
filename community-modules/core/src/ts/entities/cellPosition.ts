import { Bean } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { Column } from "./column";
import { RowPosition } from "./rowPosition";
import { RowPinnedType } from "../interfaces/iRowNode";
import { RowNode } from "./rowNode";
import { Events } from "../eventKeys";
import { CellEditRequestEvent } from "../main";

// this is what gets pass into and out of the api, as JavaScript users
export interface CellPosition extends RowPosition {
/** The grid column */
    column: Column;
}

@Bean('cellPositionUtils')
export class CellPositionUtils extends BeanStub {

    public createId(cellPosition: CellPosition): string {
        const { rowIndex, rowPinned, column } = cellPosition;
        return this.createIdFromValues(rowIndex, column, rowPinned);
    }

    public createIdFromValues(rowIndex: number, column: Column, rowPinned: RowPinnedType): string {
        return `${rowIndex}.${rowPinned == null ? 'null' : rowPinned}.${column.getId()}`;
    }

    public equals(cellA: CellPosition, cellB: CellPosition): boolean {
        const colsMatch = cellA.column === cellB.column;
        const floatingMatch = cellA.rowPinned === cellB.rowPinned;
        const indexMatch = cellA.rowIndex === cellB.rowIndex;
        return colsMatch && floatingMatch && indexMatch;
    }

    public dispatchEventForSaveValueReadOnly(rowNode: RowNode, column: Column, oldValue: any, newValue: any): void {
        const event: CellEditRequestEvent = {
            type: Events.EVENT_CELL_EDIT_REQUEST,
            event: null,
            rowIndex: rowNode.rowIndex!,
            rowPinned: rowNode.rowPinned,
            column: column,
            colDef: column.getColDef(),
            context: this.gridOptionsService.get('context'),
            api: this.gridOptionsService.get('api')!,
            columnApi: this.gridOptionsService.get('columnApi')!,
            data: rowNode.data,
            node: rowNode,
            oldValue,
            newValue,
            value: newValue,
            source: undefined
        };

        this.eventService.dispatchEvent(event);
    }

}
