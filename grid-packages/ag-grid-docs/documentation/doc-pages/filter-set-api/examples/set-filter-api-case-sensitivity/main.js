var gridOptions = {
    columnDefs: [
      {
        headerName: 'Case Insensitive (default)',
        field: 'colour',
        filter: 'agSetColumnFilter',
        filterParams: {
          caseSensitive: false,
          cellRenderer: colourCellRenderer,
          newRowsAction: 'keep', // Added to make example follow the v27 expected default.
        },
      },
      {
        headerName: 'Case Sensitive',
        field: 'colour',
        filter: 'agSetColumnFilter',
        filterParams: {
          caseSensitive: true,
          cellRenderer: colourCellRenderer,
          newRowsAction: 'keep', // Added to make example follow the v27 expected default.
        },
      },
    ],
    defaultColDef: {
      flex: 1,
      minWidth: 225,
      cellRenderer: colourCellRenderer,
      resizable: true,
      floatingFilter: true,
    },
    sideBar: 'filters',
    onFirstDataRendered: onFirstDataRendered,
  };
  
var FIXED_STYLES = 'vertical-align: middle; border: 1px solid black; margin: 3px; display: inline-block; width: 10px; height: 10px';

var FILTER_TYPES = {
    insensitive: 'colour',
    sensitive: 'colour_1',
}

var gridApi;

function colourCellRenderer(params) {
  if (!params.value || params.value === '(Select All)') {
    return params.value;
  }

  return `<div style="background-color: ${params.value.toLowerCase()}; ${FIXED_STYLES}"></div>${
    params.value
  }`;
}

function setModel(type) {
    const instance = gridApi.getFilterInstance(FILTER_TYPES[type]);

    instance.setModel({ values: MANGLED_COLOURS });
    gridOptions.api.onFilterChanged();
}

function getModel(type) {
    const instance = gridApi.getFilterInstance(FILTER_TYPES[type]);

    alert(JSON.stringify(instance.getModel(), null, 2));
}

function setFilterValues(type) {
    const instance = gridApi.getFilterInstance(FILTER_TYPES[type]);

    instance.setFilterValues(MANGLED_COLOURS);
    instance.applyModel();
    gridOptions.api.onFilterChanged();
}

function getValues(type) {
    const instance = gridApi.getFilterInstance(FILTER_TYPES[type]);

    alert(JSON.stringify(instance.getValues(), null, 2));
}

function reset(type) {
    const instance = gridApi.getFilterInstance(FILTER_TYPES[type]);

    instance.resetFilterValues();
    instance.setModel(null);
    gridOptions.api.onFilterChanged();
}

var MANGLED_COLOURS = ['ReD', 'OrAnGe', 'WhItE', 'YeLlOw'];

function onFirstDataRendered(params) {
    gridApi = params.api;
    gridApi.getToolPanelInstance('filters').expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);

  // TODO: Remove once colours.json is published!
  // We appear to need to fit this fetch and update pattern for non-JS examples to render properly.
  agGrid.simpleHttpRequest({ url: 'https://www.ag-grid.com/example-assets/olympic-winners.json' })
    .then(function(data) {
        var COLOURS = ['Black', 'Red', 'Orange', 'White', 'Yellow', 'Green', 'Purple'];

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
