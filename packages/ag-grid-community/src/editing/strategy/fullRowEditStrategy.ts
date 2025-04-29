import type { BeanName } from '../../context/context';
import type { CellFocusedEvent } from '../../events';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { CellIdPositions } from '../editingModelService';
import { _resolveControllers, _resolveRowController } from '../utils/controllers';
import { _destroyEditors, _getOldValue } from '../utils/editors';
import { BaseEditStrategy } from './baseEditStrategy';

export class FullRowEditStrategy extends BaseEditStrategy {
    override beanName = 'fullRow' as BeanName | undefined;
    private rowId?: string | null;

    public setEditing(rowCtrl?: RowCtrl | null, newState?: boolean, oldState?: boolean): void {
        if (oldState === newState) {
            return;
        }

        if (!rowCtrl) {
            rowCtrl = _resolveRowController(this.beans, {
                rowId: this.rowId,
            });
        }

        if (!rowCtrl) {
            return;
        }

        rowCtrl.forEachGui(undefined, (gui) => gui.rowComp.toggleCss('ag-row-editing', newState ?? false));

        if (newState) {
            this.rowId = rowCtrl.rowId;
        } else {
            this.rowId = undefined;
        }

        const event = newState
            ? rowCtrl.createRowEvent('rowEditingStarted')
            : rowCtrl.createRowEvent('rowEditingStopped');

        this.eventSvc.dispatchEvent(event);
    }

    public override shouldStopEditing(
        rowCtrl?: RowCtrl | undefined,
        _cellCtrl?: CellCtrl | undefined,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        _source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        const oldRowCtrl = _resolveRowController(this.beans, {
            rowId: this.rowId,
        });

        if (!oldRowCtrl) {
            return true;
        }

        const res = super.shouldStopEditing(oldRowCtrl, undefined, key, event);
        if (res) {
            return res;
        }

        if (this.isEditing(oldRowCtrl) && oldRowCtrl !== rowCtrl) {
            return true;
        }

        if (!this.rowId) {
            return false;
        }

        // stop editing if we've changed rows
        return rowCtrl?.rowId !== this.rowId;
    }

    override shouldCancelEditing(
        rowCtrl?: RowCtrl | null | undefined,
        cellCtrl?: CellCtrl | null | undefined,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source?: 'api' | 'ui'
    ): boolean | null {
        return super.shouldCancelEditing(rowCtrl, cellCtrl, key, event, source);
    }

    public override startEditing(
        rowCtrl: RowCtrl,
        cellCtrl?: CellCtrl,
        _key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        _source: 'api' | 'ui' = 'ui'
    ): boolean {
        const oldState = this.isEditing(rowCtrl);

        if (this.shouldStopEditing(rowCtrl)) {
            if (this.gos.get('batchEdit')) {
                const cells = this.editModel.getEditingCellIds();
                _destroyEditors(this.beans, cells, false, 'ui');
            } else {
                this.stopAllEditing();
            }
        }

        this.setEditing(rowCtrl, true, oldState);

        const cellCtrls = rowCtrl.getAllCellCtrls();
        const cells: CellIdPositions[] = [];

        cellCtrls.forEach((cellCtrl) => {
            const cellModel = this.editModel.startEditing(rowCtrl.rowId!, cellCtrl.column.colId);
            cellModel.oldValue = _getOldValue(this.beans, cellCtrl);

            cells.push({
                rowId: rowCtrl.rowId!,
                columnId: cellCtrl.column.getColId(),
            });
        });

        return this.finishStartEdit(cells, rowCtrl, cellCtrl, undefined, true, event);
    }

    public override cancelEditing(
        rowCtrl?: RowCtrl | null,
        cellCtrl?: CellCtrl | null,
        source: 'api' | 'ui' = 'ui'
    ): boolean {
        const oldState = this.isEditing(rowCtrl);

        if (!oldState) {
            return false;
        }

        const edits = this.editModel.getEditingCellIds();

        if (rowCtrl) {
            this.editModel.cancelEditing(rowCtrl!.rowId!, cellCtrl?.column.colId);
        } else {
            this.editModel.cancelEditing();
        }

        this.setEditing(rowCtrl, false, oldState);

        _destroyEditors(this.beans, edits, true, source);

        return true;
    }

    public override stopEditing(
        rowCtrl?: RowCtrl | null,
        _cellCtrl?: CellCtrl | null,
        source: 'api' | 'ui' = 'ui'
    ): boolean {
        const oldCtrl = _resolveRowController(this.beans, {
            rowId: this.rowId,
        });

        if (!oldCtrl) {
            this.rowId = undefined;
            this.stopAllEditing(source);
            return true;
        }

        const oldState = this.isEditing(oldCtrl);

        if (!oldState) {
            this.rowId = undefined;
            return false;
        }

        const edits = this.editModel.getEditingCellIds();

        if (rowCtrl) {
            this.editModel.stopEditing(rowCtrl!.rowId!);
        } else {
            this.editModel.stopEditing();
        }

        this.setEditing(rowCtrl!, false, oldState);

        _destroyEditors(this.beans, edits, false, source);

        return true;
    }

    public override isEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        return this.editModel.isEditing(rowCtrl, cellCtrl) ?? false;
    }

    protected override onCellFocusChanged(event: CellFocusedEvent<any, any>): void {
        super.onCellFocusChanged(event);

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
    public override moveToNextEditingCell(
        previousCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent
    ): boolean | null {
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
            this.startEditing(nRow, nextCell, null, event);
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
