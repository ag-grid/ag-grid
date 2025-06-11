import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { IEditModelService } from '../interfaces/iEditModelService';
import type { IEditService } from '../interfaces/iEditService';
import type { IRowStyleFeature } from '../interfaces/iRowStyleFeature';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { IRowComp } from '../rendering/row/rowCtrl';
import { _valuesDiffer } from './utils/editors';

export class RowEditStyleFeature extends BeanStub implements IRowStyleFeature {
    private rowComp: IRowComp;

    private editSvc?: IEditService;
    private editModelSvc?: IEditModelService;

    constructor(
        private readonly cellCtrl: CellCtrl,
        beans: BeanCollection
    ) {
        super();

        this.beans = beans;
        this.editSvc = beans.editSvc;
        this.editModelSvc = beans.editModelSvc;
    }

    public setComp(comp: IRowComp): void {
        this.rowComp = comp;

        this.applyRowStyles();
    }

    public applyRowStyles() {
        if (this.editSvc?.isBatchEditing()) {
            const edit = this.editModelSvc?.getEdit(this.cellCtrl);
            if (edit) {
                const pending = _valuesDiffer(edit) && edit.state === 'changed';
                this.rowComp.toggleCss('ag-row-batch-edit', pending);
            }
        }
    }
}
