import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { ICellStyleFeature } from '../../interfaces/iCellStyleFeature';
import type { IEditModelService } from '../../interfaces/iEditModelService';
import type { IEditService } from '../../interfaces/iEditService';
import type { CellCtrl, ICellComp } from '../../rendering/cell/cellCtrl';
import { _hasEdits, _hasLeafEdits, _hasPinnedEdits } from './style-utils';

export class CellEditStyleFeature extends BeanStub implements ICellStyleFeature {
    private cellComp: ICellComp;

    private readonly editSvc?: IEditService;
    private readonly editModelSvc?: IEditModelService;

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
        const { cellCtrl, editSvc, beans } = this;
        if (editSvc?.isBatchEditing() && editSvc.isEditing()) {
            const state =
                _hasEdits(beans, cellCtrl) || _hasLeafEdits(beans, cellCtrl) || _hasPinnedEdits(beans, cellCtrl);
            this.applyBatchingStyle(state);
        } else {
            this.applyBatchingStyle(false);
        }

        const hasErrors = !!this.editModelSvc?.getCellValidationModel().hasCellValidation(this.cellCtrl);
        this.cellComp.toggleCss('ag-cell-editing-error', hasErrors);
    }

    private applyBatchingStyle(newState?: boolean) {
        this.cellComp.toggleCss('ag-cell-editing', newState ?? false);
        this.cellComp.toggleCss('ag-cell-batch-edit', (newState && this.editSvc?.isBatchEditing()) ?? false);
    }
}
