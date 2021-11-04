const gridOptions = {
    columnDefs: [
        // group cell renderer needed for expand / collapse icons
        {field: 'name', cellRenderer: 'agGroupCellRenderer'},
        {field: 'account'},
        {field: 'calls'},
        {field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'"}
    ],
    defaultColDef: {
        flex: 1
    },
    enableCellChangeFlash: true,
    masterDetail: true,
    detailCellRenderer: 'myDetailCellRenderer',
    detailRowHeight: 70,
    groupDefaultExpanded: 1,
    components: {
        myDetailCellRenderer: DetailCellRenderer
    },
    onFirstDataRendered: onFirstDataRendered
};

let allRowData;

function onFirstDataRendered(params) {

    // arbitrarily expand a row for presentational purposes
    setTimeout(function () {
        params.api.getDisplayedRowAtIndex(0).setExpanded(true);
    }, 0);

    setInterval(function () {
        if (!allRowData) {
            return;
        }

        const data = allRowData[0];

        const newCallRecords = [];
        data.callRecords.forEach(function (record, index) {
            newCallRecords.push({
                name: record.name,
                callId: record.callId,
                duration: record.duration + (index % 2),
                switchCode: record.switchCode,
                direction: record.direction,
                number: record.number
            });
        });

        data.callRecords = newCallRecords;
        data.calls++;

        const tran = {
            update: [data],
        };

        params.api.applyTransaction(tran);
    }, 2000);

}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/master-detail-data.json').then(response => response.json()).then(function (data) {
        allRowData = data;
        gridOptions.api.setRowData(allRowData);
    });
});
