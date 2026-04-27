import type { BeanName } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _getCellByPosition, _getRowNode } from '../../entities/positionUtils';
import type { CellFocusClearedEvent, CellFocusedEvent, CommonCellFocusParams } from '../../events';
import type { Column } from '../../interfaces/iColumn';
import type { EditValue } from '../../interfaces/iEditModelService';
import type { EditPosition, EditRowPosition, StartEditWithPositionParams } from '../../interfaces/iEditService';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import { _getColId } from '../utils/controllers';
import { _setupEditor } from '../utils/editors';
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

        const rowNode = position?.rowNode;
        const column = position?.column;
        const trackedRowNode = this.rowNode;
        const trackedColumn = this.column;

        if ((!trackedRowNode || !trackedColumn) && rowNode && column) {
            return null; // no existing edit, so don't stop
        }

        if (trackedRowNode !== rowNode || trackedColumn !== column) {
            return true; // stop editing if moving to a different cell
        }

        // Both tracked and position cells are null/undefined (cells match after check above).
        // Stop orphan editors from tabbing into empty cells.
        if (!trackedRowNode && !trackedColumn) {
            return this.model.hasEdits(undefined, { withOpenEditor: true });
        }

        return false; // continue editing the same cell
    }

    public override midBatchInputsAllowed(position?: EditPosition): boolean {
        return this.model.hasEdits(position);
    }

    public start(params: StartEditWithPositionParams): void {
        const { position, startedEdit, event, ignoreEventKey } = params;
        if (this.rowNode !== position.rowNode || this.column !== position.column) {
            super.cleanupEditors();
        }

        this.rowNode = position.rowNode;
        this.column = position.column;

        this.model.start(position);

        this.setupEditors({ cells: [position], position, startedEdit, event, ignoreEventKey });
    }

    public override dispatchRowEvent(
        _position: EditRowPosition,
        _type: 'rowEditingStarted' | 'rowEditingStopped' | 'rowValueChanged',
        _silent?: boolean
    ): void {
        // NOP - single cell edit strategy does not dispatch row events
    }

    protected override processValidationResults(
        results: EditValidationResult<Required<EditPosition> & EditValue>
    ): EditValidationAction {
        const anyFailed = results.fail.length > 0;

        // if any of the cells failed, keep those editors
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

    public override stopCancelled(forceCancel: boolean): boolean {
        super.stopCancelled(forceCancel);
        return this.clearPosition();
    }

    public override stopCommitted(event: Event | null, commit: boolean): boolean {
        super.stopCommitted(event, commit);
        return this.clearPosition();
    }

    private clearPosition(): true {
        this.rowNode = undefined;
        this.column = undefined;
        return true;
    }

    public override onCellFocusChanged(event: CellFocusedEvent | CellFocusClearedEvent): void {
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

        if (
            event.type == 'cellFocused' &&
            (editSvc?.isRangeSelectionEnabledWhileEditing() ||
                editSvc?.isEditing({ rowNode, column: curCol as AgColumn }, { withOpenEditor: true }))
        ) {
            // if editor is a formula selecting a range or if the
            // editor is already active, we don't need to do anything
            return;
        }

        super.onCellFocusChanged(event);
    }

    // returns null if no navigation should be performed
    public override moveToNextEditingCell(
        prevCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source: 'api' | 'ui' = 'ui',
        preventNavigation = false
    ): boolean | null {
        const focusedCell = this.beans.focusSvc.getFocusedCell();
        if (focusedCell) {
            // When we're tabbing into a virtualised column in an async setting,
            // prevCell should be the same as focused Cell, but isn't.
            // Force lookup of the cell.
            // We can only enter moveToNextEditingCell from a keyboard event
            // on a focused cell so this is safe to assume
            prevCell = _getCellByPosition(this.beans, focusedCell) ?? prevCell;
        }

        const prevPos = prevCell.cellPosition;

        // find the next cell to start editing
        let nextCell: CellCtrl | false | undefined;

        const shouldSuspend = this.beans.gos.get('editType') === 'fullRow';

        if (shouldSuspend) {
            // fineNextCell in fullRow mode causes CellComps to initialise editors, this is
            // undesirable so we suspend the model while we find the next cell.
            this.model.suspend(true);
        }

        if (!preventNavigation) {
            // before we stop editing, we need to focus the cell element
            // so the grid doesn't detect that focus has left the grid
            prevCell.eGui.focus();

            // need to do this before getting next cell to edit, in case the next cell
            // has editable function (eg colDef.editable=func() ) and it depends on the
            // result of this cell, so need to save updates from the first edit, in case
            // the value is referenced in the function.
            this.editSvc?.stopEditing(prevCell, { source: this.editSvc?.isBatchEditing() ? 'ui' : 'api', event });
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
            return false;
        }

        const nextPos = nextCell.cellPosition;

        const prevEditable = prevCell.isCellEditable();
        const nextEditable = nextCell.isCellEditable();

        const rowsMatch = prevPos.rowIndex === nextPos?.rowIndex && prevPos.rowPinned === nextPos.rowPinned;

        if (prevEditable && !preventNavigation) {
            this.setFocusOutOnEditor(prevCell);
        }

        // Don't start editing the next cell, focus only
        const suppressStartEditOnTab = this.gos.get('suppressStartEditOnTab');

        let startEditingCalled = false;
        if (!rowsMatch && !preventNavigation) {
            super.cleanupEditors(nextCell, true);

            if (suppressStartEditOnTab) {
                nextCell.focusCell(true, event);
            } else {
                startEditingCalled = true;
                this.editSvc.startEditing(nextCell, {
                    startedEdit: true,
                    event,
                    source,
                    ignoreEventKey: true,
                    editable: nextEditable,
                });
            }
        }

        if (nextEditable && !preventNavigation) {
            // need to focus the cell before setting the editor, otherwise the focus handler won't cause previous editor cleanups
            nextCell.focusCell(false, event);
            if (suppressStartEditOnTab) {
                nextCell.focusCell(true, event);
            } else if (!nextCell.comp?.getCellEditor()) {
                // If startEditing was called above (cross-row navigation), the editor may not
                // exist yet because React creates editor components asynchronously. In that case
                // skip the redundant _setupEditor call to avoid overwriting the correctly-
                // parameterised first call. Otherwise, the editor is genuinely missing (e.g.
                // destroyed by column virtualisation while edit state remained open) and must
                // be re-created — silently if the cell is already in editing state to avoid
                // re-emitting cellEditingStarted.
                if (!startEditingCalled) {
                    const alreadyEditing = this.editSvc?.isEditing(nextCell, { withOpenEditor: true });
                    _setupEditor(this.beans, nextCell, { event, cellStartedEdit: true, silent: alreadyEditing });
                }
                this.setFocusInOnEditor(nextCell);

                this.cleanupEditors(nextCell);
            }
        } else {
            if (nextEditable && preventNavigation) {
                this.setFocusInOnEditor(nextCell);
            }
            nextCell.focusCell(true, event);
        }

        prevCell.rowCtrl?.refreshRow({ suppressFlash: true, force: true });

        return true;
    }

    public override destroy(): void {
        super.destroy();

        this.rowNode = undefined;
        this.column = undefined;
    }
}
