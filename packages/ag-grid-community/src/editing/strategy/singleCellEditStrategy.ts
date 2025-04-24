import type { BeanName } from '../../context/context';
import type { CellFocusedEvent, CommonCellFocusParams } from '../../events';
import type { Column } from '../../interfaces/iColumn';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { BaseEditStrategy } from './baseEditStrategy';
import { _resolveControllers } from './utils';

export class SingleCellEditStrategy extends BaseEditStrategy {
    override beanName = 'cellEditMode' as BeanName | undefined;

    private rowId?: string | null;
    private colId?: string | null;

    public override shouldStopEditing(
        _rowCtrl?: RowCtrl | undefined,
        _cellCtrl?: CellCtrl | undefined,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined
    ): boolean | null {
        const res = super.shouldStopEditing(_rowCtrl, _cellCtrl, key, event);
        if (res) {
            return res;
        }

        return this.rowId !== _rowCtrl?.rowId || this.colId !== _cellCtrl?.column.getColId();
    }

    public startEditing(
        rowCtrl: RowCtrl,
        cellCtrl?: CellCtrl,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean {
        const shouldStop = this.shouldStopEditing(rowCtrl, cellCtrl);
        if (shouldStop) {
            this.stopAllEditing();
        }

        console.warn(
            'SingleCellEditStrategy: startEditing',
            rowCtrl?.rowId,
            cellCtrl?.column.colId,
            key,
            event,
            shouldStop
        );

        const rowId = rowCtrl.rowId!;
        const colId = cellCtrl?.column.getColId() ?? this.beans.visibleCols.getFirstColumn()!.getColId();

        this.rowId = rowId;
        this.colId = colId;

        this.editModel.startEditing(rowId, colId);

        return true;
    }

    public stopEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        if (!this.isEditing(rowCtrl, cellCtrl)) {
            return false;
        }

        console.warn('SingleCellEditStrategy: stopEditing', rowCtrl?.rowId, cellCtrl?.column.colId);

        this.editModel.stopEditing(rowCtrl?.rowId, cellCtrl?.column.colId);

        this.destroyEditor(rowCtrl, cellCtrl, false);

        this.rowId = undefined;
        this.colId = undefined;

        return true;
    }

    public cancelEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        if (!this.isEditing(rowCtrl, cellCtrl)) {
            return false;
        }

        console.warn('SingleCellEditStrategy: cancelEditing', rowCtrl?.rowId, cellCtrl?.column.colId);

        this.editModel.cancelEditing(rowCtrl?.rowId, cellCtrl?.column.colId);

        this.destroyEditor(rowCtrl, cellCtrl, true);

        this.rowId = undefined;
        this.colId = undefined;

        return true;
    }

    protected override onCellFocusChanged(event: CellFocusedEvent<any, any>): void {
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
        this.stopEditing(rowCtrl, cellCtrl);
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

        if (this.shouldStopEditing(nextCell.rowCtrl, nextCell)) {
            this.stopAllEditing();
        }

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        this.beans.editingSvc?.startEditing(nextCell.rowCtrl, nextCell, null, true, event);
        nextCell.focusCell(false);
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
