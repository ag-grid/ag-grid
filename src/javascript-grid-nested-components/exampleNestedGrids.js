var countries = [
    {
        // these attributes appear in the top level rows of the grid
        name: "Ireland", continent: "Europe", language: "English", code: 'ie',
        // these are used in the panel
        details: {population: 4000000, summary: 'Master Drinkers'}
    },
    // and then repeat for all the other countries
    {name: "Spain", continent: "Europe", language: "Spanish", code: 'es', details: {population: 4000000, summary: 'Bull Fighters'}},
    {name: "United Kingdom", continent: "Europe", language: "English", code: 'gb', details: {population: 4000000, summary: 'Center of the World'}},
    {name: "France", continent: "Europe", language: "French", code: 'fr', details: {population: 4000000, summary: 'Best Lovers'}},
    {name: "Germany", continent: "Europe", language: "German", code: 'de', details: {population: 4000000, summary: 'Always on Time'}},
    {name: "Sweden", continent: "Europe", language: "Swedish", code: 'se', details: {population: 4000000, summary: 'Home of Vikings'}},
    {name: "Norway", continent: "Europe", language: "Norwegian", code: 'no', details: {population: 4000000, summary: 'Home of Best Vikings'}},
    {name: "Italy", continent: "Europe", language: "Italian", code: 'it', details: {population: 4000000, summary: 'Pizza Pizza'}},
    {name: "Greece", continent: "Europe", language: "Greek", code: 'gr', details: {population: 4000000, summary: 'Many Gods'}},
    {name: "Iceland", continent: "Europe", language: "Icelandic", code: 'is', details: {population: 4000000, summary: 'Volcano Disrupting Airspace'}},
    {name: "Portugal", continent: "Europe", language: "Portuguese", code: 'pt', details: {population: 4000000, summary: 'Ship Builders'}},
    {name: "Malta", continent: "Europe", language: "Maltese", code: 'mt', details: {population: 4000000, summary: 'Fishermen'}},
    {name: "Brazil", continent: "South America", language: "Portuguese", code: 'br', details: {population: 4000000, summary: 'Best Footballers'}},
    {name: "Argentina", continent: "South America", language: "Spanish", code: 'ar', details: {population: 4000000, summary: 'Beef Steaks & BBQs'}},
    {name: "Colombia", continent: "South America", language: "Spanish", code: 'co', details: {population: 4000000, summary: 'Wonderful Hospitality'}},
    {name: "Peru", continent: "South America", language: "Spanish", code: 'pe', details: {population: 4000000, summary: 'Paddington Bear'}},
    {name: "Venezuela", continent: "South America", language: "Spanish", code: 've', details: {population: 4000000, summary: 'Never Been, Dunno'}},
    {name: "Uruguay", continent: "South America", language: "Spanish", code: 'uy', details: {population: 4000000, summary: 'Excellend Food'}}
];

var columnDefs = [
    {headerName: "Name", field: "name", width: 150, cellRenderer: 'group', cellRendererParams: {innerRenderer: countryCellRenderer}},
    {headerName: "Continent", field: "continent", width: 150},
    {headerName: "Language", field: "language", width: 150}
];

// columnDefs[0].pinned = 'left';
// columnDefs[1].pinned = 'right';

function countryCellRenderer(params) {
    var flag = '<img border="0" width="15" height="10" src="../images/flags/' + params.data.code + '.png">';
    return '<span style="cursor: default;">' + flag + ' ' + params.value + '</span>';
}

var gridOptions = {
    columnDefs: columnDefs,
    rowData: countries,
    isNestedRow: function(rowNode) {
        return rowNode.level === 1;
    },
    nestedRowRenderer: function(params) {
        // this is the details, as returned by getNodeChildDetails
        var data = params.data;
        // this is teh data of the parent row
        var parentData = params.node.parent.data;

        return '' +
            '<div class="nested-panel">' +
            '  <div class="float-left">' +
            '    <img border="0" src="../images/largeFlags/' + parentData.code + '.png">' +
            '  </div>' +
            '  <div class="float-left">' +
            '    <label><b>Population:</b> '+data.population+'</label><br/>'+
            '    <label><b>Known For:</b> '+data.summary+ '</label>' +
            '  </div>' +
            '</div>';
    },
    getRowHeight: function(params) {
        var rowIsNestedRow = params.node.level===1;
        // return 100 when nested row, otherwise return 25
        return rowIsNestedRow ? 100 : 25;
    },
    getNodeChildDetails: function(country) {
        if (country.details) {
            return {
                group: true,
                // provide ag-Grid with the children of this group
                children: [country.details],
                expanded: country.name === "Ireland" || country.name === "United Kingdom"
            };
        } else {
            return null;
        }
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
