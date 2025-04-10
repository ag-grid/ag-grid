import type { RowEditingStartedEvent, RowEditingStoppedEvent } from '../../events';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { BaseEditMode } from './baseEditMode';

export class FullRowEditMode extends BaseEditMode {
    public setEditing(rowCtrl: RowCtrl): void {
        console.warn('FullRowEditMode: setEditing');
        const value = rowCtrl.editing;
        rowCtrl.forEachGui(undefined, (gui) => gui.rowComp.addOrRemoveCssClass('ag-row-editing', value));

        const event: RowEditingStartedEvent | RowEditingStoppedEvent = value
            ? rowCtrl.createRowEvent('rowEditingStarted')
            : rowCtrl.createRowEvent('rowEditingStopped');

        this.eventSvc.dispatchEvent(event);
    }
}
