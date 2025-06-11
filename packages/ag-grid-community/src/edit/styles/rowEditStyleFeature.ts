import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { IEditModelService } from '../../interfaces/iEditModelService';
import type { IEditService } from '../../interfaces/iEditService';
import type { IRowStyleFeature } from '../../interfaces/iRowStyleFeature';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { _valuesDiffer } from '../utils/editors';

export class RowEditStyleFeature extends BeanStub implements IRowStyleFeature {
    private editSvc?: IEditService;
    private editModelSvc?: IEditModelService;

    constructor(
        private readonly rowCtrl: RowCtrl,
        beans: BeanCollection
    ) {
        super();

        this.beans = beans;
        this.gos = beans.gos;
        this.editSvc = beans.editSvc;
        this.editModelSvc = beans.editModelSvc;
    }

    public applyRowStyles() {
        if (this.gos.get('editType') === 'fullRow') {
            const edits = this.editModelSvc?.getEditRow(this.rowCtrl);
            if (edits) {
                const newState = Array.from(edits.values()).some(
                    (edit) => _valuesDiffer(edit) && edit.state === 'changed'
                );
                const batchEdit = this.editSvc?.isBatchEditing() ?? false;
                this.applyStyle(newState, batchEdit);

                return;
            }
        }

        this.applyStyle();
    }

    private applyStyle(newState?: boolean, batchEdit?: boolean) {
        this.rowCtrl?.forEachGui(undefined, ({ rowComp }) => {
            rowComp.toggleCss('ag-row-editing', newState ?? false);
            rowComp.toggleCss('ag-row-batch-edit', (newState && batchEdit) ?? false);
        });
    }
}
