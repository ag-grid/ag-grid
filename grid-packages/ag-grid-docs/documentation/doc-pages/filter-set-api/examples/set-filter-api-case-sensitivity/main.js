var gridOptions = {
    columnDefs: [
      {
        headerName: 'Case Insensitive (default)',
        field: 'colour',
        filter: 'agSetColumnFilter',
        filterParams: {
          caseSensitive: false,
          newRowsAction: 'keep', // Added to make example follow the v27 expected default.
          cellRenderer: colourCellRenderer,
        },
      },
      {
        headerName: 'Case Sensitive',
        field: 'colour',
        filter: 'agSetColumnFilter',
        filterParams: {
          caseSensitive: true,
          newRowsAction: 'keep', // Added to make example follow the v27 expected default.
          cellRenderer: colourCellRenderer,
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

function colourCellRenderer(params) {
  if (!params.value || params.value === '(Select All)') {
    return params.value;
  }

  return `<div style="background-color: ${params.value.toLowerCase()}; ${FIXED_STYLES}"></div>${
    params.value
  }`;
}

function getFilterInstance(type) {
    switch (type) {
        case 'insensitive':
            return gridOptions.api.getFilterInstance('colour');
        case 'sensitive':
            return gridOptions.api.getFilterInstance('colour_1');
        default:
            throw new Error('Example not configured correctly.')
    }
}

function setModel(type) {
    const instance = getFilterInstance(type);

    instance.setModel({ values: MANGLED_COLOURS });
    gridOptions.api.onFilterChanged();
}

function getModel(type) {
    const instance = getFilterInstance(type);

    alert(JSON.stringify(instance.getModel(), null, 2));
}

function setFilterValues(type) {
    const instance = getFilterInstance(type);

    instance.setFilterValues(MANGLED_COLOURS);
    instance.applyModel();
    gridOptions.api.onFilterChanged();
}

function getValues(type) {
    const instance = getFilterInstance(type);

    alert(JSON.stringify(instance.getValues(), null, 2));
}

function reset(type) {
    const instance = getFilterInstance(type);

    instance.resetFilterValues();
    instance.setModel(null);
    gridOptions.api.onFilterChanged();
}

var COLOURS = ['Black', 'Red', 'Orange', 'White', 'Yellow', 'Green', 'Purple'];
var MANGLED_COLOURS = ['ReD', 'OrAnGe', 'WhItE', 'YeLlOw'];

function onFirstDataRendered(params) {
  params.api.getToolPanelInstance('filters').expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);

  const data = [];
  COLOURS.forEach((colour) => {
    data.push({ colour });
    data.push({ colour: colour.toUpperCase() });
    data.push({ colour: colour.toLowerCase() });
  });

  gridOptions.api.setRowData(data);
});
