var gridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            filter: 'agMultiColumnFilter',
            filterParams: {
                filters: [
                    {
                        filter: 'agTextColumnFilter',
                        display: 'subMenu',
                    },
                    {
                        filter: 'agSetColumnFilter',
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
                        display: 'accordion',
                        title: 'Expand Me for Text Filters'
                    },
                    {
                        filter: 'agSetColumnFilter',
                        display: 'accordion',
                    }
                ]
            }
        },
        {
            field: 'sport',
            filter: 'agMultiColumnFilter',
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
        resizable: true,
        menuTabs: ['filterMenuTab'],
    },
    sideBar: {
        toolPanels: [
            {
                id: 'filters',
                labelDefault: 'Filters',
                labelKey: 'filters',
                iconKey: 'filter',
                toolPanel: 'agFiltersToolPanel',
            }
        ],
    }
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
