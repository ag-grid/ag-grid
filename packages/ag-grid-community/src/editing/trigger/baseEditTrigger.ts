import type { Bean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';

export interface IEditTrigger extends Bean {
    shouldStartEditing(
        rowCtrl?: RowCtrl,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean;

    shouldStopEditing(
        rowCtrl?: RowCtrl,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean;
}

export abstract class BaseEditTrigger extends BeanStub implements IEditTrigger {
    shouldStartEditing(
        rowCtrl?: RowCtrl,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean {
        return false;
    }

    shouldStopEditing(
        rowCtrl?: RowCtrl,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean {
        if (!this.beans.editingSvc?.editModel?.isEditing(rowCtrl, cellCtrl)) {
            return true;
        }

        return false;
    }
}
