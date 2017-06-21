function FxQuoteMatrix() {
}
FxQuoteMatrix.prototype.init = function (fxDataService) {
    this.fxDataService = fxDataService;

    this.gridOptions = {
        onGridReady: this.onGridReady.bind(this),
        getRowNodeId: this.getRowNodeId,
        columnDefs: fxDataService.getFxMatrixHeaderNames(),
        enableRangeSelection: true
    };
};

FxQuoteMatrix.prototype.onGridReady = function (params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.gridApi.setRowData(this.fxDataService.getCurrentFxData());
};

FxQuoteMatrix.prototype.getRowNodeId = function (data) {
    return data.symbol;
};

FxQuoteMatrix.prototype.update = function (newRowData) {
    if(!this.gridApi) {
        return;
    }

    const updatedRows = [];

    for (let i = 0; i < newRowData.length; i++) {
        let newRow = newRowData[i];
        let currentRowNode = this.gridApi.getRowNode(newRow.symbol);

        const {data} = currentRowNode;
        for (const def of this.gridOptions.columnDefs) {
            if (data[def.field] !== newRow[def.field]) {
                updatedRows.push(newRow);
                break;
            }
        }
    }

    this.gridApi.updateRowData({update: updatedRows});
};

FxQuoteMatrix.prototype.render = function (id) {
    // lookup the container we want the Grid to use
    let eGridDiv = document.querySelector(`#${id}`);

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, this.gridOptions);
};
