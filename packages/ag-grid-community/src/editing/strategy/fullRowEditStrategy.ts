import type { CellFocusedEvent } from '../../events';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { BaseEditStrategy } from './baseEditStrategy';
import { _resolveControllers } from './utils';

export class FullRowEditStrategy extends BaseEditStrategy {
    beanName = 'rowEditMode' as const;
    private rowId?: string | null;

    public setEditing(rowCtrl: RowCtrl, editing: boolean): void {
        console.warn('FullRowEditStrategy: setEditing');

        rowCtrl.forEachGui(undefined, (gui) => gui.rowComp.addOrRemoveCssClass('ag-row-editing', editing));

        if (editing) {
            this.rowId = rowCtrl.rowId;
        } else {
            this.rowId = undefined;
        }

        const event = editing
            ? rowCtrl.createRowEvent('rowEditingStarted')
            : rowCtrl.createRowEvent('rowEditingStopped');

        this.eventSvc.dispatchEvent(event);
    }

    public override shouldStopEditing(rowCtrl?: RowCtrl | undefined, _cellCtrl?: CellCtrl | undefined): boolean | null {
        // stop editing if we've changed rows
        return rowCtrl?.rowId !== this.rowId;
    }

    public startEditing(
        rowCtrl: RowCtrl,
        cellCtrl?: CellCtrl,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined
    ): boolean {
        console.warn('FullRowEditStrategy: startEditing', rowCtrl, cellCtrl, key, event);

        if (this.shouldStopEditing(rowCtrl)) {
            this.stopAllEditing();
        }

        this.setEditing(rowCtrl, true);

        const cellCtrls = rowCtrl.getAllCellCtrls();
        cellCtrls.forEach((cellCtrl) => {
            this.editModel.startEditing(rowCtrl.rowId!, cellCtrl.column.colId);
        });

        return true;
    }

    public cancelEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        console.warn('FullRowEditStrategy: cancelEditing', rowCtrl, cellCtrl);

        const edits = this.editModel.getEditingCellPositions();

        if (rowCtrl) {
            this.editModel.cancelEditing(rowCtrl!.rowId!, cellCtrl?.column.colId);
        } else {
            this.editModel.cancelEditing();
        }

        this.setEditing(rowCtrl!, false);

        this.destroyEditors(edits, true);

        return true;
    }

    public stopEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        console.warn('FullRowEditStrategy: stopEditing', rowCtrl, cellCtrl);

        const edits = this.editModel.getEditingCellPositions();

        if (rowCtrl) {
            this.editModel.stopEditing(rowCtrl!.rowId!, cellCtrl?.column.colId);
        } else {
            this.editModel.stopEditing();
        }

        this.setEditing(rowCtrl!, false);

        this.destroyEditors(edits, false);

        return true;
    }

    public override isEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        return this.editModel.isEditing(rowCtrl, cellCtrl) ?? false;
    }

    protected override onCellFocusChanged(event: CellFocusedEvent<any, any>): void {
        const { focusSvc } = this.beans;
        const { rowIndex, rowPinned, column } = event;

        const rowFocused = focusSvc.isRowFocused(rowIndex!, rowPinned);

        const { rowCtrl, cellCtrl } = _resolveControllers(this.beans, {
            rowIndex,
            column,
        });

        // if we are editing, then moving the focus out of a row will stop editing
        if (!rowFocused && this.isEditing(rowCtrl!, cellCtrl)) {
            this.stopEditing(rowCtrl!, cellCtrl);
        }
    }

    // returns null if no navigation should be performed
    moveToNextEditingCell(previousCell: CellCtrl, backwards: boolean, event?: KeyboardEvent): boolean | null {
        const previousPos = previousCell.cellPosition;

        // find the next cell to start editing
        const nextCell = this.beans.navigation?.findNextCellToFocusOn(previousPos, backwards, true) as CellCtrl | false;
        if (nextCell === false) {
            return null;
        }
        if (nextCell == null) {
            return false;
        }

        const nextPos = nextCell.cellPosition;

        const previousEditable = previousCell.isCellEditable();
        const nextEditable = nextCell.isCellEditable();

        const rowsMatch =
            nextPos && previousPos.rowIndex === nextPos.rowIndex && previousPos.rowPinned === nextPos.rowPinned;

        if (previousEditable) {
            this.setFocusOutOnEditor(previousCell);
        }

        if (!rowsMatch) {
            const pRow = previousCell.rowCtrl;
            this.stopEditing(pRow);

            const nRow = nextCell.rowCtrl;
            this?.startEditing(nRow, undefined, undefined, event);
        }

        if (nextEditable) {
            this.setFocusInOnEditor(nextCell);
            nextCell.focusCell();
        } else {
            nextCell.focusCell(true);
        }

        return true;
    }
}
