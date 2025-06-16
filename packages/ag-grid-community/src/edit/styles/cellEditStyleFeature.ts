import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { ICellStyleFeature } from '../../interfaces/iCellStyleFeature';
import type { IEditService } from '../../interfaces/iEditService';
import type { CellCtrl, ICellComp } from '../../rendering/cell/cellCtrl';
import { _hasEdits, _hasLeafEdits, _hasPinnedEdits } from './style-utils';

export class CellEditStyleFeature extends BeanStub implements ICellStyleFeature {
    private cellComp: ICellComp;

    private editSvc?: IEditService;

    constructor(
        private readonly cellCtrl: CellCtrl,
        beans: BeanCollection
    ) {
        super();

        this.beans = beans;
        this.editSvc = beans.editSvc;
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
            this.applyStyle(state);
        } else {
            this.applyStyle(false);
        }
    }

    private applyStyle(newState?: boolean) {
        this.cellComp.toggleCss('ag-cell-editing', newState ?? false);
        this.cellComp.toggleCss('ag-cell-batch-edit', (newState && this.editSvc?.isBatchEditing()) ?? false);
    }
}
