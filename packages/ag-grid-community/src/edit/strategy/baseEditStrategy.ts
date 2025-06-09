import { KeyCode } from '../../constants/keyCode';
import { BeanStub } from '../../context/beanStub';
import type { BeanName } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { ColDef } from '../../entities/colDef';
import type { AgEventType } from '../../eventTypes';
import type { CellFocusedEvent } from '../../events';
import type { DefaultProvidedCellEditorParams } from '../../interfaces/iCellEditor';
import type { Column } from '../../interfaces/iColumn';
import type { EditMap, EditValue, IEditModelService } from '../../interfaces/iEditModelService';
import type { EditPosition, EditRowPosition, IEditService } from '../../interfaces/iEditService';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { _getCellCtrl, _getRowCtrl, _getSiblingRows } from '../utils/controllers';
import {
    _destroyEditor,
    _destroyEditors,
    _purgeUnchangedEdits,
    _setupEditors,
    _syncFromEditors,
    _valuesDiffer,
} from '../utils/editors';

export abstract class BaseEditStrategy extends BeanStub {
    public abstract midBatchInputsAllowed(position?: EditPosition): boolean;

    public clearEdits(position: EditPosition): void {
        this.model.clearEditValue(position);
    }

    beanName: BeanName | undefined;
    protected model: IEditModelService;
    protected editSvc: IEditService;

    public abstract start(
        position: Required<EditPosition>,
        event?: KeyboardEvent | MouseEvent | null,
        source?: 'api' | 'ui',
        silent?: boolean,
        ignoreEventKey?: boolean
    ): void;

    postConstruct(): void {
        this.model = this.beans.editModelSvc!;
        this.editSvc = this.beans.editSvc!;

        this.addManagedListeners(this.beans.eventSvc, {
            cellFocused: this.onCellFocusChanged?.bind(this),
            cellFocusCleared: this.onCellFocusChanged?.bind(this),
        });
    }

    public onCellFocusChanged(_event: CellFocusedEvent<any, any>): void {
        // check if any editors open
        if (this.editSvc.isEditing(undefined, { withOpenEditor: true })) {
            const result = this.editSvc.stopEditing();

            // editSvc didn't handle the stopEditing, we need to do more ourselves
            if (!result) {
                if (this.editSvc.batch) {
                    // close editors, but don't stop editing in batch mode
                    this.editSvc.cleanupEditors();
                } else {
                    // if not batch editing, then we stop editing the cell
                    this.editSvc.stopEditing(undefined, { source: 'api' });
                }
            }
        }
    }

    public abstract moveToNextEditingCell(
        previousCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source?: 'api' | 'ui'
    ): boolean | null;

    public isCellEditable({ rowNode, column }: Required<EditPosition>, _source: 'api' | 'ui' = 'ui'): boolean {
        return (column as AgColumn).isColumnFunc(rowNode, column.getColDef().editable);
    }

    public updateCells(
        edits: EditMap = this.model.getEditMap(),
        forcedState?: boolean,
        suppressFlash: boolean = true,
        includeParents: boolean = false
    ): void {
        const batch = this.editSvc.batch;
        const forced = forcedState !== undefined;

        const changedColumns: Set<string> = new Set();

        edits?.forEach((editRow, mainNode) => {
            let rowEdited = false;

            const rowCtrl = _getRowCtrl(this.beans, {
                rowNode: mainNode,
            });

            editRow.forEach((cellData, column) => {
                const newState = forced ? forcedState : _valuesDiffer(cellData);

                rowEdited ||= newState;

                const cellCtrl = _getCellCtrl(this.beans, {
                    rowCtrl,
                    column,
                });

                this.updateCellStyle(cellCtrl, newState, batch, suppressFlash);
                if (newState) {
                    changedColumns.add(column.getColId());
                }
            });

            this.updateRowStyle(rowCtrl, rowEdited, batch);

            if (!batch || !includeParents) {
                return;
            }

            // check if any sibling rows have edits on other columns
            mainNode?.parent?.allLeafChildren?.forEach((child) => {
                const pending = this.model.getEditSiblingRow({ rowNode: child });
                if (pending) {
                    this.model.getEditRow({ rowNode: pending })?.forEach((cellData, column) => {
                        const newState = forced
                            ? forcedState
                            : cellData.newValue !== undefined && _valuesDiffer(cellData);
                        if (newState) {
                            changedColumns.add(column.getColId());
                        }
                    });
                }
            });

            // update parent nodes
            _getSiblingRows(this.beans, mainNode, false, includeParents).forEach((rowNode) => {
                const rowCtrl = _getRowCtrl(this.beans, {
                    rowNode,
                });

                editRow.forEach((_, column) =>
                    this.updateCellStyle(
                        _getCellCtrl(this.beans, {
                            rowCtrl,
                            column,
                        }),
                        changedColumns.has(column.getColId()),
                        batch,
                        suppressFlash
                    )
                );

                this.updateRowStyle(rowCtrl, rowEdited, batch);
            });
        });
    }

