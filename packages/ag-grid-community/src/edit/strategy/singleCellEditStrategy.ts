import type { BeanName } from '../../context/context';
import { _getRowNode } from '../../entities/positionUtils';
import type { CellFocusedEvent, CommonCellFocusParams } from '../../events';
import type { Column } from '../../interfaces/iColumn';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import { _getColId } from '../utils/controllers';
import { BaseEditStrategy } from './baseEditStrategy';

export class SingleCellEditStrategy extends BaseEditStrategy {
    override beanName = 'singleCell' as BeanName | undefined;

    private rowNode?: IRowNode | null;
    private column?: Column | null;

    public override shouldStopEditing(
        rowNode?: IRowNode | undefined,
        column?: Column | undefined,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        const res = super.shouldStopEditing(rowNode, column, key, event, source);
        if (res !== null) {
            return res;
        }

        if ((!this.rowNode || !this.column) && rowNode && column) {
            return null;
        } else if (!rowNode && !column && this.rowNode && this.column) {
            return null;
        }

        return this.rowNode !== rowNode || this.column !== column;
    }

    public override shouldAcceptMidBatchInteractions(
        rowNode: IRowNode | undefined,
        column: Column | undefined
    ): boolean {
        if (!rowNode || !column) {
            return false;
        }

        return this.editModel.hasPending(rowNode, column);
    }

    public clearPendingEditors(rowNode?: IRowNode, column?: Column): void {
        this.editModel.clearPendingValue(rowNode, column);
    }

    public startEditing(
        rowNode: IRowNode,
        column: Column,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null,
        _source: 'api' | 'ui' = 'ui',
        silent?: boolean
    ): boolean {
        if (this.rowNode !== rowNode || this.column !== column) {
            super.cleanupEditors();
        }

        this.rowNode = rowNode;
        this.column = column;

        this.editModel.startEditing(rowNode, column);
        if (!silent) {
            this.dispatchCellEvent(rowNode, column, event, 'cellEditingStarted');
        }

        return this.setupEditors(
            [
                {
                    rowNode,
                    column,
                },
            ],
            rowNode,
            column,
            key,
            true,
            event
        );
    }

    public override dispatchRowEvent(
        _rowNode: IRowNode<any> | null | undefined,
        _type: 'rowEditingStarted' | 'rowEditingStopped'
    ): void {
        // NOP - single cell edit strategy does not dispatch row events
    }

    public override stopEditing(): boolean {
        super.stopEditing();

        this.rowNode = undefined;
        this.column = undefined;

        return true;
    }

    public override onCellFocusChanged(event: CellFocusedEvent<any, any>): void {
        const { colModel, editSvc } = this.beans;
        const { rowIndex, column, rowPinned } = event;
        const rowNode = _getRowNode(this.beans, { rowIndex: rowIndex!, rowPinned });
        const curColId = _getColId(column);
        const curCol = colModel.getCol(curColId);

        const previous = (event as any)['previousParams']! as CommonCellFocusParams;
        if (previous) {
            const prevColId = _getColId(previous.column);

            if (previous?.rowIndex === rowIndex && prevColId === curColId && previous?.rowPinned === rowPinned) {
                return;
            }
        }

        if (editSvc?.isEditing(rowNode, curCol, false, true)) {
            // editor is already active, so we don't need to do anything
            return;
        }

        super.onCellFocusChanged(event);
    }

    // returns null if no navigation should be performed
    public override moveToNextEditingCell(
        previousCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source: 'api' | 'ui' = 'ui'
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

        this.beans.editSvc?.startEditing(nextCell.rowNode, nextCell.column, null, true, event, source);

        return true;
    }

    public override destroy(): void {
        super.destroy();

        this.rowNode = undefined;
        this.column = undefined;
    }
}
