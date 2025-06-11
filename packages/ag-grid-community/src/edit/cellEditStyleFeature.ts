import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { ICellStyleFeature } from '../interfaces/iCellStyleFeature';
import type { IEditModelService } from '../interfaces/iEditModelService';
import type { IEditService } from '../interfaces/iEditService';
import type { CellCtrl, ICellComp } from '../rendering/cell/cellCtrl';
import { _valuesDiffer } from './utils/editors';

export class CellEditStyleFeature extends BeanStub implements ICellStyleFeature {
    private cellComp: ICellComp;

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

    public setComp(comp: ICellComp): void {
        this.cellComp = comp;

        this.applyCellStyles();
    }

    public applyCellStyles() {
        if (this.editSvc?.isBatchEditing()) {
            const edit = this.editModelSvc?.getEdit(this.cellCtrl);
            if (edit) {
                const pending = _valuesDiffer(edit) && edit.state === 'changed';
                this.cellComp.toggleCss('ag-cell-batch-edit', pending);
            }
        }
    }
}
