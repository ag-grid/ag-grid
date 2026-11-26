import type { AgColumn, ColDef } from 'ag-grid-community';

export interface GroupColumn {
    col: AgColumn;
    field: ColDef['field'];
    fieldIsPath: boolean;
    type: ColDef['type'];
    keyCreator: ColDef['keyCreator'];
    valueGetter: ColDef['valueGetter'];
    valueFormatter: ColDef['valueFormatter'];
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
        const colDef = col.colDef;
        result[i] = {
            col,
            field: colDef.field,
            fieldIsPath: col.fieldPath !== null,
            type: colDef.type,
            keyCreator: colDef.keyCreator,
            valueGetter: colDef.valueGetter,
            valueFormatter: colDef.valueFormatter,
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
        const bColDef = b.colDef;
        if (
            a.field !== bColDef.field ||
            a.fieldIsPath !== (b.fieldPath !== null) ||
            a.type !== bColDef.type ||
            a.valueGetter !== bColDef.valueGetter ||
            a.keyCreator !== bColDef.keyCreator ||
            // a key creator can format the key, as the object and date data types do
            (a.keyCreator != null && a.valueFormatter !== bColDef.valueFormatter)
        ) {
            return true;
        }
    }
    return false;
};
