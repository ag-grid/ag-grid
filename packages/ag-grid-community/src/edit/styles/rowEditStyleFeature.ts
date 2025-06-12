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
        if (this.gos.get('editType') === 'fullRow') {
            let node = this.rowCtrl.rowNode;
            let edits = this.editModelSvc?.getEditRow({ rowNode: node });
            if (!edits && node.pinnedSibling) {
                node = node.pinnedSibling!;
                edits = this.editModelSvc?.getEditRow({ rowNode: node });
            }
            if (edits) {
                const newState = Array.from(edits.keys()).some((key) => {
                    const position = { rowNode: node, column: key };
                    return (
                        _hasEdits(this.beans, position) ||
                        _hasLeafEdits(this.beans, position) ||
                        _hasPinnedEdits(this.beans, position)
                    );
                });
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
