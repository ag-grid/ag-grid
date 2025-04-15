import type { Bean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { GridEditingModel } from '../model/gridEditingModel';

export interface IEditTrigger extends Bean {
    shouldStartEditing(
        rowCtrl?: RowCtrl | null,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean;

    shouldStopEditing(
        rowCtrl?: RowCtrl | null,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean;

    shouldCancelEditing(
        rowCtrl?: RowCtrl | null,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean;
}

export abstract class BaseEditTrigger extends BeanStub implements IEditTrigger {
    protected editModel: GridEditingModel;

    constructor(...args: any[]) {
        super();
        this.editModel = args[0];
    }

    shouldStartEditing(
        rowCtrl?: RowCtrl | null,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean {
        return false;
    }

    shouldStopEditing(
        rowCtrl?: RowCtrl | null,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean {
        if (!this.editModel.isEditing(rowCtrl, cellCtrl)) {
            return true;
        }

        return false;
    }

    shouldCancelEditing(
        rowCtrl?: RowCtrl | null,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean {
        if (!this.editModel.isEditing(rowCtrl, cellCtrl)) {
            return true;
        }

        return false;
    }
}
