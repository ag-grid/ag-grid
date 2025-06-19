import type { BeanName } from '../../context/context';
import type { CellFocusedEvent, CommonCellFocusParams } from '../../events';
import type { EditValue } from '../../interfaces/iEditModelService';
import type { EditPosition } from '../../interfaces/iEditService';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import { _getRowCtrl } from '../utils/controllers';
import { _setupEditor } from '../utils/editors';
import type { EditValidationAction, EditValidationResult } from './baseEditStrategy';
import { BaseEditStrategy } from './baseEditStrategy';

export class FullRowEditStrategy extends BaseEditStrategy {
    override beanName = 'fullRow' as BeanName | undefined;
    private rowNode?: IRowNode;

    public override isCellEditable(position: Required<EditPosition>, source: 'api' | 'ui' = 'ui'): boolean {
        const editable = super.isCellEditable(position, source);

        if (editable === true || source === 'ui') {
            return editable;
        }

        // check if other cells in row are editable, so starting edit on uneditable cell will still work
        const columns = this.beans.colModel.getCols();
        return columns.some((col) => super.isCellEditable({ rowNode: position.rowNode, column: col }, source));
    }

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

    public override start(
        position: Required<EditPosition>,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        _source: 'api' | 'ui' = 'ui',
        silent?: boolean,
        ignoreEventKey?: boolean
    ): void {
        const { rowNode } = position;
        if (this.rowNode !== rowNode) {
            super.cleanupEditors();
        }

        if (!this.model.hasEdits({ rowNode }) && !silent) {
            this.dispatchRowEvent({ rowNode }, 'rowEditingStarted');
        }

        const columns = this.beans.visibleCols.allCols;
        const cells: Required<EditPosition>[] = [];

        columns.forEach((column) => {
            if (!column.isCellEditable(rowNode)) {
                return;
            }
            const position: Required<EditPosition> = {
                rowNode,
                column,
            };
            cells.push(position);

            if (!this.model.hasEdits(position)) {
                this.model.start(position);
                if (!silent) {
                    this.dispatchCellEvent(position, event, 'cellEditingStarted');
                }
            }
        });

        this.rowNode = rowNode;

        this.setupEditors(cells, position, true, event, ignoreEventKey);
    }

    protected override processValidationResults(
        results: EditValidationResult<Required<EditPosition> & EditValue>
    ): EditValidationAction {
        const anyFailed = results.fail.length > 0 || this.handleCustomFullRowValidation(results.all);

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

    private handleCustomFullRowValidation(editors: (Required<EditPosition> & EditValue)[]): boolean {
        const { gos, beans, rowNode, eventSvc } = this;
        const getFullRowEditValidationErrors = gos.get('getFullRowEditValidationErrors');

        const fullRowEditErrors = getFullRowEditValidationErrors?.({
            editorsState: editors.map(({ column, rowNode: { rowIndex, rowPinned }, newValue, oldValue, state }) => ({
                colId: column.getColId(),
                column,
                rowIndex: rowIndex!,
                rowPinned,
                newValue,
                oldValue,
                state,
            })),
        });

        const rowCtrl = _getRowCtrl(beans, { rowNode });

        // if `cellEditingInvalidCommitType` is not `block` there is no need
        // to fire the event, as the row will not display tooltips or be styled
        if (gos.get('cellEditingInvalidCommitType') === 'block' && rowCtrl) {
            eventSvc.dispatchEvent({
                ...rowCtrl.createRowEvent('rowEditingValidated'),
                errorMessages: fullRowEditErrors,
            });
        }

        return !!fullRowEditErrors?.length;
    }

    public override stop(cancel?: boolean): boolean {
        if (this.rowNode && !this.model.hasRowEdits({ rowNode: this.rowNode })) {
            return false;
        }

        super.stop(cancel);

        this.rowNode = undefined;

        return true;
    }

    public override onCellFocusChanged(event: CellFocusedEvent<any, any>): void {
        const { rowIndex } = event;
        const prev = (event as any)['previousParams']! as CommonCellFocusParams;

        if (prev?.rowIndex === rowIndex || event.sourceEvent instanceof KeyboardEvent) {
            return;
        }

        super.onCellFocusChanged(event);

        const previous = (event as any)['previousParams']! as CommonCellFocusParams;
        if (previous) {
            _getRowCtrl(this.beans, previous)?.refreshRow({ suppressFlash: true, force: true });
        }
    }

    // returns null if no navigation should be performed
    public override moveToNextEditingCell(
        prevCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        const prevPos = prevCell.cellPosition;

        // find the next cell to start editing
        const nextCell = this.beans.navigation?.findNextCellToFocusOn(prevPos, backwards, true) as CellCtrl | false;
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

        if (!rowsMatch) {
            this.editSvc.startEditing(nextCell, { startedEdit: true, event, source, ignoreEventKey: true });
        }

        if (nextEditable) {
            if (!nextCell.comp?.getCellEditor()) {
                // editor missing because it was outside the viewport during creating phase, attempt to create it now
                _setupEditor(this.beans, nextCell, undefined, event, true);
            }
            this.setFocusInOnEditor(nextCell);
            nextCell.focusCell(false, event);
        } else {
            nextCell.focusCell(true, event);
        }

        prevCell.rowCtrl?.refreshRow({ suppressFlash: true, force: true });

        return true;
    }

    public override destroy(): void {
        super.destroy();
        this.rowNode = undefined;
    }
}
