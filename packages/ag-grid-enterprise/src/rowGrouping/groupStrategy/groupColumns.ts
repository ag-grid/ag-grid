import type { AgColumn, ColDef } from 'ag-grid-community';

export interface GroupColumn {
    col: AgColumn;
    field: ColDef['field'];
    type: ColDef['type'];
    keyCreator: ColDef['keyCreator'];
    valueGetter: ColDef['valueGetter'];
}

export const makeGroupColumns = (columns: AgColumn[] | null | undefined, result: GroupColumn[]): void => {
    if (!columns) {
        result.length = 0;
        return;
    }
    const len = columns.length;
    result.length = len;
    for (let i = 0; i < len; i++) {
        const col = columns[i];
        const colDef = col.getColDef();
        result[i] = {
            col,
            field: colDef.field,
            type: colDef.type,
            keyCreator: colDef.keyCreator,
            valueGetter: colDef.valueGetter,
        };
    }
};

export const groupColumnsChanged = (groupColumns: GroupColumn[], columns: AgColumn[] | null | undefined) => {
    const len = groupColumns.length;
    if (len !== columns?.length) {
        return true;
    }
    for (let i = 0; i < len; i++) {
        const a = groupColumns[i];
        const b = columns[i];
        if (a.col !== b) {
            return true;
        }
        const bColDef = b.getColDef();
        if (
            a.field !== bColDef.field ||
            a.type !== bColDef.type ||
            a.valueGetter !== bColDef.valueGetter ||
            a.keyCreator !== bColDef.keyCreator
        ) {
            return true;
        }
    }
    return false;
};
