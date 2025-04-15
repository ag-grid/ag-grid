import type { Bean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { EditingStateUpdates } from '../../editing-model/editingModelService';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import type { CellFocusedEvent } from '../../events';
import type { Column } from '../../interfaces/iColumn';
import type { CellCtrl, ICellComp } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';

export interface IEditStrategy extends Bean {
    startEditing?(
        rowCtrl: RowCtrl,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean;

    stopEditing?(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl): boolean;

    cancelEditing?(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl): boolean;

    isEditing?(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean;

    moveToNextEditingCell(previousCell: CellCtrl, backwards: boolean, event?: KeyboardEvent): boolean | null;

    updateStyles(editingStatusUpdate: EditingStateUpdates): void;
}

export abstract class BaseEditMode extends BeanStub implements IEditStrategy {
    postConstruct(): void {
        this.addManagedListeners(this.beans.eventSvc, {
            cellFocused: this.onCellFocusChanged?.bind(this),
            cellFocusCleared: this.onCellFocusChanged?.bind(this),
        });
    }

    public abstract stopEditing?(rowCtrl?: RowCtrl, cellCtrl?: CellCtrl): boolean;
    public abstract cancelEditing?(rowCtrl?: RowCtrl, cellCtrl?: CellCtrl): boolean;
    protected abstract onCellFocusChanged?(event: CellFocusedEvent): void;
    public abstract moveToNextEditingCell(
        previousCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent
    ): boolean | null;

    public isEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        return this.beans.editingModelSvc?.isEditing(rowCtrl, cellCtrl) ?? false;
    }

    setFocusOutOnEditor(cellCtrl: CellCtrl): void {
        if (!this.isEditing(cellCtrl.rowCtrl, cellCtrl)) {
            return;
        }
        const cellEditor = cellCtrl.comp.getCellEditor();

        if (cellEditor && cellEditor.focusOut) {
            cellEditor.focusOut();
        }
    }

    setFocusInOnEditor(cellCtrl: CellCtrl): void {
        if (!this.isEditing(cellCtrl.rowCtrl, cellCtrl)) {
            return;
        }
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

    public updateRowStyle(rowCtrl?: RowCtrl, editing: boolean = false): void {
        rowCtrl?.setInlineEditingCss(editing);
    }

    public updateCellStyle(cellCtrl?: CellCtrl, editing: boolean = false): void {
        cellCtrl?.setInlineEditingCss(editing);
    }

    public updateStyles(editingStatusUpdate?: EditingStateUpdates): void {
        if (!editingStatusUpdate) {
            return;
        }
        Object.keys(editingStatusUpdate).forEach((rowId) => {
            const rowCtrl = _resolveRowController(this.beans, { rowId });
            const rowUpdate = editingStatusUpdate[rowId];
            this.updateRowStyle(rowCtrl, rowUpdate.status);

            Object.keys(rowUpdate.cells).forEach((columnId) => {
                const cellCtrl = _resolveCellController(this.beans, { rowCtrl, colId: columnId });
                const editing = rowUpdate.cells[columnId];
                this.updateCellStyle(cellCtrl, editing);
            });
        });
    }
}

type ResolveRowControllerType = {
    rowIndex?: number | null;
    rowId?: string;
    rowCtrl?: RowCtrl | null;
};

type ResolveCellControllerType = {
    colId?: string;
    column?: string | Column | null;
};

type ResolveControllerType = ResolveRowControllerType & ResolveCellControllerType;

type ResolvedControllersType = {
    rowCtrl?: RowCtrl;
    cellCtrl?: CellCtrl;
};

export function _resolveRowController(beans: BeanCollection, inputs: ResolveRowControllerType): RowCtrl | undefined {
    const { rowIndex, rowId, rowCtrl } = inputs;

    if (rowCtrl) {
        return rowCtrl;
    }

    const { rowModel, rowRenderer } = beans;

    const rowNode = rowId ? rowModel.getRowNode(rowId) : rowModel.getRow(rowIndex!); // TODO: what about pinned rows??

    if (!rowNode) {
        return undefined;
    }

    return rowRenderer.getRowCtrls([rowNode])?.[0];
}

export function _resolveCellController(beans: BeanCollection, inputs: ResolveControllerType): CellCtrl | undefined {
    const { colId, column, rowIndex, rowId } = inputs;
    let { rowCtrl } = inputs;
    const { rowRenderer, colModel } = beans;

    const agColumn = colId
        ? colModel.getCol(colId)
        : colModel.getCol(typeof column === 'string' ? column : column?.getColId());

    rowCtrl ??= rowIndex || rowId ? _resolveRowController(beans, inputs) : rowRenderer.getRowCtrls()?.[0];
    return rowCtrl?.getCellCtrl(agColumn!) ?? undefined;
}

export function _resolveControllers(beans: BeanCollection, inputs: ResolveControllerType): ResolvedControllersType {
    const rowCtrl = _resolveRowController(beans, inputs);
    const cellCtrl = _resolveCellController(beans, inputs);

    return {
        rowCtrl,
        cellCtrl,
    };
}

export function _takeValueFromCellEditor(
    cancel: boolean,
    cellComp: ICellComp
): { newValue?: any; newValueExists: boolean } {
    const noValueResult = { newValueExists: false };

    if (cancel) {
        return noValueResult;
    }

    const cellEditor = cellComp.getCellEditor();

    if (!cellEditor) {
        return noValueResult;
    }

    const userWantsToCancel = cellEditor.isCancelAfterEnd && cellEditor.isCancelAfterEnd();

    if (userWantsToCancel) {
        return noValueResult;
    }

    const newValue = cellEditor.getValue();

    return {
        newValue: newValue,
        newValueExists: true,
    };
}

/**
 * @returns `True` if the value changes, otherwise `False`.
 */
export function _saveNewValue(
    cellCtrl: CellCtrl,
    oldValue: any,
    newValue: any,
    rowNode: RowNode,
    column: AgColumn
): boolean {
    if (newValue === oldValue) {
        return false;
    }

    // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
    // getting triggered, which results in all cells getting refreshed. we do not want this refresh
    // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
    // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
    cellCtrl.suppressRefreshCell = true;
    const valueChanged = rowNode.setDataValue(column, newValue, 'edit');
    cellCtrl.suppressRefreshCell = false;

    return valueChanged;
}
