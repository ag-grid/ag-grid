var columnDefs = [
    {headerName: "Group", field: 'group', cellRenderer: 'group'},
    {headerName: "Athlete", field: "athlete"},
    {headerName: "Year", field: "year"},
    {headerName: "Country", field: "country"}
];

var rowData = [
    {group: 'Group A',
        participants: [
        {group: 'A.1', athlete: 'Michael Phelps', year: '2008', country: 'United States'},
        {group: 'A.2', athlete: 'Michael Phelps', year: '2008', country: 'United States'},
        {group: 'A.3', athlete: 'Michael Phelps', year: '2008', country: 'United States'}
    ]},
    {group: 'Group B', athlete: 'Mix of Names', year: '2000..2012', country: 'Group Country',
        participants: [
        {group: 'B.1', athlete: 'Natalie Coughlin', year: '2008', country: 'United States'},
        {group: 'B.2', athlete: 'Missy Franklin ', year: '2012', country: 'United States'},
        {group: 'B.3', athlete: 'Ole Einar Qjorndalen', year: '2002', country: 'Norway'},
        {group: 'B.4', athlete: 'Marit Bjorgen', year: '2010', country: 'Norway'},
        {group: 'B.5', athlete: 'Ian Thorpe', year: '2000', country: 'Australia'}
    ]},
    {group: 'Group C',
        participants: [
        {group: 'C.1', athlete: 'Janica Kostelic', year: '2002', country: 'Crotia'},
        {group: 'C.2', athlete: 'An Hyeon-Su', year: '2006', country: 'South Korea'}
    ]}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    getNodeChildDetails: getNodeChildDetails,
    onGridReady: function(params) {
    }
};

function getNodeChildDetails(rowItem) {
    if (rowItem.participants) {
        return {
            group: true,
            // open C be default
            expanded: rowItem.group === 'Group C',
            // provide ag-Grid with the children of this group
            children: rowItem.participants,
            // the key is used by the default group cellRenderer
            key: rowItem.group
        };
    } else {
        return null;
    }
}

function onTextboxFilterChanged() {
    var value = document.getElementById('filter-textbox').value;
    gridOptions.api.setQuickFilter(value);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.sizeColumnsToFit();
});
