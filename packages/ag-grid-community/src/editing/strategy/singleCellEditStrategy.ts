import type { BeanName } from '../../context/context';
import type { CellFocusedEvent, CommonCellFocusParams } from '../../events';
import type { Column } from '../../interfaces/iColumn';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { _resolveControllers } from '../utils/controllers';
import { BaseEditStrategy } from './baseEditStrategy';

export class SingleCellEditStrategy extends BaseEditStrategy {
    override beanName = 'singleCell' as BeanName | undefined;

    private rowId?: string | null;
    private colId?: string | null;

    public override shouldStopEditing(
        rowCtrl?: RowCtrl | undefined,
        cellCtrl?: CellCtrl | undefined,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        const res = super.shouldStopEditing(rowCtrl, cellCtrl, key, event, source);
        if (res !== null) {
            return res;
        }

        if ((!this.rowId || !this.colId) && rowCtrl && cellCtrl) {
            return null;
        } else if (!rowCtrl && !cellCtrl && this.rowId && this.colId) {
            return null;
        }

        return this.rowId !== rowCtrl?.rowId || this.colId !== cellCtrl?.column.getColId();
    }

    public updateStyles(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null, newState?: boolean): void {
        cellCtrl?.comp.toggleCss('ag-cell-batch-edit', (newState && this.gos.get('batchEdit')) ?? false);
    }

    public startEditing(
        rowCtrl: RowCtrl,
        cellCtrl?: CellCtrl,
        _key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null,
        _source: 'api' | 'ui' = 'ui'
    ): boolean {
        console.log('SingleCellEditStrategy: startEditing', rowCtrl, cellCtrl);

        const rowId = rowCtrl.rowId!;
        const colId = cellCtrl?.column.getColId() ?? this.beans.visibleCols.getFirstColumn()!.getColId();

        if (this.rowId !== rowId || this.colId !== colId) {
            super.cleanupEditors();
        }

        this.rowId = rowId;
        this.colId = colId;

        this.editModel.startEditing(rowId, colId);

        this.updateStyles(rowCtrl, cellCtrl, true);

        return this.finishStartEdit(
            [
                {
                    rowId,
                    columnId: colId,
                },
            ],
            rowCtrl,
            cellCtrl,
            undefined,
            true,
            event
        );
    }

    public override stopEditing(
        rowCtrl?: RowCtrl | null,
        cellCtrl?: CellCtrl | null,
        source: 'api' | 'ui' = 'ui'
    ): boolean {
        console.log('SingleCellEditStrategy: stopEditing', rowCtrl, cellCtrl);

        if (this.gos.get('batchEdit')) {
            const cellIds = this.editModel.getPendingCellIds();
            cellIds.forEach((cellId) => {
                const cellCtrl = _resolveControllers(this.beans, cellId).cellCtrl;
                if (cellCtrl) {
                    cellCtrl.comp.toggleCss('ag-cell-batch-edit', false);
                    this.updateStyles(cellCtrl.rowCtrl, cellCtrl, false);
                }
            });
        }

        super.stopEditing(rowCtrl, cellCtrl, source);

        this.rowId = undefined;
        this.colId = undefined;

        return true;
    }

    public onCellFocusChanged(event: CellFocusedEvent<any, any>): void {
        const { rowIndex, column } = event;
        const previous = (event as any)['previousParams']! as CommonCellFocusParams;

        if (previous?.rowIndex === rowIndex && getColId(previous?.column) === getColId(column)) {
            return;
        }

        const { rowCtrl, cellCtrl } = _resolveControllers(this.beans, {
            rowIndex: previous?.rowIndex,
            column: previous?.column,
        });

        // if we are editing, then moving the focus out of a cell will stop editing
        this.beans.editingSvc?.stopEditing(
            rowCtrl,
            cellCtrl,
            undefined,
            undefined,
            undefined,
            this.gos.get('batchEdit') ? 'ui' : 'api'
        );
    }

    // returns null if no navigation should be performed
    public override moveToNextEditingCell(
        previousCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent
    ): boolean | null {
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

        nextCell.focusCell(false);

        const batchEdit = this.gos.get('batchEdit');

        this.beans.editingSvc?.startEditing(nextCell.rowCtrl, nextCell, null, true, event, batchEdit ? 'ui' : 'api');

        return true;
    }
}

function getColId(column?: Column | string | null): string | undefined {
    if (!column) {
        return undefined;
    }

    if (typeof column === 'string') {
        return column;
    }
    return column.getColId();
}
