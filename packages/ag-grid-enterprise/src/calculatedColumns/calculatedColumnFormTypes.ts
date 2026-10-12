import type { ColDef } from 'ag-grid-community';

export interface CalculatedColumnDataTypeOption {
    value: string;
    text: string;
}

export interface CalculatedColumnDraft {
    colId: string;
    headerName: string;
    cellDataType: ColDef['cellDataType'];
    calculatedExpression: string;
}

export interface ColumnSuggestion {
    type: 'column' | 'function' | 'operator';
    label: string;
    value: string;
    searchText?: string;
    displayPath?: string[];
}
