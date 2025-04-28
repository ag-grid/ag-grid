import type { BeanCollection, BeanName } from '../../context/context';
import type { CellFocusedEvent } from '../../events';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { CellIdPositions } from '../model/gridEditingModel';
import { BaseEditStrategy } from './baseEditStrategy';
import { _resolveCellController, _takeValueFromCellEditor } from './utils';

export class BatchEditStrategy extends BaseEditStrategy {
    override beanName = 'batchEditMode' as BeanName | undefined;

    public override startEditing(
        rowCtrl: RowCtrl,
        cellCtrl?: CellCtrl | undefined,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        _source: 'api' | 'ui' = 'ui'
    ): boolean {
        console.warn('BatchEditStrategy: startEditing', rowCtrl?.rowId, cellCtrl?.column.colId, key, event);

        const rowId = rowCtrl.rowId!;
        const colId = cellCtrl?.column.getColId() ?? this.beans.visibleCols.getFirstColumn()!.getColId();

        this.editModel.startEditing(rowId, colId);

        return this.finishStartEdit(rowCtrl, cellCtrl, undefined, true, event);
    }

    public override shouldStopEditing(
        _rowCtrl?: RowCtrl | null,
        _cellCtrl?: CellCtrl | null,
        _key?: string | null | undefined,
        _event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        return source !== 'ui';
    }

    override shouldCancelEditing(
        _rowCtrl?: RowCtrl | null | undefined,
        _cellCtrl?: CellCtrl | null | undefined,
        _key?: string | null | undefined,
        _event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        return source !== 'ui';
    }

    protected updatePendingValue(beans: BeanCollection, cells: CellIdPositions[]): void {
        cells.forEach((cellId) => {
            const { rowId, columnId } = cellId;
            const cellCtrl = _resolveCellController(beans, { rowId, columnId });
            const { comp, rowNode, column } = cellCtrl!;

            const { newValue, newValueExists } = _takeValueFromCellEditor(false, comp);

            if (!newValueExists) {
                return;
            }

            this.editModel.getEditModels(rowId!, column.colId).forEach((editModel) => {
                const oldValue = beans.valueSvc.getValueForDisplay(column, rowNode)?.value;
                editModel.newValue = newValue;
                editModel.oldValue = oldValue;
            });
        });
    }

    protected override onCellFocusChanged(_event: CellFocusedEvent<any, any>): void {
        this.updatePendingValue(this.beans, this.editModel.getEditingCellIds());
    }

    public override stopEditing(
        rowCtrl?: RowCtrl | undefined,
        cellCtrl?: CellCtrl | undefined,
        _source: 'api' | 'ui' = 'ui'
    ): boolean {
        const oldState = this.isEditing(rowCtrl);

        if (!oldState) {
            return false;
        }

        console.warn('FullRowEditStrategy: stopEditing');

        const edits = this.editModel.getEditingCellIds();

        this.editModel.stopEditing();

        this.destroyEditors(edits, false, _source === 'ui');

        return true;
    }

    public override cancelEditing(
        rowCtrl?: RowCtrl | undefined,
        cellCtrl?: CellCtrl | undefined,
        _source: 'api' | 'ui' = 'ui'
    ): boolean {
        const oldState = this.isEditing(rowCtrl);

        if (!oldState) {
            return false;
        }

        console.warn('FullRowEditStrategy: cancelEditing');

        const edits = this.editModel.getEditingCellIds();

        this.editModel.cancelEditing();

        this.destroyEditors(edits, true);

        return true;
    }

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

        // if (this.shouldStopEditing(nextCell.rowCtrl, nextCell)) {
        //     this.stopAllEditing();
        // }

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        this.startEditing(nextCell.rowCtrl, nextCell, null, event);

        nextCell.focusCell(false);
        return true;
    }
}
