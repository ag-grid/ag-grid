import type { BeanCollection } from '../../context/context';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import { _hasEdits, _hasLeafEdits, _hasPinnedEdits } from './style-utils';

export function _applyCellEditStyles(beans: BeanCollection, cellCtrl: CellCtrl): void {
    if (!cellCtrl.comp) {
        return;
    }

    const { editSvc, editModelSvc } = beans;

    if (editSvc?.isBatchEditing() && editSvc.isEditing()) {
        const state = _hasEdits(beans, cellCtrl) || _hasLeafEdits(beans, cellCtrl) || _hasPinnedEdits(beans, cellCtrl);
        applyBatchingStyle(beans, cellCtrl, state);
    } else {
        applyBatchingStyle(beans, cellCtrl, false);
    }

    const hasErrors = !!editModelSvc?.getCellValidationModel().hasCellValidation(cellCtrl);
    cellCtrl.comp.toggleCss('ag-cell-editing-error', hasErrors);
}

function applyBatchingStyle(beans: BeanCollection, cellCtrl: CellCtrl, newState?: boolean): void {
    cellCtrl.comp.toggleCss('ag-cell-editing', newState ?? false);
    cellCtrl.comp.toggleCss('ag-cell-batch-edit', (newState && beans.editSvc?.isBatchEditing()) ?? false);
}
