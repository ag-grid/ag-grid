import { KeyCode } from '../../constants/keyCode';
import { BeanStub } from '../../context/beanStub';
import type { BeanName } from '../../context/context';
import type { ColDef } from '../../entities/colDef';
import type { CellFocusedEvent } from '../../events';
import type { DefaultProvidedCellEditorParams } from '../../interfaces/iCellEditor';
import type { Column } from '../../interfaces/iColumn';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { CellIdPositions, EditingModelService } from '../editingModelService';
import { _resolveCellController } from '../utils/controllers';
import { _destroyEditor, _destroyEditors, _setupEditors, _syncModelsFromEditors } from '../utils/editors';

export abstract class BaseEditStrategy extends BeanStub {
    beanName: BeanName | undefined;
    protected editModel: EditingModelService;

    public abstract startEditing(
        rowNode: IRowNode,
        column: Column,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null,
        source?: 'api' | 'ui'
    ): boolean;

    public abstract onCellFocusChanged(_event: CellFocusedEvent<any, any>): void;

    public abstract moveToNextEditingCell(
        previousCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent
    ): boolean | null;

    public abstract updateStyles(rowNode?: IRowNode | null, column?: Column | null, newState?: boolean): void;

    public stopEditing(): boolean {
        const editingCells = this.editModel.getPendingCellIds();
        editingCells.forEach((cellPosition) => {
            this.editModel.stopEditing(cellPosition.rowNode, cellPosition.column);
            _destroyEditor(this.beans, cellPosition);
        });

        return true;
    }

    postConstruct(): void {
        this.editModel = this.beans.editingModelSvc!;
        this.addManagedListeners(this.beans.eventSvc, {
            cellFocused: this.onCellFocusChanged?.bind(this),
            cellFocusCleared: this.onCellFocusChanged?.bind(this),
        });
    }

    public cleanupEditors() {
        _syncModelsFromEditors(this.beans);
        // clean up any dangling editors
        _destroyEditors(this.beans, this.editModel.getPendingCellIds());
    }

    public stopAllEditing(): void {
        _syncModelsFromEditors(this.beans);
        this.stopEditing();
    }

    setFocusOutOnEditor(cellCtrl: CellCtrl): void {
        cellCtrl.comp.getCellEditor()?.focusOut?.();
    }

    setFocusInOnEditor(cellCtrl: CellCtrl): void {
        const cellComp = cellCtrl.comp;
        const cellEditor = cellComp.getCellEditor();

        if (cellEditor?.focusIn) {
            // if the editor is present, then we just focus it
            cellEditor.focusIn();
        } else {
            // if the editor is not present, it means async cell editor (e.g. React)
            // and we are trying to set focus before the cell editor is present, so we
            // focus the cell instead
            cellCtrl.focusCell(true);
            cellCtrl.onEditorAttachedFuncs.push(() => cellComp.getCellEditor()?.focusIn?.());
        }
    }

    // move to main editingsvc
    protected finishStartEdit(
        editingCells: CellIdPositions[],
        rowNode?: IRowNode | null,
        column?: Column | null,
        key?: string,
        cellStartedEdit?: boolean,
        event?: Event | null
    ) {
        const compDetails = _setupEditors(this.beans, editingCells, rowNode, column, key, cellStartedEdit);
        const suppressPreventDefault = !(compDetails?.params as DefaultProvidedCellEditorParams)
            ?.suppressPreventDefault;

        editingCells.forEach((cellPosition) => {
            const cellCtrl = _resolveCellController(this.beans, cellPosition);
            this.eventSvc.dispatchEvent(cellCtrl!.createEvent(event ?? null, 'cellEditingStarted'));
        });

        if (!suppressPreventDefault) {
            event?.preventDefault();
        }

        return suppressPreventDefault;
    }

    shouldStartEditing(
        _rowNode?: IRowNode | null,
        column?: Column | null,
        _key?: string | null,
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

    shouldStopEditing(
        _rowNode?: IRowNode | null,
        _column?: Column | null,
        _key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        const batchEdit = this.gos.get('batchEdit');

        if (batchEdit && source === 'api') {
            // we always defer to the API
            return true;
        } else if (batchEdit && source === 'ui') {
            // we always defer to the UI
            return false;
        } else if (source === 'api') {
            return true;
        }

        if (event instanceof KeyboardEvent && !batchEdit) {
            return event.key === KeyCode.ENTER;
        }

        return null;
    }

    shouldCancelEditing(
        _rowNode?: IRowNode | null,
        _column?: Column | null,
        _key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        const batchEdit = this.gos.get('batchEdit');
        if (event instanceof KeyboardEvent && !batchEdit) {
            return event.key === KeyCode.ESCAPE;
        }

        if (batchEdit && source === 'api') {
            // we always defer to the API
            return true;
        }

        if (source === 'api') {
            return true;
        }

        return false;
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
        this.editModel.getPendingCellIds().forEach((cellId) => {
            this.updateStyles(cellId.rowNode, cellId.column, false);
        });

        this.cleanupEditors();

        super.destroy();
    }
}
