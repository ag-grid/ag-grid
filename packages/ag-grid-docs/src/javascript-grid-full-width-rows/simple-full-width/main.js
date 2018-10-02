var rowData = [
    {
        // these attributes appear in the top level rows of the grid
        name: 'Ireland',
        continent: 'Europe',
        language: 'English',
        code: 'ie',
        // these are used in the panel
        population: 4000000,
        summary: 'Master Drinkers'
    },
    // and then repeat for all the other countries
    {
        name: 'Spain',
        continent: 'Europe',
        language: 'Spanish',
        code: 'es',
        population: 4000000,
        summary: 'Bull Fighters'
    },
    {
        name: 'United Kingdom',
        continent: 'Europe',
        language: 'English',
        code: 'gb',
        population: 4000000,
        summary: 'Center of the World'
    },
    {name: 'France', continent: 'Europe', language: 'French', code: 'fr', population: 4000000, summary: 'Best Lovers'},
    {
        name: 'Germany',
        continent: 'Europe',
        language: 'German',
        code: 'de',
        population: 4000000,
        summary: 'Always on Time'
    },
    {
        name: 'Sweden',
        continent: 'Europe',
        language: 'Swedish',
        code: 'se',
        population: 4000000,
        summary: 'Home of Vikings'
    },
    {
        name: 'Norway',
        continent: 'Europe',
        language: 'Norwegian',
        code: 'no',
        population: 4000000,
        summary: 'Best Vikings'
    },
    {name: 'Italy', continent: 'Europe', language: 'Italian', code: 'it', population: 4000000, summary: 'Pizza Pizza'},
    {name: 'Greece', continent: 'Europe', language: 'Greek', code: 'gr', population: 4000000, summary: 'Many Gods'},
    {
        name: 'Iceland',
        continent: 'Europe',
        language: 'Icelandic',
        code: 'is',
        population: 4000000,
        summary: 'Exploding Volcano'
    },
    {
        name: 'Portugal',
        continent: 'Europe',
        language: 'Portuguese',
        code: 'pt',
        population: 4000000,
        summary: 'Ship Builders'
    },
    {name: 'Malta', continent: 'Europe', language: 'Maltese', code: 'mt', population: 4000000, summary: 'Fishermen'},
    {
        name: 'Brazil',
        continent: 'South America',
        language: 'Portuguese',
        code: 'br',
        population: 4000000,
        summary: 'Best Footballers'
    },
    {
        name: 'Argentina',
        continent: 'South America',
        language: 'Spanish',
        code: 'ar',
        population: 4000000,
        summary: 'Beef Steaks'
    },
    {
        name: 'Colombia',
        continent: 'South America',
        language: 'Spanish',
        code: 'co',
        population: 4000000,
        summary: 'Wonderful Hospitality'
    },
    {
        name: 'Peru',
        continent: 'South America',
        language: 'Spanish',
        code: 'pe',
        population: 4000000,
        summary: 'Paddington Bear'
    },
    {
        name: 'Venezuela',
        continent: 'South America',
        language: 'Spanish',
        code: 've',
        population: 4000000,
        summary: 'Never Been, Dunno'
    },
    {
        name: 'Uruguay',
        continent: 'South America',
        language: 'Spanish',
        code: 'uy',
        population: 4000000,
        summary: 'Excellent Food'
    }
];

var columnDefs = [
    {headerName: 'Name', field: 'name', cellRenderer: countryCellRenderer},
    {headerName: 'Continent', field: 'continent', width: 150},
    {headerName: 'Language', field: 'language', width: 150}
];

function countryCellRenderer(params) {
    var flag =
        '<img border="0" width="15" height="10" src="https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/images/flags/' +
        params.data.code +
        '.png">';
    return '<span style="cursor: default;">' + flag + ' ' + params.value + '</span>';
}

var gridOptions = {
    enableSorting: true,
    enableFilter: true,
    columnDefs: columnDefs,
    rowData: rowData,
    getRowHeight: function (params) {
        // return 100px height for full width rows
        return isFullWidth(params.data) ? 100 : 25;
    },
    onGridReady: function (params) {
        params.api.sizeColumnsToFit();
    },
    components: {
        fullWidthCellRenderer: FullWidthCellRenderer
    },
    isFullWidthCell: function (rowNode) {
        return isFullWidth(rowNode.data);
    },
    // see ag-Grid docs cellRenderer for details on how to build cellRenderers
    fullWidthCellRenderer: 'fullWidthCellRenderer'
};

function isFullWidth(data) {
    // return true when country is Peru, France or Italy
    return ['Peru', 'France', 'Italy'].indexOf(data.name) >= 0;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
