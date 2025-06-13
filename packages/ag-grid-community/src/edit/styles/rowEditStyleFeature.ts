import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { IEditModelService } from '../../interfaces/iEditModelService';
import type { IEditService } from '../../interfaces/iEditService';
import type { IRowStyleFeature } from '../../interfaces/iRowStyleFeature';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { _hasEdits, _hasLeafEdits, _hasPinnedEdits } from './style-utils';

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
        const { gos, rowCtrl, editSvc, editModelSvc, beans } = this;
        if (gos.get('editType') === 'fullRow') {
            let node = rowCtrl.rowNode;
            let edits = editModelSvc?.getEditRow({ rowNode: node });
            if (!edits && node.pinnedSibling) {
                node = node.pinnedSibling!;
                edits = editModelSvc?.getEditRow({ rowNode: node });
            }
            if (edits) {
                const newState = Array.from(edits.keys()).some((key) => {
                    const position = { rowNode: node, column: key };
                    return (
                        _hasEdits(beans, position) || _hasLeafEdits(beans, position) || _hasPinnedEdits(beans, position)
                    );
                });
                const batchEdit = editSvc?.isBatchEditing() ?? false;
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
