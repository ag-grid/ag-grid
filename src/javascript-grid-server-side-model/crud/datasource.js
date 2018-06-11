var rowDataServerSide;

function MyDatasource() {
}

MyDatasource.prototype.getRows = function(params) {
    // take a slice of the total rows
    var rowsThisPage = rowDataServerSide.slice(params.startRow, params.endRow);
    // call the success callback
    params.successCallback(rowsThisPage, rowDataServerSide.length);
};
