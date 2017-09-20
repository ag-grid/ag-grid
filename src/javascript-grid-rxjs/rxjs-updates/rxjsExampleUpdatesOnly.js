(function () {

    const columnDefs = [
        {headerName: "Code", field: "code", width: 70},
        {headerName: "Name", field: "name", width: 300},
        {
            headerName: "Bid", field: "bid", width: 100,
            cellClass: 'cell-number',
            valueFormatter: numberFormatter,
            cellRenderer: 'animateShowChange'
        },
        {
            headerName: "Mid", field: "mid", width: 100,
            cellClass: 'cell-number',
            valueFormatter: numberFormatter,
            cellRenderer: 'animateShowChange'
        },
        {
            headerName: "Ask", field: "ask", width: 100,
            cellClass: 'cell-number',
            valueFormatter: numberFormatter,
            cellRenderer: 'animateShowChange'
        },
        {
            headerName: "Volume", field: "volume", width: 80,
            cellClass: 'cell-number',
            cellRenderer: 'animateSlide'
        }
    ];

    function numberFormatter(params) {
        if (typeof params.value === 'number') {
            return params.value.toFixed(2);
        } else {
            return params.value;
        }
    }

    const gridOptions = {
        enableRangeSelection: true,
        enableColResize: true,
        columnDefs: columnDefs,
        getRowNodeId: function (data) {
            // the code is unique, so perfect for the id
            return data.code;
        },
        onGridReady: () => {
            initialLoad$.subscribe(
                rowData => {
                    // the initial full set of data
                    // note that we don't need to un-subscribe here as it's a one off data load
                    gridOptions.api.setRowData(rowData);

                    // now listen for updates
                    // we process the updates with a transaction - this ensures that only the changes
                    // rows will get re-rendered, improving performance
                    updates$.subscribe((updates) => gridOptions.api.updateRowData({update: updates}));
                }
            );
            gridOptions.api.sizeColumnsToFit();
        }
    };

    let mockServer = new MockServer();
    const initialLoad$ = mockServer.initialLoad();
    const updates$ = mockServer.byRowupdates();

    document.addEventListener('DOMContentLoaded', function () {
        const gridDiv = document.querySelector('#liveStreamExample');
        new agGrid.Grid(gridDiv, gridOptions);
    });
})();


