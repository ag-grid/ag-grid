import type { CellFocusedEvent } from '../../events';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { BaseEditStrategy } from './baseEditStrategy';
import type { EditingStateUpdates } from './iEditStrategy';
import { _resolveControllers, _saveNewValue, _takeValueFromCellEditor } from './utils';

export class SingleCellEditStrategy extends BaseEditStrategy {
    public startEditing(
        rowCtrl: RowCtrl,
        cellCtrl?: CellCtrl,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined
    ): boolean {
        console.warn('SingleCellEditStrategy: startEditing', rowCtrl, cellCtrl, key, event);
        if (this.beans.editingSvc?.editModel?.isEditing()) {
            this.stopEditing();
        }

        const rowId = rowCtrl.rowId!;
        const colId = cellCtrl?.column.getColId() ?? this.beans.visibleCols.getFirstColumn()!.getColId();

        this.beans.editingSvc?.editModel?.createEditModel(rowId, colId);

        return true;
    }

    public stopEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        if (!this.isEditing(rowCtrl, cellCtrl)) {
            return false;
        }

        console.warn('SingleCellEditStrategy: stopEditing', rowCtrl, cellCtrl);

        let updates: EditingStateUpdates | undefined;

        if (rowCtrl) {
            updates = this.beans.editingSvc?.editModel?.stopEditing(rowCtrl!.rowId!, cellCtrl?.column.colId);
        } else {
            updates = this.beans.editingSvc?.editModel?.stopEditing();
        }

        const { comp, column, rowNode } = cellCtrl!;
        const { newValue, newValueExists } = _takeValueFromCellEditor(false, comp);
        const oldValue = this.beans.valueSvc.getValueForDisplay(column, rowNode)?.value;
        let valueChanged = false;

        if (newValueExists) {
            valueChanged = _saveNewValue(cellCtrl!, oldValue, newValue, rowNode, column);
        }

        comp.setEditDetails(); // passing nothing stops editing

        cellCtrl?.updateAndFormatValue(false);
        cellCtrl?.refreshCell({ forceRefresh: true, suppressFlash: true });

        this.eventSvc.dispatchEvent({
            ...cellCtrl!.createEvent(null, 'cellEditingStopped'),
            oldValue,
            newValue,
            valueChanged,
        });

        return true;
    }

    public cancelEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        console.warn('SingleCellEditStrategy: cancelEditing', rowCtrl, cellCtrl);
        if (rowCtrl) {
            this.beans.editingSvc?.editModel?.cancelEditing(rowCtrl!.rowId!, cellCtrl?.column.colId);
        } else {
            this.beans.editingSvc?.editModel?.cancelEditing();
        }
        return true;
    }

    protected override onCellFocusChanged(event: CellFocusedEvent<any, any>): void {
        const { rowIndex, column } = event;

        const { rowCtrl, cellCtrl } = _resolveControllers(this.beans, {
            rowIndex,
            column,
        });

        // if we are editing, then moving the focus out of a row will stop editing
        if (this.isEditing(rowCtrl!, cellCtrl)) {
            this.stopEditing(rowCtrl!, cellCtrl);
        }
    }

    // returns null if no navigation should be performed
    moveToNextEditingCell(previousCell: CellCtrl, backwards: boolean, event?: KeyboardEvent): boolean | null {
        const previousPos = previousCell.cellPosition;

        // before we stop editing, we need to focus the cell element
        // so the grid doesn't detect that focus has left the grid
        previousCell.eGui.focus();

        // need to do this before getting next cell to edit, in case the next cell
        // has editable function (eg colDef.editable=func() ) and it depends on the
        // result of this cell, so need to save updates from the first edit, in case
        // the value is referenced in the function.
        previousCell.stopEditing();

        // find the next cell to start editing
        const nextCell = this.beans.navigation?.findNextCellToFocusOn(previousPos, backwards, true) as CellCtrl | false;
        if (nextCell === false) {
            return null;
        }
        if (nextCell == null) {
            return false;
        }

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        this.startEditing(nextCell.rowCtrl, nextCell, null, event);
        event?.preventDefault();

        nextCell.focusCell(false);
        return true;
    }
}
