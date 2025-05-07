import type { BeanName } from '../../context/context';
import type { CellFocusedEvent } from '../../events';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { CellIdPositions } from '../editingModelService';
import { _resolveControllers, _resolveRowController } from '../utils/controllers';
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

        rowCtrl.forEachGui(undefined, (gui) => {
            gui.rowComp.toggleCss('ag-row-editing', newState ?? false);
            gui.rowComp.toggleCss('ag-row-batch-edit', (this.gos.get('batchEdit') && newState) ?? false);
        });

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

        const res = super.shouldStopEditing(oldRowCtrl, undefined, key, event, _source);
        if (res !== undefined) {
            return res;
        }

        if (!this.rowId) {
            return false;
        }

        // stop editing if we've changed rows
        return rowCtrl?.rowId !== this.rowId;
    }

    public override startEditing(
        rowCtrl: RowCtrl,
        cellCtrl?: CellCtrl,
        _key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        _source: 'api' | 'ui' = 'ui'
    ): boolean {
        console.log('FullRowEditStrategy: startEditing', rowCtrl, cellCtrl);

        if (this.rowId !== rowCtrl.rowId) {
            super.cleanupEditors();
        }

        const cellCtrls = rowCtrl.getAllCellCtrls();
        const cells: CellIdPositions[] = [];

        cellCtrls.forEach((cellCtrl) => {
            const position = {
                rowId: rowCtrl.rowId!,
                columnId: cellCtrl.column.getColId(),
            };
            cells.push(position);
            this.editModel.startEditing(position.rowId, position.columnId);
        });

        this.setEditing(rowCtrl, true, false);

        return this.finishStartEdit(cells, rowCtrl, cellCtrl, undefined, true, event);
    }

    public override stopEditing(
        rowCtrl?: RowCtrl | null,
        _cellCtrl?: CellCtrl | null,
        source: 'api' | 'ui' = 'ui'
    ): boolean {
        console.log('FullRowEditStrategy: stopEditing', rowCtrl, _cellCtrl);

        for (const rowId of this.editModel.getPendingUpdates().keys()) {
            const rowController = _resolveRowController(this.beans, { rowId });
            if (rowController) {
                this.setEditing(rowController!, false, true);
            }
        }

        super.stopEditing(rowCtrl, _cellCtrl, source);

        return true;
    }

    public onCellFocusChanged(event: CellFocusedEvent<any, any>): void {
        const { focusSvc } = this.beans;
        const { rowIndex, rowPinned, column } = event;

        const rowFocused = focusSvc.isRowFocused(rowIndex!, rowPinned);

        const { rowCtrl, cellCtrl } = _resolveControllers(this.beans, {
            rowIndex,
            column,
        });

        // if we are editing, then moving the focus out of a row will stop editing
        if (!rowFocused && this.editModel.hasPending(rowCtrl!, cellCtrl) && !this.gos.get('batchEdit')) {
            this.beans.editingSvc?.stopEditing(rowCtrl!, cellCtrl);
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
            if (!this.gos.get('batchEdit')) {
                const pRow = previousCell.rowCtrl;
                this.beans.editingSvc?.stopEditing(pRow);
            }

            const nRow = nextCell.rowCtrl;
            this.beans.editingSvc?.startEditing(nRow, nextCell, null, true, event);
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
