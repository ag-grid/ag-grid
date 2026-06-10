import type { BeanName } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { CellFocusedEvent, CommonCellFocusParams } from '../../events';
import type { EditValue } from '../../interfaces/iEditModelService';
import type { EditPosition, EditRowPosition, StartEditWithPositionParams } from '../../interfaces/iEditService';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import { _getCellCtrl, _getRowCtrl } from '../utils/controllers';
import { _destroyEditor, _setupEditor, _sourceAndPendingDiffer } from '../utils/editors';
import type { EditValidationAction, EditValidationResult } from './baseEditStrategy';
import { BaseEditStrategy } from './baseEditStrategy';

export class FullRowEditStrategy extends BaseEditStrategy {
    override beanName = 'fullRow' as BeanName | undefined;
    private rowNode?: IRowNode;
    private readonly startedRows = new Set<IRowNode>();

    public override shouldStop(
        position?: EditPosition,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        _source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        const { rowNode: currentRowNode, beans } = this;
        const { rowNode } = position || {};
        const oldRowCtrl = _getRowCtrl(beans, { rowNode: currentRowNode });

        if (!oldRowCtrl) {
            return true;
        }

        const res = super.shouldStop({ rowNode: currentRowNode }, event, _source);
        if (res !== null) {
            return res;
        }

        if (!currentRowNode) {
            return false;
        }

        // stop editing if we've changed rows
        return rowNode !== currentRowNode;
    }

    public override midBatchInputsAllowed({ rowNode }: EditPosition): boolean {
        if (!rowNode) {
            return false;
        }

        return this.model.hasEdits({ rowNode });
    }

    public override clearEdits(position: EditPosition): void {
        this.model.clearEditValue(position);
    }

    public override start(params: StartEditWithPositionParams): void {
        const { position, silent, startedEdit, event, ignoreEventKey } = params;
        const { rowNode } = position;
        const { beans, model, startedRows } = this;

        if (this.rowNode !== rowNode) {
            super.cleanupEditors(position);
        }

        const columns = beans.visibleCols.allCols;
        const cells: Required<EditPosition>[] = [];

        const editableColumns: AgColumn[] = [];

        for (const column of columns) {
            if (column.isCellEditable(rowNode)) {
                editableColumns.push(column);
            }
        }

        if (editableColumns.length == 0) {
            return;
        }

        // Guard against duplicate rowEditingStarted / startedRows entries for the same row.
        // When column virtualisation recycles cells on the editing row (e.g. during horizontal
        // scrolling), start() is re-invoked for the same rowNode. Without this guard,
        // cleanupEditors would fire rowEditingStopped once per duplicate entry.
        if (!startedRows.has(rowNode)) {
            this.dispatchRowEvent({ rowNode }, 'rowEditingStarted', silent);
            startedRows.add(rowNode);
        }

        for (const column of editableColumns) {
            const position: Required<EditPosition> = {
                rowNode,
                column,
            };
            cells.push(position);

            model.start(position);
        }

        this.rowNode = rowNode;
        this.setupEditors({ cells, position, startedEdit, event, ignoreEventKey });
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
        const { rowNode, model } = this;
        if (rowNode && !model.hasEdits()) {
            return false;
        }

        super.stopCancelled(forceCancel);

        this.cleanupEditors({ rowNode }, true);
        this.rowNode = undefined;

        return true;
    }

    public override stopCommitted(event: Event | null, commit: boolean): boolean {
        const { rowNode, model, editSvc } = this;
        if (rowNode && !model.hasEdits()) {
            return false;
        }

        const changedRows: IRowNode[] = [];
        model.getEditMap().forEach((rowEdits, rowNode) => {
            if (!rowEdits || rowEdits.size === 0) {
                return;
            }

            for (const edit of rowEdits.values()) {
                if (_sourceAndPendingDiffer(edit)) {
                    changedRows.push(rowNode);
                    break;
                }
            }
        });

        editSvc.populateModelValidationErrors();
        if (editSvc.checkNavWithValidation({ rowNode }) === 'block-stop') {
            return false;
        }

        super.stopCommitted(event, commit);

        // Only dispatch rowValueChanged when data is actually being committed.
        // During batch row-to-row navigation, commit is false — values are pending, not persisted.
        if (commit || !editSvc.isBatchEditing()) {
            for (const rowNode of changedRows) {
                this.dispatchRowEvent({ rowNode }, 'rowValueChanged');
            }
        }

        this.cleanupEditors({ rowNode }, true);
        this.rowNode = undefined;

        return true;
    }

