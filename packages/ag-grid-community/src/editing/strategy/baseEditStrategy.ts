import { BeanStub } from '../../context/beanStub';
import type { CellFocusedEvent } from '../../events';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { EditingStateUpdates } from './iEditStrategy';
import type { IEditStrategy } from './iEditStrategy';
import { _resolveCellController, _resolveRowController } from './utils';

export abstract class BaseEditStrategy extends BeanStub implements IEditStrategy {
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
        return this.beans.editingSvc?.editModel?.isEditing(rowCtrl, cellCtrl) ?? false;
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
