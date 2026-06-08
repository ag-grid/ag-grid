import type { BeanCollection, ColKey } from 'ag-grid-community';

export function openCalculatedColumnDialog(beans: BeanCollection, column: ColKey): void {
    beans.calculatedColsSvc?.openCalculatedColumnDialog(beans.colModel.getCol(column), 'edit', false);
}
