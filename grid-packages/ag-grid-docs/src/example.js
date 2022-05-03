var gridDiv;
var grid;

function refreshGrid() {
    if (grid) {
        grid.destroy();
    }

    grid = new agGrid.Grid(gridDiv, gridOptions);

    createData();
}

function onThemeChanged() {
    var newTheme = document.querySelector('#grid-theme').value || 'ag-theme-none';

    gridDiv.className = newTheme;

    var isDark = newTheme && newTheme.indexOf('dark') >= 0;

    if (isDark) {
        document.body.classList.add('dark');
        gridOptions.chartThemes = ['ag-default-dark', 'ag-material-dark', 'ag-pastel-dark', 'ag-vivid-dark', 'ag-solar-dark'];
    } else {
        document.body.classList.remove('dark');
        gridOptions.chartThemes = null;
    }

    refreshGrid();
}


var size = 'fill'; // model for size select
var width = '100%'; // the div gets its width and height from here
var height = '100%';

var rowSelection = 'checkbox';

function toggleOptionsCollapsed() {
    var optionsEl = document.querySelector('#example-toolbar');

    optionsEl.classList.toggle('collapsed');
}


function toggleToolPanel() {
    var showing = gridOptions.api.isToolPanelShowing();
    gridOptions.api.showToolPanel(!showing);
}

var filterCount = 0;

function onFilterChanged(event) {
    filterCount++;
    var filterCountCopy = filterCount;
    window.setTimeout(function() {
        if (filterCount === filterCountCopy) {
            gridOptions.api.setQuickFilter(event.target.value);
        }
    }, 300);
}


