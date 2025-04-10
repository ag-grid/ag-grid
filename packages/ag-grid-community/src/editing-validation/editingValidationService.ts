import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { CellCtrl } from '../rendering/cell/cellCtrl';

export class EditingValidationService extends BeanStub implements NamedBean {
    beanName = 'editingValidationSvc' as const;

    isValid(cellCtrl: CellCtrl): boolean {
        const {
            column,
            rowCtrl: { rowId },
        } = cellCtrl;

        const { comp: cellComp, rowNode } = cellCtrl ?? {};
        const oldValue = this.beans.valueSvc.getValueForDisplay(column, rowNode);

        const cellEditor = cellComp.getCellEditor();

        if (cellEditor) {
            const newValue = cellEditor.getValue();
            // return cellEditor?.validate?.({ rowId, colDef: column.colDef, newValue, oldValue }) ?? true;
        }

        return true;
    }
}
