import type { BeanCollection, Column } from 'ag-grid-community';

export function setColumnHeaderName(beans: BeanCollection, key: string | Column, headerName: string | null): void {
    beans.colHeaderEditSvc?.setColumnHeaderName(key, headerName);
}
