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
        const { rowCtrl, editModelSvc, beans } = this;

        let rowNode = rowCtrl.rowNode;
        let edits = editModelSvc?.getEditRow({ rowNode });
        if (!edits && rowNode.pinnedSibling) {
            rowNode = rowNode.pinnedSibling!;
            edits = editModelSvc?.getEditRow({ rowNode });
        }
        if (edits) {
            const editing = Array.from(edits.keys()).some((column) => {
                const position = { rowNode, column };
                return (
                    _hasEdits(beans, position, true) ||
                    _hasLeafEdits(beans, position) ||
                    _hasPinnedEdits(beans, position)
                );
            });

            this.applyStyle(editing);

            return;
        }

        this.applyStyle();
    }

    private applyStyle(editing: boolean = false) {
        const batchEdit = this.editSvc?.isBatchEditing() ?? false;
        const fullRow = this.gos.get('editType') === 'fullRow';

        this.rowCtrl?.forEachGui(undefined, ({ rowComp }) => {
            rowComp.toggleCss('ag-row-editing', fullRow && editing);
            rowComp.toggleCss('ag-row-batch-edit', fullRow && editing && batchEdit);

            // required for Material theme
            rowComp.toggleCss('ag-row-inline-editing', editing);
            rowComp.toggleCss('ag-row-not-inline-editing', !editing);
        });
    }
}
