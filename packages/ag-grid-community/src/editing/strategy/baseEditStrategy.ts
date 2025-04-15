import { BeanStub } from '../../context/beanStub';
import type { CellFocusedEvent } from '../../events';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { GridEditingModel } from '../model/gridEditingModel';
import type { IEditStrategy } from './iEditStrategy';
import { _resolveCellController } from './utils';

export abstract class BaseEditStrategy extends BeanStub implements IEditStrategy {
    protected editModel: GridEditingModel;

    public abstract stopEditing?(rowCtrl?: RowCtrl, cellCtrl?: CellCtrl): boolean;
    public abstract cancelEditing?(rowCtrl?: RowCtrl, cellCtrl?: CellCtrl): boolean;
    protected abstract onCellFocusChanged?(event: CellFocusedEvent): void;
    public abstract moveToNextEditingCell(
        previousCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent
    ): boolean | null;

    constructor(...args: any[]) {
        super();
        this.editModel = args[0];
    }

    postConstruct(): void {
        this.addManagedListeners(this.beans.eventSvc, {
            cellFocused: this.onCellFocusChanged?.bind(this),
            cellFocusCleared: this.onCellFocusChanged?.bind(this),
        });
    }

    protected isEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        return this.editModel.isEditing(rowCtrl, cellCtrl) ?? false;
    }

    public stopAllEditing(): void {
        const editingCells = this.editModel.getEditingCellPositions();
        if (editingCells.length === 0) {
            return;
        }
        editingCells.forEach((cellPosition) => {
            const cellCtrl = _resolveCellController(this.beans, {
                rowIndex: cellPosition.rowIndex,
                column: cellPosition.column,
            });

            if (cellCtrl) {
                this.stopEditing?.(cellCtrl.rowCtrl, cellCtrl);
            }
        });
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
}
