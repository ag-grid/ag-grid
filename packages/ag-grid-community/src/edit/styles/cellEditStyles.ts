import type { BeanCollection } from '../../context/context';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import { _hasEdits, _hasLeafEdits, _hasPinnedEdits } from './style-utils';

export function applyCellStyles(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const { editSvc, editModelSvc } = beans;
    const cellComp = cellCtrl.comp;
    if (!cellComp) {
        return;
    }

    const applyBatchingStyle = (newState?: boolean) => {
        cellComp.toggleCss('ag-cell-editing', newState ?? false);
        cellComp.toggleCss('ag-cell-batch-edit', (newState && editSvc?.isBatchEditing()) ?? false);
    };

    if (editSvc?.isBatchEditing() && editSvc.isEditing()) {
        const state = _hasEdits(beans, cellCtrl) || _hasLeafEdits(beans, cellCtrl) || _hasPinnedEdits(beans, cellCtrl);
        applyBatchingStyle(state);
    } else {
        applyBatchingStyle(false);
    }

    const hasErrors = !!editModelSvc?.getCellValidationModel().hasCellValidation(cellCtrl);
    cellComp.toggleCss('ag-cell-editing-error', hasErrors);
}