    public override onCellFocusChanged(event: CellFocusedEvent<any, any>): void {
        const { rowIndex } = event;
        const prev = (event as any)['previousParams']! as CommonCellFocusParams;

        if (prev?.rowIndex === rowIndex || event.sourceEvent instanceof KeyboardEvent) {
            return;
        }

        const { beans, gos, model } = this;

        // allow range selection while editing without ending the row edit.
        if (beans.editSvc?.isRangeSelectionEnabledWhileEditing()) {
            return;
        }

        const prevCell = _getCellCtrl(beans, prev);

        const isBlock = gos.get('invalidEditValueMode') === 'block';

        if (
            isBlock &&
            prevCell &&
            (model.getCellValidationModel().getCellValidation(prevCell) ||
                model.getRowValidationModel().getRowValidation(prevCell))
        ) {
            return;
        }

        super.onCellFocusChanged(event);
    }

    public override cleanupEditors(position: EditRowPosition = {}, includeEditing?: boolean): void {
        super.cleanupEditors(position, includeEditing);

        const { startedRows } = this;
        for (const rowNode of startedRows) {
            this.dispatchRowEvent({ rowNode }, 'rowEditingStopped');
            this.destroyEditorsForRow(rowNode);
        }
        startedRows.clear();
    }

    /**
     * Destroys all editors for a row that started full row editing, including editors
     * that are not represented in the edit model (e.g. empty/unedited editors).
     */
    private destroyEditorsForRow(rowNode: IRowNode): void {
        const rowCtrl = _getRowCtrl(this.beans, { rowNode });
        if (!rowCtrl) {
            return; // Row not rendered, no editors to destroy.
        }

        // Destroy every editor created for this row, including those without edit model entries.
        const destroyParams = {};
        for (const cellCtrl of rowCtrl.getAllCellCtrls()) {
            if (cellCtrl.comp?.getCellEditor()) {
                _destroyEditor(this.beans, cellCtrl, destroyParams, cellCtrl);
            }
        }
    }

    // returns null if no navigation should be performed
    public override moveToNextEditingCell(
        prevCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source: 'api' | 'ui' = 'ui',
        preventNavigation = false
    ): boolean | null {
        const { beans, model, gos, editSvc } = this;
        const prevPos = prevCell.cellPosition;

        // find the next cell to start editing
        let nextCell: CellCtrl | false | undefined;

        // fineNextCell in fullRow mode causes CellComps to initialise editors, this is
        // undesirable so we suspend the model while we find the next cell.
        model.suspend(true);
        try {
            nextCell = beans.navigation?.findNextCellToFocusOn(prevPos, {
                backwards,
                startEditing: true,
                // Default behaviour for fullRow is skip to the next cell,
                // editable or not. FullRow editing might have some editable
                // and some not editable cells in the row.
                // More complex logic needed to skip to the
                // next FullRow editable cell,
                skipToNextEditableCell: false,
            }) as CellCtrl | false;
        } finally {
            model.suspend(false);
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

        if (prevEditable) {
            this.setFocusOutOnEditor(prevCell);
        }

        this.restoreEditors();

        const suppressStartEditOnTab = gos.get('suppressStartEditOnTab');

        if (nextEditable && !preventNavigation) {
            if (suppressStartEditOnTab) {
                nextCell.focusCell(true, event);
            } else {
                if (!nextCell.comp?.getCellEditor()) {
                    // editor missing because it was outside the viewport during creating phase,
                    // create it now
                    _setupEditor(beans, nextCell, { event, cellStartedEdit: true });
                }
                this.setFocusInOnEditor(nextCell);
                nextCell.focusCell(false, event);
            }
        } else {
            if (nextEditable && preventNavigation) {
                this.setFocusInOnEditor(nextCell);
            }
            nextCell.focusCell(true, event);
        }

        if (!rowsMatch && !preventNavigation) {
            // force a commit before row editing stops so cellValueChanged fires before rowEditingStopped.
            editSvc?.stopEditing({ rowNode: prevCell.rowNode }, { event, forceStop: true });

            // if nothing was committed, editors may still be open; close them to finish the row edit.
            if (editSvc?.isRowEditing(prevCell.rowNode, { withOpenEditor: true })) {
                this.cleanupEditors(nextCell, true);
            }

            if (suppressStartEditOnTab) {
                nextCell.focusCell(true, event);
            } else {
                editSvc.startEditing(nextCell, {
                    startedEdit: true,
                    event,
                    source,
                    ignoreEventKey: true,
                    editable: nextEditable || undefined,
                });
            }
        }

        prevCell.rowCtrl?.refreshRow({ suppressFlash: true, force: true });

        return true;
    }

    private restoreEditors(): void {
        const { beans, model } = this;
        // check all cells that should have an editor have one - in the case of small viewports,
        // editors might have been destroyed along with their corresponding cellCtrl
        model.getEditMap().forEach((rowEdits, rowNode) =>
            rowEdits.forEach(({ state }, column) => {
                if (state !== 'editing') {
                    return;
                }

                const cellCtrl = _getCellCtrl(beans, {
                    rowNode,
                    column,
                });

                if (cellCtrl && !cellCtrl.comp?.getCellEditor()) {
                    _setupEditor(beans, cellCtrl, { silent: true });
                }
            })
        );
    }

    public override destroy(): void {
        super.destroy();
        this.rowNode = undefined;
        this.startedRows.clear();
    }
}
