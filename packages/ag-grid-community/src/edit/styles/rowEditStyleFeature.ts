import type { BeanCollection } from '../../context/context';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { _hasEdits, _hasLeafEdits, _hasPinnedEdits } from './style-utils';

export function _applyRowEditStyles(beans: BeanCollection, rowCtrl: RowCtrl): void {
    const editModelSvc = beans.editModelSvc;

    let rowNode = rowCtrl.rowNode;
    let edits = editModelSvc?.getEditRow(rowNode);
    const hasErrors = editModelSvc?.getRowValidationModel().hasRowValidation({ rowNode });

    if (!edits && rowNode.pinnedSibling) {
        rowNode = rowNode.pinnedSibling!;
        edits = editModelSvc?.getEditRow(rowNode);
    }
    if (edits) {
        const editing = Array.from(edits.keys()).some((column) => {
            const position = { rowNode, column };
            return (
                _hasEdits(beans, position, true) || _hasLeafEdits(beans, position) || _hasPinnedEdits(beans, position)
            );
        });

        applyStyle(beans, rowCtrl, hasErrors, editing);

        return;
    }

    applyStyle(beans, rowCtrl, hasErrors);
}

function applyStyle(
    beans: BeanCollection,
    rowCtrl: RowCtrl,
    hasErrors: boolean = false,
    editing: boolean = false
): void {
    const batchEdit = !!beans.editSvc?.isBatchEditing();
    const fullRow = beans.gos.get('editType') === 'fullRow';

    const rowComp = rowCtrl.getGui()?.rowComp;
    if (!rowComp) {
        return;
    }

    rowComp.toggleCss('ag-row-editing', fullRow && editing);
    rowComp.toggleCss('ag-row-batch-edit', fullRow && editing && batchEdit);

    // required for Material theme
    rowComp.toggleCss('ag-row-inline-editing', editing);
    rowComp.toggleCss('ag-row-not-inline-editing', !editing);

    rowComp.toggleCss('ag-row-editing-invalid', fullRow && editing && hasErrors);
}
