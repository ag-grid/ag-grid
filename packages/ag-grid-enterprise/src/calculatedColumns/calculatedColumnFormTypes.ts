export interface CalculatedColumnDataTypeOption {
    value: string;
    text: string;
}

export interface CalculatedColumnDraft {
    colId: string;
    headerName: string;
    cellDataType: string;
    calculatedExpression: string;
}

export interface ColumnSuggestion {
    type: 'column' | 'function' | 'operator';
    label: string;
    value: string;
    searchText?: string;
    displayPath?: string[];
}
