import type { BeanName } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _getRowNode } from '../../entities/positionUtils';
import type { CellFocusedEvent, CommonCellFocusParams } from '../../events';
import type { Column } from '../../interfaces/iColumn';
import type { EditPosition, EditRowPosition } from '../../interfaces/iEditService';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import { _getColId } from '../utils/controllers';
import type { EditValidationAction, EditValidationResult } from './baseEditStrategy';
import { BaseEditStrategy } from './baseEditStrategy';

export class SingleCellEditStrategy extends BaseEditStrategy {
    override beanName = 'singleCell' as BeanName | undefined;

    private rowNode?: IRowNode | null;
    private column?: Column | null;

    public override shouldStop(
        position?: EditPosition,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        const res = super.shouldStop(position, event, source);
        if (res !== null) {
            return res;
        }

        const { rowNode, column } = position || {};

        if ((!this.rowNode || !this.column) && rowNode && column) {
            return null;
        }

        if (!rowNode && !column && this.rowNode && this.column) {
            return null;
        }

        return this.rowNode !== rowNode || this.column !== column;
    }

    public override midBatchInputsAllowed(position?: EditPosition): boolean {
        return this.model.hasEdits(position);
    }

    public start(
        position: Required<EditPosition>,
        event?: KeyboardEvent | MouseEvent | null,
        _source: 'api' | 'ui' = 'ui',
        silent?: boolean,
        ignoreEventKey?: boolean
    ): void {
        if (this.rowNode !== position.rowNode || this.column !== position.column) {
            super.cleanupEditors();
        }

        this.rowNode = position.rowNode;
        this.column = position.column;

        this.model.start(position);
        if (!silent) {
            this.dispatchCellEvent(position, event, 'cellEditingStarted');
        }

        this.setupEditors([position], position, true, event, ignoreEventKey);
    }

    public override dispatchRowEvent(
        _position: EditRowPosition,
        _type: 'rowEditingStarted' | 'rowEditingStopped'
    ): void {
        // NOP - single cell edit strategy does not dispatch row events
    }

    public override stop(): boolean {
        super.stop();

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

        if (editSvc?.isEditing({ rowNode, column: curCol as AgColumn }, { withOpenEditor: true })) {
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

        this.editSvc.startEditing(nextCell, { startedEdit: true, event, source, ignoreEventKey: true });

        return true;
    }

    protected override processValidationResults(results: EditValidationResult): EditValidationAction {
        const anyFailed = results.fail.length > 0;

        // if any of the cells failed, we keep all editors
        if (anyFailed && this.keepInvalidEditors) {
            return {
                destroy: [],
                keep: results.all,
            };
        }

        // if no cells failed, we destroy all editors
        return {
            destroy: results.all,
            keep: [],
        };
    }

    public override destroy(): void {
        super.destroy();

        this.rowNode = undefined;
        this.column = undefined;
    }
}
