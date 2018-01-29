var grid;

function validateLicenseKey(form) {
    var key = form.key.value;

    var licenseDetails = grid.context.beans.licenseManager.beanInstance.getLicenseDetails(key);
    gridOptions.api.setRowData([licenseDetails]);
    gridOptions.api.sizeColumnsToFit();
}

var columnDefs = [
    {headerName: "License Key", field: "licenseKey", width: 500},
    {headerName: "Is Valid?", field: "valid"},
    {headerName: "Expiry", field: "expiry"}
];

var gridOptions = {
    columnDefs: columnDefs,
    enableFilter:false,
    onGridReady: function () {
        gridOptions.api.sizeColumnsToFit();
        gridOptions.api.hideOverlay()
    }
};

document.addEventListener("DOMContentLoaded", function() {
    agGrid.LicenseManager.setLicenseKey("ag-Grid_Evaluation_100Devs_12_February_2017__MTQ4Njg1NzYwMDAwMA==58d0ba9adde32bc3bdbe979f6e0cc27b")
    var eGridDiv = document.querySelector('#myGrid');
    grid = new agGrid.Grid(eGridDiv, gridOptions);
});