    protected updateCellStyle(
        cellCtrl?: CellCtrl | null,
        newState?: boolean,
        batch?: boolean,
        suppressFlash?: boolean
    ): void {
        cellCtrl?.comp?.toggleCss('ag-cell-batch-edit', (newState && batch) ?? false);

        // force refresh if the cell also uses a renderer for edits
        cellCtrl?.refreshCell({
            suppressFlash,
            forceRefresh: true,
        });
    }

    protected updateRowStyle(_rowCtrl?: RowCtrl | null, _newState?: boolean, _batchEdit?: boolean): void {
        // NOP
    }

    public stop(): boolean {
        const editingCells = this.model.getEditPositions();
        editingCells.forEach((cell) => {
            this.model.stop(cell);
            _destroyEditor(this.beans, cell);
        });

        return true;
    }

    public cleanupEditors() {
        _syncFromEditors(this.beans);
        // clean up any dangling editors
        _destroyEditors(this.beans, this.model.getEditPositions());

        this.updateCells();

        _purgeUnchangedEdits(this.beans);
    }

    public stopAllEditing(): void {
        _syncFromEditors(this.beans);
        this.stop();
    }

    setFocusOutOnEditor(cellCtrl: CellCtrl): void {
        cellCtrl.comp?.getCellEditor()?.focusOut?.();
    }

    setFocusInOnEditor(cellCtrl: CellCtrl): void {
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
        const compDetails = _setupEditors(this.beans, cells, position, key, cellStartedEdit);
        const suppressPreventDefault = !(compDetails?.params as DefaultProvidedCellEditorParams)
            ?.suppressPreventDefault;

        if (!suppressPreventDefault) {
            event?.preventDefault();
        }
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
        type: 'rowEditingStarted' | 'rowEditingStopped'
    ): void {
        const rowCtrl = _getRowCtrl(this.beans, position)!;

        if (rowCtrl) {
            this.eventSvc.dispatchEvent(rowCtrl.createRowEvent(type));
        }
    }

    shouldStart(
        { column }: Required<EditPosition>,
        event?: KeyboardEvent | MouseEvent | null,
        cellStartedEdit?: boolean | null,
        source: 'api' | 'ui' = 'ui'
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
        } else if (type === 'dblclick' && event?.detail === 2 && clickCount === 2) {
            return true;
        }

        if (source === 'api') {
            return cellStartedEdit ?? false;
        }

        return false;
    }

    shouldStop(
        _position?: EditPosition,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        const batch = this.editSvc.batch;

        if (batch && source === 'api') {
            // we always defer to the API
            return true;
        } else if (batch && source === 'ui') {
            // we always defer to the UI
            return false;
        } else if (source === 'api') {
            return true;
        }

        if (event instanceof KeyboardEvent && !batch) {
            return event.key === KeyCode.ENTER;
        }

        return null;
    }

    shouldCancel(
        _position?: EditPosition,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        const batch = this.editSvc.batch;
        if (event instanceof KeyboardEvent && !batch) {
            return event.key === KeyCode.ESCAPE;
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

        // primary loop to preserve event semantics
        edits.forEach((_, rowNode) => {
            this.dispatchRowEvent({ rowNode }, 'rowEditingStarted');
        });

        // now update cell values and fire cell events
        const cells: (EditValue & { rowNode: IRowNode; column: Column })[] = [];
        edits.forEach((editRow, rowNode) => {
            editRow.forEach((cellData, column) => {
                const position = { rowNode, column };
                this.model.setEdit(position, cellData);
                this.dispatchCellEvent(position, undefined, 'cellEditingStarted');
                if (cellData.state === 'editing') {
                    cells.push({ ...cellData, rowNode, column });
                }
            });
        });

        this.updateCells();

        if (cells.length > 0) {
            const cell = cells.at(-1)!;
            this.editSvc.startEditing(cell, {
                event: new KeyboardEvent('keydown', { key: cell.newValue }),
                startedEdit: true,
                source: 'api',
                silent: true,
            });
        }
    }

    private deriveClickCount(colDef?: ColDef): number {
        const { gos } = this.beans;

        if (gos.get('suppressClickEdit') === true) {
            return 0;
        } else if (gos.get('singleClickEdit') === true) {
            return 1;
        } else if (colDef?.singleClickEdit) {
            return 1;
        }

        return 2;
    }

    public override destroy(): void {
        this.updateCells(this.model.getEditMap());

        this.cleanupEditors();

        super.destroy();
    }
}
