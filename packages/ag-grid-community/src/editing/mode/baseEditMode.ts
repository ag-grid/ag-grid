import type { Bean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { GridEditingModel } from '../model/gridEditingModel';

export interface IEditStrategy extends Bean {
    shouldStartEditing?(
        rowCtrl: RowCtrl,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean;

    shouldStopEditing?(
        rowCtrl: RowCtrl,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean;

    startEditing?(
        rowCtrl: RowCtrl,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean;

    stopEditing?(rowCtrl?: RowCtrl, cellCtrl?: CellCtrl, cancel?: boolean): boolean;

    isEditing?(rowCtrl?: RowCtrl, cellCtrl?: CellCtrl): boolean;

    nextEditingCell?(rowId: string, colId?: string): void;

    previousEditingCell?(rowId: string, colId?: string): void;
}

export abstract class BaseEditMode extends BeanStub implements IEditStrategy {
    protected editingModel: GridEditingModel;

    constructor(..._args: any[]) {
        super();
        const [editingModel] = _args;
        this.editingModel = editingModel;
    }
}
