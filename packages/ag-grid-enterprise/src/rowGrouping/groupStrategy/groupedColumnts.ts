import type { AgColumn, ColDef } from 'ag-grid-community';

export interface GroupColumn {
    col: AgColumn;
    id: string;
    field: ColDef['field'];
    type: ColDef['type'];
    cellDataType: ColDef['cellDataType'];
    valueGetter: ColDef['valueGetter'];
    keyCreator: ColDef['keyCreator'];
}

export const makeGroupColumns = (columns: AgColumn[] | null | undefined): GroupColumn[] => {
    if (!columns) {
        return [];
    }
    const len = columns.length;
    const result = new Array<GroupColumn>(len);
    for (let i = 0; i < len; i++) {
        const col = columns[i];
        const colDef = col.getColDef();
        result[i] = {
            col,
            id: col.getId(),
            field: colDef.field,
            type: colDef.type,
            cellDataType: colDef.cellDataType,
            valueGetter: colDef.valueGetter,
            keyCreator: colDef.keyCreator,
        };
    }
    return result;
};

export const groupColumnsChanged = (groupedColumns: GroupColumn[], columns: AgColumn[] | null | undefined) => {
    const len = groupedColumns.length;
    if (len !== columns?.length) {
        return true;
    }
    for (let i = 0; i < len; i++) {
        const a = groupedColumns[i];
        const b = columns[i];
        const bColDef = b.getColDef();
        if (
            a.col !== b ||
            a.id !== b.getId() ||
            a.field !== bColDef.field ||
            a.type !== bColDef.type ||
            a.cellDataType !== bColDef.cellDataType ||
            a.valueGetter !== bColDef.valueGetter ||
            a.keyCreator !== bColDef.keyCreator
        ) {
            return true;
        }
    }
    return false;
};
