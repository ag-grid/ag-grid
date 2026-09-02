import { KeyCode } from 'ag-stack';

import { BeanStub } from '../../context/beanStub';
import type { BeanCollection, BeanName } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _getRowNode } from '../../entities/positionUtils';
import type { RowNode } from '../../entities/rowNode';
import { _createGlobalRowEvent } from '../../entities/rowNodeUtils';
import type { AgEventType } from '../../eventTypes';
import type { CellFocusClearedEvent, CellFocusedEvent, CommonCellFocusParams } from '../../events';
import type { EditMap, EditValue, ReadonlyEditMap, ReadonlyEditRow } from '../../interfaces/iEditModelService';
import type {
    EditInputEvents,
    EditPosition,
    EditRowPosition,
    EditSource,
    StartEditWithPositionParams,
    _SetEditingCellsParams,
} from '../../interfaces/iEditService';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import { _createCellEvent } from '../../rendering/cell/cellEvent';
import type { EditModelService } from '../editModelService';
import type { EditService } from '../editService';
import { _getCellCtrl, _getRowCtrl } from '../utils/controllers';
import type { EditorValidationCache } from '../utils/editors';
import {
    UNEDITED,
    _destroyEditor,
    _destroyEditors,
    _purgeUnchangedEdits,
    _setupEditors,
    _syncFromEditors,
} from '../utils/editors';

export type EditValidationResult<T extends Required<EditPosition> = Required<EditPosition>> = {
    all: T[];
    pass: T[];
    fail: T[];
};

export type EditValidationAction<T extends Required<EditPosition> = Required<EditPosition>> = {
    destroy: T[];
    keep: T[];
};

export abstract class BaseEditStrategy extends BeanStub {
    beanName: BeanName | undefined;
    protected model: EditModelService;
    protected editSvc: EditService;

    public postConstruct(): void {
        this.model = this.beans.editModelSvc!;
        this.editSvc = this.beans.editSvc!;

        this.addManagedEventListeners({
            cellFocused: this.onCellFocusChanged?.bind(this),
            cellFocusCleared: this.onCellFocusChanged?.bind(this),
        });
    }

    public abstract midBatchInputsAllowed(position?: EditPosition): boolean;

    public clearEdits(position: EditPosition): void {
        this.model.clearEditValue(position);
    }

    public abstract start(params: StartEditWithPositionParams): void;

    public onCellFocusChanged(event: CellFocusedEvent | CellFocusClearedEvent): void {
        let cellCtrl: CellCtrl | undefined;
        const previous = (event as any)['previousParams']! as CommonCellFocusParams;
        const { editSvc, beans } = this;
        const sourceEvent = event.type === 'cellFocused' ? event.sourceEvent : null;

        if (previous) {
            cellCtrl = _getCellCtrl(beans, previous);
        }

        const { gos, editModelSvc } = beans;
        const isFocusCleared = event.type === 'cellFocusCleared';

        // check if any editors open
        if (editSvc.isEditing(undefined, { withOpenEditor: true })) {
            // if focus is clearing, we should stop editing
            // or cancel the editing if `block` and `hasErrors`
            const { column, rowIndex, rowPinned } = event;
            const cellPositionFromEvent = {
                column: column as AgColumn,
                rowNode: _getRowNode(beans, { rowIndex: rowIndex!, rowPinned })!,
            };
            const isBlock = gos.get('invalidEditValueMode') === 'block';

            if (isBlock) {
                // if we are blocking on invalid edits, focus changes don't stop current editing
                return;
            }

            const shouldRevert = !isBlock;
            const hasError = !!editModelSvc?.getCellValidationModel().hasCellValidation(cellPositionFromEvent);
            const shouldCancel = shouldRevert && hasError;

            // if we don't have a previous cell, we don't need to force stopEditing
            const result =
                previous || isFocusCleared
                    ? editSvc.stopEditing(undefined, {
                          cancel: shouldCancel,
                          source: isFocusCleared && shouldRevert ? 'api' : undefined,
                          event: sourceEvent as unknown as EditInputEvents,
                      })
                    : true;

            // editSvc didn't handle the stopEditing, we need to do more ourselves
            if (!result) {
                if (editSvc.isBatchEditing()) {
                    // close editors, but don't stop editing in batch mode
                    editSvc.cleanupEditors();
                } else {
                    // if not batch editing, then we stop editing the cell
                    editSvc.stopEditing(undefined, { source: 'api' });
                }
            }
        }

        cellCtrl?.refreshCell({ suppressFlash: true, force: true });
    }

    public abstract moveToNextEditingCell(
        previousCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source?: EditSource,
        preventNavigation?: boolean,
        validationCache?: EditorValidationCache
    ): boolean | null;

