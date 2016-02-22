var columnDefs = [
    {headerName: "Group", cellRenderer: {
        renderer: 'group'
    }},
    {headerName: "Athlete", field: "athlete"},
    {headerName: "Year", field: "year"},
    {headerName: "Country", field: "country"}
];

var rowData = [
    {group: 'Group A',
        participants: [
        {athlete: 'Michael Phelps', year: '2008', country: 'United States'},
        {athlete: 'Michael Phelps', year: '2008', country: 'United States'},
        {athlete: 'Michael Phelps', year: '2008', country: 'United States'}
    ]},
    {group: 'Group B', athlete: 'Sausage', year: 'Spaceman', country: 'Winklepicker',
        participants: [
        {athlete: 'Natalie Coughlin', year: '2008', country: 'United States'},
        {athlete: 'Missy Franklin ', year: '2012', country: 'United States'},
        {athlete: 'Ole Einar Qjorndalen', year: '2002', country: 'Norway'},
        {athlete: 'Marit Bjorgen', year: '2010', country: 'Norway'},
        {athlete: 'Ian Thorpe', year: '2000', country: 'Australia'}
    ]},
    {group: 'Group C',
        participants: [
        {athlete: 'Janica Kostelic', year: '2002', country: 'Crotia'},
        {athlete: 'An Hyeon-Su', year: '2006', country: 'South Korea'}
    ]}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    debug: true,
    getNodeChildDetails: getNodeChildDetails,
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

function getNodeChildDetails(rowItem) {
    if (rowItem.group) {
        return {
            group: true,
            // open C be default
            expanded: rowItem.group === 'Group C',
            // provide ag-Grid with the children of this group
            children: rowItem.participants,
            // this is not used, however it is available to the cellRenderers,
            // if you provide a custom cellRenderer, you might use it. it's more
            // relavent if you are doing multi levels of groupings, not just one
            // as in this example.
            field: 'group',
            // the key is used by the default group cellRenderer
            key: rowItem.group
        };
    } else {
        return null;
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
