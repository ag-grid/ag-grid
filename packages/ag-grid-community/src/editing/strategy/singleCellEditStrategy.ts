import type { BeanName } from '../../context/context';
import type { RowNode } from '../../entities/rowNode';
import type { CellFocusedEvent, CommonCellFocusParams } from '../../events';
import type { Column } from '../../interfaces/iColumn';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { _getColId, _resolveCellController, _resolveControllers } from '../utils/controllers';
import { BaseEditStrategy } from './baseEditStrategy';

export class SingleCellEditStrategy extends BaseEditStrategy {
    override beanName = 'singleCell' as BeanName | undefined;

    private rowNode?: RowNode | null;
    private column?: Column | null;

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

        if ((!this.rowNode || !this.column) && rowCtrl && cellCtrl) {
            return null;
        } else if (!rowCtrl && !cellCtrl && this.rowNode && this.column) {
            return null;
        }

        return this.rowNode !== rowCtrl?.rowNode || this.column !== cellCtrl?.column;
    }

    public updateStyles(_rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null, newState?: boolean): void {
        cellCtrl?.comp.toggleCss('ag-cell-batch-edit', (newState && this.gos.get('batchEdit')) ?? false);
    }

    public startEditing(
        rowCtrl: RowCtrl,
        cellCtrl?: CellCtrl,
        _key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null,
        _source: 'api' | 'ui' = 'ui'
    ): boolean {
        const rowNode = rowCtrl.rowNode!;
        const column = cellCtrl?.column ?? this.beans.visibleCols.getFirstColumn()!;

        if (this.rowNode !== rowNode || this.column !== column) {
            super.cleanupEditors();
        }

        this.rowNode = rowNode;
        this.column = column;

        this.editModel.startEditing(rowNode, column);

        this.updateStyles(rowCtrl, cellCtrl, true);

        return this.finishStartEdit(
            [
                {
                    rowNode,
                    column,
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
        this.editModel.getPendingCellIds().forEach((cellId) => {
            const cellCtrl = _resolveCellController(this.beans, cellId);
            if (cellCtrl) {
                cellCtrl.comp.toggleCss('ag-cell-batch-edit', false);
                this.updateStyles(cellCtrl.rowCtrl, cellCtrl, false);
            }
        });

        super.stopEditing(rowCtrl, cellCtrl, source);

        this.rowNode = undefined;
        this.column = undefined;

        return true;
    }

    public onCellFocusChanged(event: CellFocusedEvent<any, any>): void {
        const { rowIndex, column } = event;
        const previous = (event as any)['previousParams']! as CommonCellFocusParams;

        if (previous?.rowIndex === rowIndex && _getColId(previous?.column) === _getColId(column)) {
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

    public override destroy(): void {
        super.destroy();

        this.rowNode = undefined;
        this.column = undefined;
    }
}
