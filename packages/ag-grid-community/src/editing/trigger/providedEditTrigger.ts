import type { ColDef } from '../../entities/colDef';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { BaseEditTrigger } from './baseEditTrigger';

export class ProvidedEditTrigger extends BaseEditTrigger {
    beanName = 'providedEditTrigger' as const;

    override shouldStartEditing(
        rowCtrl?: RowCtrl,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean {
        if (event instanceof KeyboardEvent) {
            return event.key === 'Enter';
        }

        const extendingRange = event?.shiftKey && this.beans.rangeSvc?.getCellRanges().length != 0;
        if (extendingRange) {
            return false;
        }

        const colDef = cellCtrl?.column?.colDef;
        const clickCount = this.deriveClickCount(colDef);
        const type = event?.type;

        if (type === 'click' && event?.detail === 1 && clickCount === 1) {
            return true;
        } else if (type === 'dblclick' && event?.detail === 2 && clickCount === 2) {
            return true;
        }

        return false;
    }

    private deriveClickCount(colDef?: ColDef): number {
        const { gos } = this;

        if (gos.get('suppressClickEdit') === true) {
            return 0;
        } else if (gos.get('singleClickEdit') === true) {
            return 1;
        } else if (colDef?.singleClickEdit) {
            return 1;
        }

        const params = gos.get('experimentalEditingModeV2')?.params;

        return params?.clickCount ?? 2;
    }

    override shouldStopEditing(
        rowCtrl?: RowCtrl | undefined,
        cellCtrl?: CellCtrl | undefined,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined
    ): boolean {
        if (this.beans.editingModelSvc?.isEditing(rowCtrl, cellCtrl)) {
            return true;
        }

        if (event instanceof KeyboardEvent) {
            return event.key === 'Enter';
        }

        return false;
    }
}
