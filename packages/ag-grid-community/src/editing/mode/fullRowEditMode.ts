import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { isEditing } from '../editingApi';
import { BaseEditMode } from './baseEditMode';

export class FullRowEditMode extends BaseEditMode {
    public setEditing(rowCtrl: RowCtrl): void {
        console.warn('FullRowEditMode: setEditing');
        const editing = isEditing(this.beans, rowCtrl);

        rowCtrl.forEachGui(undefined, (gui) => gui.rowComp.addOrRemoveCssClass('ag-row-editing', editing));

        const event = editing
            ? rowCtrl.createRowEvent('rowEditingStarted')
            : rowCtrl.createRowEvent('rowEditingStopped');

        this.eventSvc.dispatchEvent(event);
    }
}
