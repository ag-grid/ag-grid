import type { BeanName } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { CellFocusedEvent, CommonCellFocusParams } from '../../events';
import type { EditValue } from '../../interfaces/iEditModelService';
import type { EditPosition, EditRowPosition, StartEditWithPositionParams } from '../../interfaces/iEditService';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import { _getCellCtrl, _getRowCtrl } from '../utils/controllers';
import { _populateModelValidationErrors, _setupEditor, _sourceAndPendingDiffer } from '../utils/editors';
import type { EditValidationAction, EditValidationResult } from './baseEditStrategy';
import { BaseEditStrategy } from './baseEditStrategy';

export class FullRowEditStrategy extends BaseEditStrategy {
    override beanName = 'fullRow' as BeanName | undefined;
    private rowNode?: IRowNode;
    private readonly startedRows: IRowNode[] = [];

    public override shouldStop(
        position?: EditPosition,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        _source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        const { rowNode } = position || {};
        const oldRowCtrl = _getRowCtrl(this.beans, {
            rowNode: this.rowNode,
        });

        if (!oldRowCtrl) {
            return true;
        }

        const res = super.shouldStop({ rowNode: this.rowNode }, event, _source);
        if (res !== null) {
            return res;
        }

        if (!this.rowNode) {
            return false;
        }

        // stop editing if we've changed rows
        return rowNode !== this.rowNode;
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
        if (this.rowNode !== rowNode) {
            super.cleanupEditors(position);
        }

        const columns = this.beans.visibleCols.allCols;
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

        this.dispatchRowEvent({ rowNode }, 'rowEditingStarted', silent);
        this.startedRows.push(rowNode);

        for (const column of editableColumns) {
            const position: Required<EditPosition> = {
                rowNode,
                column,
            };
            cells.push(position);

            if (!this.model.hasEdits(position)) {
                this.model.start(position);
            }
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

    public override stop(cancel?: boolean, event?: Event | null): boolean {
        const { rowNode } = this;
        if (rowNode && !this.model.hasRowEdits(rowNode)) {
            return false;
        }

        const changedRows: IRowNode[] = [];
        if (!cancel) {
            this.model.getEditMap().forEach((rowEdits, rowNode) => {
                if (!rowEdits || rowEdits.size === 0) {
                    return;
                }

                for (const edit of rowEdits.values()) {
                    if (_sourceAndPendingDiffer(edit)) {
                        changedRows.push(rowNode);
                        // early return, we only need to know if there are any edits
                        break;
                    }
                }
            });
        }

        // rerun validation, new values might have triggered row validations
        _populateModelValidationErrors(this.beans);
        if (!cancel && this.editSvc?.checkNavWithValidation({ rowNode }) === 'block-stop') {
            return false;
        }

        super.stop(cancel, event);

        for (const rowNode of changedRows) {
            this.dispatchRowEvent({ rowNode }, 'rowValueChanged');
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

        const prevCell = _getCellCtrl(this.beans, prev);

        const isBlock = this.gos.get('invalidEditValueMode') === 'block';

        if (
            isBlock &&
            prevCell &&
            (this.model.getCellValidationModel().getCellValidation(prevCell) ||
                this.model.getRowValidationModel().getRowValidation(prevCell))
        ) {
            return;
        }

        super.onCellFocusChanged(event);
    }

    public override cleanupEditors(position: EditRowPosition = {}, includeEditing?: boolean): void {
        super.cleanupEditors(position, includeEditing);
        for (const rowNode of this.startedRows) {
            this.dispatchRowEvent({ rowNode }, 'rowEditingStopped');
        }
        this.startedRows.length = 0;
    }

    // returns null if no navigation should be performed
    public override moveToNextEditingCell(
        prevCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source: 'api' | 'ui' = 'ui',
        preventNavigation = false
    ): boolean | null {
        const prevPos = prevCell.cellPosition;

        // find the next cell to start editing
        let nextCell: CellCtrl | false | undefined;

        // fineNextCell in fullRow mode causes CellComps to initialise editors, this is
        // undesirable so we suspend the model while we find the next cell.
        this.model.suspend(true);
        try {
            nextCell = this.beans.navigation?.findNextCellToFocusOn(prevPos, {
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
            this.model.suspend(false);
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

        const rowsMatch = nextPos && prevPos.rowIndex === nextPos.rowIndex && prevPos.rowPinned === nextPos.rowPinned;

        if (prevEditable) {
            this.setFocusOutOnEditor(prevCell);
        }

        this.restoreEditors();

        const suppressStartEditOnTab = this.gos.get('suppressStartEditOnTab');

        if (nextEditable && !preventNavigation) {
            if (suppressStartEditOnTab) {
                nextCell.focusCell(true, event);
            } else {
                if (!nextCell.comp?.getCellEditor()) {
                    // editor missing because it was outside the viewport during creating phase,
                    // create it now
                    _setupEditor(this.beans, nextCell, { event, cellStartedEdit: true });
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
            this.editSvc?.stopEditing({ rowNode: prevCell.rowNode }, { event });
            this.cleanupEditors(nextCell, true);

            if (suppressStartEditOnTab) {
                nextCell.focusCell(true, event);
            } else {
                this.editSvc.startEditing(nextCell, { startedEdit: true, event, source, ignoreEventKey: true });
            }
        }

        prevCell.rowCtrl?.refreshRow({ suppressFlash: true, force: true });

        return true;
    }

    private restoreEditors(): void {
        // check all cells that should have an editor have one - in the case of small viewports,
        // editors might have been destroyed along with their corresponding cellCtrl
        this.model.getEditMap().forEach((rowEdits, rowNode) =>
            rowEdits.forEach(({ state }, column) => {
                if (state !== 'editing') {
                    return;
                }

                const cellCtrl = _getCellCtrl(this.beans, {
                    rowNode,
                    column,
                });

                if (cellCtrl && !cellCtrl.comp?.getCellEditor()) {
                    _setupEditor(this.beans, cellCtrl, { silent: true });
                }
            })
        );
    }

    public override destroy(): void {
        super.destroy();
        this.rowNode = undefined;
        this.startedRows.length = 0;
    }
}
