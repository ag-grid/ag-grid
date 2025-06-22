import type { BeanName } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _getRowNode } from '../../entities/positionUtils';
import type { CellFocusedEvent, CommonCellFocusParams } from '../../events';
import type { Column } from '../../interfaces/iColumn';
import type { EditPosition, EditRowPosition } from '../../interfaces/iEditService';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import { _getColId } from '../utils/controllers';
import { _populateModelValidationErrors, _setupEditor } from '../utils/editors';
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
        ignoreEventKey?: boolean
    ): void {
        if (this.rowNode !== position.rowNode || this.column !== position.column) {
            super.cleanupEditors();
        }

        this.rowNode = position.rowNode;
        this.column = position.column;

        this.model.start(position);

        this.setupEditors([position], position, true, event, ignoreEventKey);
    }

    public override dispatchRowEvent(
        _position: EditRowPosition,
        _type: 'rowEditingStarted' | 'rowEditingStopped'
    ): void {
        // NOP - single cell edit strategy does not dispatch row events
    }

    public override stop(cancel?: boolean): boolean {
        super.stop(cancel);

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
        prevCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        // check for all cell-level validation errors
        const preventNavigation = this.editSvc.checkNavWithValidation(undefined, event) === 'block-stop';

        const prevPos = prevCell.cellPosition;

        // find the next cell to start editing
        let nextCell: CellCtrl | false | undefined;

        const shouldSuspend = this.beans.gos.get('editType') === 'fullRow';

        if (shouldSuspend) {
            // fineNextCell in fullRow mode causes CellComps to initialise editors, this is
            // undesirable so we suspend the model while we find the next cell.
            this.model.suspend(true);
        } else {
            // before we stop editing, we need to focus the cell element
            // so the grid doesn't detect that focus has left the grid
            prevCell.eGui.focus();

            // need to do this before getting next cell to edit, in case the next cell
            // has editable function (eg colDef.editable=func() ) and it depends on the
            // result of this cell, so need to save updates from the first edit, in case
            // the value is referenced in the function.
            prevCell.stopEditing();
        }

        try {
            nextCell = this.beans.navigation?.findNextCellToFocusOn(prevPos, {
                backwards,
                startEditing: true,
                // Default behaviour for fullRow is skip to the next cell,
                // editable or not. FullRow editing might have some editable
                // and some not editable cells in the row.
                // More complex logic needed to skip to the
                // next FullRow editable cell,
                // skipToNextEditableCell: false,
            }) as CellCtrl | false;
        } finally {
            if (shouldSuspend) {
                this.model.suspend(false);
            }
        }

        if (nextCell === false) {
            return null;
        }
        if (nextCell == null) {
            return preventNavigation;
        }

        const nextPos = nextCell.cellPosition;

        const prevEditable = prevCell.isCellEditable();
        const nextEditable = nextCell.isCellEditable();

        const rowsMatch = nextPos && prevPos.rowIndex === nextPos.rowIndex && prevPos.rowPinned === nextPos.rowPinned;

        if (!rowsMatch) {
            // run validation to gather row-level validation errors
            _populateModelValidationErrors(this.beans, true);

            if (this.model.getRowValidationModel().getRowValidationMap().size > 0) {
                // if there was a previous row validation error, we need to check if that's still the case
                if (this.editSvc.checkNavWithValidation(prevCell, event, true) === 'block-stop') {
                    return true;
                }
            } else {
                const rowPreventNavigation =
                    this.editSvc.checkNavWithValidation(prevCell, event, true) === 'block-stop';
                if (rowPreventNavigation) {
                    return true;
                }
            }

            if (preventNavigation && this.model.getRowValidationModel().getRowValidation(prevCell)) {
                return true;
            }
        }

        if (prevEditable) {
            this.setFocusOutOnEditor(prevCell);
        }

        if (!rowsMatch && !preventNavigation) {
            super.cleanupEditors(nextCell, true);
            this.editSvc.startEditing(nextCell, { startedEdit: true, event, source, ignoreEventKey: true });
        }

        if (nextEditable && !preventNavigation) {
            if (!nextCell.comp?.getCellEditor()) {
                // editor missing because it was outside the viewport during creating phase, attempt to create it now
                _setupEditor(this.beans, nextCell, undefined, event, true);
            }
            this.setFocusInOnEditor(nextCell);
            nextCell.focusCell(false, event);
        } else {
            if (preventNavigation && this.model.getCellValidationModel().getCellValidation(prevCell)) {
                return true;
            }

            nextCell.focusCell(true, event);
        }

        prevCell.rowCtrl?.refreshRow({ suppressFlash: true, force: true });

        return true;
    }

    protected override processValidationResults(results: EditValidationResult): EditValidationAction {
        const anyFailed = results.fail.length > 0;

        // if any of the cells failed, we keep all editors
        if (anyFailed && this.editSvc.cellEditingInvalidCommitBlocks()) {
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
