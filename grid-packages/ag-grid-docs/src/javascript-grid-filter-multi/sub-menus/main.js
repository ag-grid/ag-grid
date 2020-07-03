var gridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            filter: 'agMultiColumnFilter',
            filterParams: {
                filters: [
                    {
                        filter: 'agTextColumnFilter',
                        filterParams: {
                            buttons: ['apply']
                        }
                    },
                    {
                        filter: 'agSetColumnFilter',
                        filterParams: {
                            buttons: ['apply']
                        }
                    }
                ]
            }
        },
        {
            field: 'country',
            filter: 'agMultiColumnFilter',
            filterParams: {
                filters: [
                    {
                        filter: 'agTextColumnFilter',
                        filterParams: {
                            useSubMenu: true,
                            buttons: ['apply']
                        }
                    },
                    {
                        filter: 'agSetColumnFilter',
                        filterParams: {
                            buttons: ['apply']
                        }
                    }
                ]
            }
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
        resizable: true,
    },
    sideBar: ['filters']
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
