import type { BeanCollection, RefreshCalculatedColumnsParams } from 'ag-grid-community';

export function refreshCalculatedColumns(beans: BeanCollection, params?: RefreshCalculatedColumnsParams): void {
    beans.calculatedColsSvc?.refreshCalculatedColumns(params);
}
