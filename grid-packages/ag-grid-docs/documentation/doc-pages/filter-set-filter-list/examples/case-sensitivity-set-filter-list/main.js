const gridOptions = {
    columnDefs: [
        {
            headerName: 'Case Insensitive (default)',
            field: 'colour',
            filter: 'agSetColumnFilter',
            filterParams: {
                caseSensitive: false,
                cellRenderer: colourCellRenderer,
            }
        },
        {
            headerName: 'Case Sensitive',
            field: 'colour',
            filter: 'agSetColumnFilter',
            filterParams: {
                caseSensitive: true,
                cellRenderer: colourCellRenderer,
            }
        }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 225,
        cellRenderer: colourCellRenderer,
        resizable: true,
        floatingFilter: true,
    },
    sideBar: 'filters',
    onFirstDataRendered: onFirstDataRendered
};

const FIXED_STYLES = 'vertical-align: middle; border: 1px solid black; margin: 3px; display: inline-block; width: 10px; height: 10px';

function colourCellRenderer(params) {
    if (!params.value || params.value === '(Select All)') { return params.value; }

    return `<div style="background-color: ${params.value.toLowerCase()}; ${FIXED_STYLES}"></div>${params.value}`;
}

const COLOURS = ['Black', 'Red', 'Orange', 'White', 'Yellow', 'Green', 'Purple'];

function onFirstDataRendered(params) {
    params.api.getToolPanelInstance('filters').expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

  // TODO: Remove once colours.json is published!
  // We appear to need to fit this fetch and update pattern for non-JS examples to render properly.
  agGrid.simpleHttpRequest({ url: 'https://www.ag-grid.com/example-assets/olympic-winners.json' })
    .then(function(data) {
        const COLOURS = ['Black', 'Red', 'Orange', 'White', 'Yellow', 'Green', 'Purple'];

        data = [];
        COLOURS.forEach((colour) => {
          data.push({ colour });
          data.push({ colour: colour.toUpperCase() });
          data.push({ colour: colour.toLowerCase() });
        });
      
        gridOptions.api.setRowData(data);
    });

//   agGrid.simpleHttpRequest({ url: 'https://www.ag-grid.com/example-assets/colours.json' })
//     .then(function(data) {
//         gridOptions.api.setRowData(data);
//     });
});
