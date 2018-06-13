export function updateRowData(rowData) {
    return {
        type: 'ROW_DATA_CHANGED',
        rowData
    }
}

export function updateRowSelection(rowSelection) {
    return {
        type: 'ROW_SELECTION_CHANGED',
        rowSelection
    }
}