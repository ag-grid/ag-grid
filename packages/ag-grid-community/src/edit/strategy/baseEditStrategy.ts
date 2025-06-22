import { KeyCode } from '../../constants/keyCode';
import { BeanStub } from '../../context/beanStub';
import type { BeanName } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { ColDef } from '../../entities/colDef';
import type { AgEventType } from '../../eventTypes';
import type { CellFocusedEvent, CommonCellFocusParams } from '../../events';
import type { EditMap, EditValue, IEditModelService } from '../../interfaces/iEditModelService';
import type { EditPosition, EditRowPosition, EditSource, IEditService } from '../../interfaces/iEditService';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import { _getCellCtrl, _getRowCtrl } from '../utils/controllers';
import {
    UNEDITED,
    _destroyEditor,
    _destroyEditors,
    _populateModelValidationErrors,
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
    protected model: IEditModelService;
    protected editSvc: IEditService;

    public postConstruct(): void {
        this.model = this.beans.editModelSvc!;
        this.editSvc = this.beans.editSvc!;

        this.addManagedListeners(this.beans.eventSvc, {
            cellFocused: this.onCellFocusChanged?.bind(this),
            cellFocusCleared: this.onCellFocusChanged?.bind(this),
        });
    }

    public abstract midBatchInputsAllowed(position?: EditPosition): boolean;

    public clearEdits(position: EditPosition): void {
        this.model.clearEditValue(position);
    }

    public abstract start(
        position: Required<EditPosition>,
        event?: KeyboardEvent | MouseEvent | null,
        source?: EditSource,
        ignoreEventKey?: boolean
    ): void;

    public onCellFocusChanged(event: CellFocusedEvent<any, any>): void {
        let cellCtrl: CellCtrl | undefined;
        const previous = (event as any)['previousParams']! as CommonCellFocusParams;
        if (previous) {
            cellCtrl = _getCellCtrl(this.beans, previous);
        }

        _populateModelValidationErrors(this.beans, true);

        // check if any editors open
        if (this.editSvc.isEditing(undefined, { withOpenEditor: true })) {
            if (cellCtrl && this.editSvc.checkNavWithValidation(cellCtrl, event) === 'block-stop') {
                return;
            }

            const result = this.editSvc.stopEditing();

            // editSvc didn't handle the stopEditing, we need to do more ourselves
            if (!result) {
                if (this.editSvc.isBatchEditing()) {
                    // close editors, but don't stop editing in batch mode
                    this.editSvc.cleanupEditors();
                } else {
                    // if not batch editing, then we stop editing the cell
                    this.editSvc.stopEditing(undefined, { source: 'api' });
                }
            }
        }

        cellCtrl?.refreshCell({ suppressFlash: true, force: true });
    }

    public abstract moveToNextEditingCell(
        previousCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source?: EditSource
    ): boolean | null;

    public isCellEditable({ rowNode, column }: Required<EditPosition>, _source: 'api' | 'ui' = 'ui'): boolean {
        return (column as AgColumn).isColumnFunc(rowNode, column.getColDef().editable);
    }

    public stop(cancel?: boolean): boolean {
        const editingCells = this.model.getEditPositions();

        const results: EditValidationResult = { all: [], pass: [], fail: [] };

        editingCells.forEach((cell) => {
            results.all.push(cell);

            const validation = this.model.getCellValidationModel().getCellValidation(cell);
            // check if the cell is valid

            if (validation?.errorMessages?.length ?? 0 > 0) {
                results.fail.push(cell);
                return;
            }

            results.pass.push(cell);
        });

        if (cancel) {
            editingCells.forEach((cell) => {
                _destroyEditor(this.beans, cell);
                this.model.stop(cell);
            });
            return true;
        }

        const actions = this.processValidationResults(results);

        if (actions.destroy.length > 0) {
            actions.destroy.forEach((cell) => {
                _destroyEditor(this.beans, cell);
                this.model.stop(cell);
            });
        }

        if (actions.keep.length > 0) {
            actions.keep.forEach((cell) => {
                const cellCtrl = _getCellCtrl(this.beans, cell);

                if (!this.editSvc?.cellEditingInvalidCommitBlocks()) {
                    cellCtrl && this.editSvc.revertSingleCellEdit(cellCtrl);
                }
            });
        }

        return true;
    }

    protected abstract processValidationResults(results: EditValidationResult): EditValidationAction;

    public cleanupEditors({ rowNode }: EditRowPosition = {}, includeEditing?: boolean): void {
        _syncFromEditors(this.beans);

        const positions = this.model.getEditPositions();

        const discard: Required<EditPosition>[] = [];

        if (rowNode) {
            positions.forEach((pos) => {
                // if the rowNode is provided, we only keep positions that match it
                if (!(!rowNode || pos.rowNode === rowNode)) {
                    discard.push(pos);
                }
            });
        } else {
            positions.forEach((pos) => {
                // if no rowNode is provided, we keep all positions
                discard.push(pos);
            });
        }

        // clean up any dangling editors
        _destroyEditors(this.beans, discard);

        _purgeUnchangedEdits(this.beans, includeEditing);
    }

    public stopAllEditing(): void {
        _syncFromEditors(this.beans);
        this.stop();
    }

    public setFocusOutOnEditor(cellCtrl: CellCtrl): void {
        cellCtrl.comp?.getCellEditor()?.focusOut?.();
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
            cellCtrl.focusCell(true);
            cellCtrl.onEditorAttachedFuncs.push(() => comp?.getCellEditor()?.focusIn?.());
        }
    }

    public setupEditors(
        cells: Required<EditPosition>[] = this.model.getEditPositions(),
        position: Required<EditPosition>,
        cellStartedEdit?: boolean,
        event?: Event | null,
        ignoreEventKey: boolean = false
    ) {
        const key = (event instanceof KeyboardEvent && !ignoreEventKey && event.key) || undefined;
        _setupEditors(this.beans, cells, position, key, event, cellStartedEdit);
    }

    public dispatchCellEvent<T extends AgEventType>(
        position: Required<EditPosition>,
        event?: Event | null,
        type?: T,
        payload?: any
    ): void {
        const cellCtrl = _getCellCtrl(this.beans, position);

        if (cellCtrl) {
            this.eventSvc.dispatchEvent({ ...(cellCtrl.createEvent(event ?? null, type as T) as any), ...payload });
        }
    }

    public dispatchRowEvent(
        position: Required<EditRowPosition>,
        type: 'rowEditingStarted' | 'rowEditingStopped' | 'rowValueChanged'
    ): void {
        const rowCtrl = _getRowCtrl(this.beans, position)!;

        if (rowCtrl) {
            this.eventSvc.dispatchEvent(rowCtrl.createRowEvent(type));
        }
    }

    public shouldStart(
        { column }: Required<EditPosition>,
        event?: KeyboardEvent | MouseEvent | null,
        cellStartedEdit?: boolean | null,
        source: EditSource = 'ui'
    ): boolean | null {
        const isTab = event instanceof KeyboardEvent && event.key === KeyCode.TAB;

        if (isTab) {
            return true;
        }

        if (event instanceof KeyboardEvent && (event.key === KeyCode.ENTER || event.key === KeyCode.F2)) {
            return true;
        }

        const extendingRange = event?.shiftKey && !isTab && this.beans.rangeSvc?.getCellRanges().length != 0;
        if (extendingRange) {
            return false;
        }

        const colDef = column?.getColDef();
        const clickCount = this.deriveClickCount(colDef);
        const type = event?.type;

        if (type === 'click' && event?.detail === 1 && clickCount === 1) {
            return true;
        }

        if (type === 'dblclick' && event?.detail === 2 && clickCount === 2) {
            return true;
        }

        if (source === 'api') {
            return cellStartedEdit ?? false;
        }

        return false;
    }

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

        if (batch && source === 'ui') {
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

    public setEditMap(edits: EditMap): void {
        this.editSvc.stopEditing(undefined, { cancel: true, source: 'api' });

        this.model?.setEditMap(edits);

        // now update cell values and fire cell events
        const cells: (EditValue & Required<EditPosition>)[] = [];
        edits.forEach((editRow, rowNode) => {
            editRow.forEach((cellData, column) => {
                if (cellData.state === 'editing') {
                    cells.push({ ...cellData, rowNode, column });
                }
            });
        });

        if (cells.length > 0) {
            const cell = cells.at(-1)!;
            const key = cell.newValue === UNEDITED ? undefined : cell.newValue;
            this.editSvc.startEditing(cell, {
                event: new KeyboardEvent('keydown', { key }),
                startedEdit: true,
                source: 'api',
            });
        }
    }

    private deriveClickCount(colDef?: ColDef): number {
        const { gos } = this.beans;

        if (gos.get('suppressClickEdit') === true) {
            return 0;
        }

        if (gos.get('singleClickEdit') === true) {
            return 1;
        }

        if (colDef?.singleClickEdit) {
            return 1;
        }

        return 2;
    }

    public override destroy(): void {
        this.cleanupEditors();

        super.destroy();
    }
}
