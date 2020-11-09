var gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'tear', rowGroup: true, hide: true },

        { field: 'athlete', rowGroup: true, hide: true },
        { field: 'gold', rowGroup: true, hide: true  },
        { field: 'silver', rowGroup: true, hide: true  },
        { field: 'bronze', rowGroup: true, hide: true  },
        { field: 'total', rowGroup: true, hide: true  },
        { field: 'gold', rowGroup: true, hide: true  },
        { field: 'silver', rowGroup: true, hide: true  },
        { field: 'bronze',  rowGroup: true, hide: true  },
        { field: 'total', rowGroup: true, hide: true  },
        { field: 'silver', rowGroup: true, hide: true  },
        { field: 'bronze',rowGroup: true, hide: true  },
        { field: 'total', rowGroup: true, hide: true  },
        { field: 'gold',  rowGroup: true, hide: true  },
        { field: 'silver', rowGroup: true, hide: true  },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        sortable: true,
        resizable: true,
    },
    autoGroupColumnDef: {
        minWidth: 200,
        filterValueGetter: function(params) {
            var colGettingGrouped = params.colDef.showRowGroup;
            var valueForOtherCol = params.api.getValue(colGettingGrouped, params.node);
            return valueForOtherCol;
        }
    },
    enableRangeSelection: true,
    groupHideOpenParents: true,
    animateRows: true,
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
