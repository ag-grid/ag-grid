var columnDefs = [
    {
        headerName: 'Top Level Column Group',
        children: [
            {
                headerName: 'Group A',
                children: [
                    { field: 'athlete', minWidth: 200 },
                    { field: 'country', minWidth: 200, },
                    { headerName: 'Group', valueGetter: 'data.country.charAt(0)', },
                ]
            },
            {
                headerName: 'Group B',
                children: [
                    { field: 'date', minWidth: 150 },
                    { field: 'sport', minWidth: 150 },
                    { field: 'gold' },
                    { field: 'silver' },
                    { field: 'bronze' },
                    { field: 'total', }
                ]
            }
        ]
    }
];

var gridOptions = {
    defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 100,
        flex: 1
    },

    columnDefs: columnDefs,
    popupParent: document.body,

    rowData: [
        { 'athlete': 'Eamon Sullivan', 'country': 'Australia', 'date' : '2020-08-01', 'sport': 'Swimming', 'gold': 0,' silver': 2, 'bronze': 1, 'total':3 },
        { 'athlete': 'Dara Torres', 'country': 'United States', 'date' : '2016-08-30', 'sport': 'Swimming', 'gold': 0,' silver': 3, 'bronze': 0, 'total':3 },
        { 'athlete': 'Amanda Beard', 'country': 'United States', 'date' : '2012-08-28', 'sport': 'Swimming', 'gold': 1,' silver': 2, 'bronze': 0, 'total':3 },
        { 'athlete': 'Antje Buschschulte', 'country': 'Germany', 'date' : '2000-08-20', 'sport': 'Swimming', 'gold': 0,' silver': 0, 'bronze': 3, 'total':3 },
        { 'athlete': 'Kirsty Coventry', 'country': 'Zimbabwe', 'date' : '2020-08-01', 'sport': 'Swimming', 'gold': 1,' silver': 1, 'bronze': 1, 'total':3 },
        { 'athlete': 'Ian Crocker', 'country': 'United States', 'date' : '2016-08-30', 'sport': 'Swimming', 'gold': 1,' silver': 1, 'bronze': 1, 'total':3 },
        { 'athlete': 'Grant Hackett', 'country': 'Australia', 'date' : '2012-08-28', 'sport': 'Swimming', 'gold': 1,' silver': 2, 'bronze': 0, 'total':3 },
        { 'athlete': 'Brendan Hansen', 'country': 'United States', 'date' : '2000-08-20', 'sport': 'Swimming', 'gold': 1,' silver': 1, 'bronze': 1, 'total':3 },
        { 'athlete': 'Jodie Henry', 'country': 'Australia', 'date' : '2020-08-01', 'sport': 'Swimming', 'gold': 3,' silver': 0, 'bronze': 0, 'total':3 },
        { 'athlete': 'Otylia Jedrzejczak', 'country': 'Poland', 'date' : '2016-08-30', 'sport': 'Swimming', 'gold': 1,' silver': 2, 'bronze': 0, 'total':3 },
        { 'athlete': 'Leisel Jones', 'country': 'Australia', 'date' : '2012-08-28', 'sport': 'Swimming', 'gold': 1,' silver': 1, 'bronze': 1, 'total':3 },
        { 'athlete': 'Kosuke Kitajima', 'country': 'Japan', 'date' : '2000-08-20', 'sport': 'Swimming', 'gold': 2,' silver': 0, 'bronze': 1, 'total': 3}
    ],

    pinnedTopRowData: [
        {
            athlete: 'Floating <Top> Athlete',
            country: 'Floating <Top> Country',
            date: '2020-08-01',
            sport: 'Track & Field',
            gold: 22,
            silver: '003',
            bronze: 44,
            total: 55
        }
    ],

    pinnedBottomRowData: [
        {
            athlete: 'Floating <Bottom> Athlete',
            country: 'Floating <Bottom> Country',
            date: '2030-08-01',
            sport: 'Track & Field',
            gold: 222,
            silver: '005',
            bronze: 244,
            total: 255
        }
    ]
};

function getBoolean(id) {
    var field = document.querySelector('#' + id);

    return !!field.checked;
}

function getParams() {
    return {
        skipPinnedTop: getBoolean('skipPinnedTop'),
        skipPinnedBottom: getBoolean('skipPinnedBottom')
    }
}

function onBtExport() {
    gridOptions.api.exportDataAsExcel(getParams());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