    public stopCancelled(forceCancel: boolean, validationCache?: EditorValidationCache): boolean {
        const preserveBatch = this.editSvc.isBatchEditing() && !forceCancel;
        for (const cell of this.model.getEditPositions()) {
            _destroyEditor(this.beans, cell, { cancel: true }, _getCellCtrl(this.beans, cell), validationCache);
            this.model.stop(cell, preserveBatch, true);
        }
        return true;
    }

    public stopCommitted(event: Event | null, commit: boolean, validationCache?: EditorValidationCache): boolean {
        const editingCells = this.model.getEditPositions();
        const results: EditValidationResult = { all: [], pass: [], fail: [] };
        for (const cell of editingCells) {
            results.all.push(cell);
            if ((this.model.getCellValidationModel().getCellValidation(cell)?.errorMessages?.length ?? 0) > 0) {
                results.fail.push(cell);
            } else {
                results.pass.push(cell);
            }
        }
        const actions = this.processValidationResults(results);
        const preserveBatch = this.editSvc.isBatchEditing() && !commit;

        for (const cell of actions.destroy) {
            _destroyEditor(this.beans, cell, { event }, _getCellCtrl(this.beans, cell), validationCache);
            this.model.stop(cell, preserveBatch, false);
        }

        for (const cell of actions.keep) {
            const cellCtrl = _getCellCtrl(this.beans, cell);
            if (!this.editSvc.cellEditingInvalidCommitBlocks() && cellCtrl) {
                this.editSvc.revertSingleCellEdit(cellCtrl);
            }
        }
        return true;
    }

    protected abstract processValidationResults(results: EditValidationResult): EditValidationAction;

    public cleanupEditors(
        { rowNode }: EditRowPosition = {},
        includeEditing?: boolean,
        validationCache?: EditorValidationCache
    ): void {
        _syncFromEditors(this.beans, { persist: false }, validationCache);

        const positions = this.model.getEditPositions();

        const discard: Required<EditPosition>[] = [];

        if (rowNode) {
            for (const pos of positions) {
                // if the rowNode is provided, we only keep positions that match it
                if (pos.rowNode !== rowNode) {
                    discard.push(pos);
                }
            }
        } else {
            for (const pos of positions) {
                // if no rowNode is provided, we keep all positions
                discard.push(pos);
            }
        }

        // clean up any dangling editors
        _destroyEditors(this.beans, discard, {}, validationCache);

        _purgeUnchangedEdits(this.beans, includeEditing);
    }

    public setFocusOutOnEditor(cellCtrl: CellCtrl): void {
        cellCtrl.comp?.getCellEditor()?.focusOut?.();
    }

    /** Pins focus to the cell the user must fix, so blocked navigation can't leak focus to another row. */
    public focusFirstInvalidCell(cell: CellCtrl, event?: KeyboardEvent): void {
        const target = findFirstInvalidCell(this.beans, this.model, cell.rowNode) ?? cell;

        // setFocusInOnEditor must run last, or forceBrowserFocus drags the caret back out of the editor.
        target.focusCell({ forceBrowserFocus: true, sourceEvent: event });
        if (target.isCellEditable()) {
            this.setFocusInOnEditor(target);
        }
    }

    public setFocusInOnEditor(cellCtrl: CellCtrl): void {
        const comp = cellCtrl.comp;
        const editor = comp?.getCellEditor();

        if (editor?.focusIn) {
            // if the editor is present, then we just focus it
            editor.focusIn();
        } else {
            // if the editor is not present, it means async cell editor (e.g. React)
            // and we are trying to set focus before the cell editor is present, so we
            // focus the cell instead

            const isFullRow = this.beans.gos.get('editType') === 'fullRow';
            cellCtrl.focusCell({ forceBrowserFocus: isFullRow });
            this.editSvc.focusEditorOnAttach(cellCtrl, false);
        }
    }

    public setupEditors(params: StartEditWithPositionParams & { cells: Required<EditPosition>[] }) {
        const { event, ignoreEventKey = false, startedEdit, position, cells = this.model.getEditPositions() } = params;

        const key = (event instanceof KeyboardEvent && !ignoreEventKey && event.key) || undefined;
        _setupEditors(this.beans, cells, position, key, event, startedEdit);
    }

    public dispatchCellEvent<T extends AgEventType>(
        position: Required<EditPosition>,
        event?: Event | null,
        type?: T,
        payload?: any
    ): void {
        const { beans } = this;
        const cellCtrl = _getCellCtrl(beans, position);

        // Without a controller (cell hidden / virtualised out) the event still has to fire, or an edit ending
        // off-screen leaves the started/stopped pair unbalanced. Resolved through the same read the editor
        // opened on, since the raw field carries no pending edit and no getter, formula or group value.
        const value = cellCtrl
            ? cellCtrl.value
            : beans.valueSvc.getDisplayValue(position.column as AgColumn, position.rowNode, 'edit', false);

        this.eventSvc.dispatchEvent({
            ..._createCellEvent(beans, event ?? null, type as T, position, value),
            ...payload,
        });
    }

