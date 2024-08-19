export function addCellRange({ gridApi, rowStartIndex, rowEndIndex, columnStartIndex, columnEndIndex }) {
    const allColumns = gridApi!.getColumns();
    const columnStart = allColumns[columnStartIndex];
    const columnEnd = allColumns[columnEndIndex];

    if (!columnStart || !columnEnd) {
        return;
    }

    gridApi.addCellRange({
        rowStartIndex,
        rowEndIndex,
        columnStart,
        columnEnd,
    });
}
