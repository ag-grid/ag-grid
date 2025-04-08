import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { RowEditingStartedEvent, RowEditingStoppedEvent } from '../events';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import { GridEditingModel } from './model/gridEditingModel';

export class RowEditingService extends BeanStub implements NamedBean {
    beanName = 'rowEditingSvc' as const;
    public editingModel: GridEditingModel;

    public override preWireBeans(beans: BeanCollection): void {
        super.preWireBeans(beans);
        this.editingModel = new GridEditingModel(beans);
    }

    public isEditing(rowId?: string, colId?: string): boolean {
        return this.editingModel?.isEditing(rowId, colId) ?? false;
    }

    /** @return whether to prevent default on event */
    public startEditing(
        rowCtrl: RowCtrl,
        key: string | null = null,
        sourceRenderedCell: CellCtrl | null = null,
        event: KeyboardEvent | null = null
    ): boolean {
        console.warn('RowEditingService: startEditing');
        // don't do it if already editing
        if (rowCtrl.editing) {
            return false;
        }

        const { editSvc } = this.beans;
        let preventDefault = true;

        if (sourceRenderedCell) {
            preventDefault = editSvc?.startEditing(sourceRenderedCell, key, true, event) ?? false;
        } else {
            // start editing all cells in the row
            rowCtrl.getAllCellCtrls().forEach((cellCtrl: CellCtrl) => {
                editSvc?.startEditing(cellCtrl, null, false, event);
            });
        }

        this.setEditing(rowCtrl);

        return preventDefault;
    }

    public setEditing(rowCtrl: RowCtrl): void {
        console.warn('RowEditingService: setEditing');
        const value = rowCtrl.editing;
        rowCtrl.forEachGui(undefined, (gui) => gui.rowComp.addOrRemoveCssClass('ag-row-editing', value));

        const event: RowEditingStartedEvent | RowEditingStoppedEvent = value
            ? rowCtrl.createRowEvent('rowEditingStarted')
            : rowCtrl.createRowEvent('rowEditingStopped');

        this.eventSvc.dispatchEvent(event);
    }
}