    public dispatchRowEvent(
        position: Required<EditRowPosition>,
        type: 'rowEditingStarted' | 'rowEditingStopped' | 'rowValueChanged',
        silent?: boolean
    ): void {
        if (silent) {
            return;
        }

        const rowCtrl = _getRowCtrl(this.beans, position);
        // The row can outlive its controller (removed, or virtualised out), and a stopped event still
        // has to balance the started one, so fall back to building it from the node.
        this.eventSvc.dispatchEvent(
            rowCtrl ? rowCtrl.createRowEvent(type) : _createGlobalRowEvent(position.rowNode as RowNode, this.gos, type)
        );
    }

    /** Edits ended outside the stop pipeline (their rows were purged), so drop any per-row bookkeeping. */
    public abstract releaseRows(rowNodes: Set<IRowNode>): void;

    public shouldStop(
        _position?: EditPosition,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: EditSource = 'ui'
    ): boolean | null {
        const batch = this.editSvc.isBatchEditing();

        if (batch && source === 'api') {
            // we always defer to the API
            return true;
        }

        if (batch && (source === 'ui' || source === 'edit')) {
            // we always defer to the UI
            return false;
        }

        if (source === 'api') {
            return true;
        }

        if (event instanceof KeyboardEvent && !batch) {
            return event.key === KeyCode.ENTER;
        }

        return null;
    }

    public shouldCancel(
        _position?: EditPosition,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' | string = 'ui'
    ): boolean | null {
        const batch = this.editSvc.isBatchEditing();
        if (event instanceof KeyboardEvent && !batch) {
            const result = event.key === KeyCode.ESCAPE;
            if (result) {
                return true;
            }
        }

        if (batch && source === 'api') {
            // we always defer to the API
            return true;
        }

        if (source === 'api') {
            return true;
        }

        return false;
    }

    public setEditMap(edits: EditMap, params?: _SetEditingCellsParams): void {
        if (!params?.update) {
            this.editSvc.stopEditing(undefined, { cancel: true, source: 'api' });
        }

        // Identify incoming editing cells
        const cells: (EditValue & Required<EditPosition>)[] = [];
        edits.forEach((editRow, rowNode) => {
            editRow.forEach((cellData, column) => {
                if (cellData.state === 'editing') {
                    cells.push({ ...cellData, rowNode, column });
                }
            });
        });

        let newEdits: ReadonlyEditMap = edits;
        if (params?.update) {
            // Merge existing rows under the new ones (new rows win). setEditMap deep-copies, so the
            // read-only rows from the live map can be aliased here without mutating it.
            const merged = new Map<IRowNode, ReadonlyEditRow>(edits);
            this.model.getEditMap()?.forEach((row, rowNode) => {
                if (!merged.has(rowNode)) {
                    merged.set(rowNode, row);
                }
            });
            newEdits = merged;
        }

        this.model?.setEditMap(newEdits);

        if (cells.length > 0) {
            const position = cells.at(-1)!;
            const key = position.pendingValue === UNEDITED ? undefined : position.pendingValue;
            this.start({ position, event: new KeyboardEvent('keydown', { key }), source: 'api' });

            const cellCtrl = _getCellCtrl(this.beans, position);
            if (cellCtrl) {
                this.setFocusInOnEditor(cellCtrl);
            }
        }
    }

    public override destroy(): void {
        this.cleanupEditors();

        super.destroy();
    }
}

/**
 * The cell the user must fix: the row's first invalid cell in visible-column order, scrolled in when its
 * column is virtualised out. The scroll targets that one column, not every candidate a scan would reject.
 */
const findFirstInvalidCell = (
    beans: BeanCollection,
    model: EditModelService,
    rowNode: IRowNode
): CellCtrl | undefined => {
    const rowValidations = model.getCellValidationModel().getCellValidationMap().get(rowNode);
    if (!rowValidations) {
        return undefined;
    }

    const cols = beans.visibleCols.allCols;
    let column: AgColumn | undefined;
    for (let i = 0, len = cols.length; i < len; ++i) {
        const col = cols[i];
        if (rowValidations.has(col)) {
            column = col;
            break;
        }
    }
    if (!column) {
        return undefined;
    }

    const cellCtrl = _getCellCtrl(beans, { rowNode, column });
    if (cellCtrl) {
        return cellCtrl;
    }
    beans.navigation?.ensureColumnVisible(column);
    return _getCellCtrl(beans, { rowNode, column });
};
