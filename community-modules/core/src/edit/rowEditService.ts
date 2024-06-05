import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { Events } from '../eventKeys';
import type { RowEditingStartedEvent, RowEditingStoppedEvent, RowEvent, RowValueChangedEvent } from '../events';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';

export class RowEditService extends BeanStub implements NamedBean {
    beanName = 'rowEditService' as const;

    public startEditing(
        rowCtrl: RowCtrl,
        key: string | null = null,
        sourceRenderedCell: CellCtrl | null = null,
        event: KeyboardEvent | null = null
    ): void {
        const atLeastOneEditing = rowCtrl.getAllCellCtrls().reduce((prev: boolean, cellCtrl: CellCtrl) => {
            const cellStartedEdit = cellCtrl === sourceRenderedCell;
            if (cellStartedEdit) {
                cellCtrl.startEditing(key, cellStartedEdit, event);
            } else {
                cellCtrl.startEditing(null, cellStartedEdit, event);
            }
            if (prev) {
                return true;
            }

            return cellCtrl.isEditing();
        }, false);

        if (atLeastOneEditing) {
            this.setEditing(rowCtrl, true);
        }
    }

    public stopEditing(rowCtrl: RowCtrl, cancel = false): void {
        const cellControls = rowCtrl.getAllCellCtrls();
        const isRowEdit = rowCtrl.isEditing();

        rowCtrl.setStoppingRowEdit(true);

        let fireRowEditEvent = false;
        for (const ctrl of cellControls) {
            const valueChanged = ctrl.stopEditing(cancel);
            if (isRowEdit && !cancel && !fireRowEditEvent && valueChanged) {
                fireRowEditEvent = true;
            }
        }

        if (fireRowEditEvent) {
            const event: RowValueChangedEvent = rowCtrl.createRowEvent(Events.EVENT_ROW_VALUE_CHANGED);
            this.eventService.dispatchEvent(event);
        }

        if (isRowEdit) {
            this.setEditing(rowCtrl, false);
        }

        rowCtrl.setStoppingRowEdit(false);
    }

    private setEditing(rowCtrl: RowCtrl, value: boolean): void {
        rowCtrl.setEditingRow(value);
        rowCtrl.forEachGui(undefined, (gui) => gui.rowComp.addOrRemoveCssClass('ag-row-editing', value));

        const event: RowEvent = value
            ? (rowCtrl.createRowEvent(Events.EVENT_ROW_EDITING_STARTED) as RowEditingStartedEvent)
            : (rowCtrl.createRowEvent(Events.EVENT_ROW_EDITING_STOPPED) as RowEditingStoppedEvent);

        this.eventService.dispatchEvent(event);
    }
}
