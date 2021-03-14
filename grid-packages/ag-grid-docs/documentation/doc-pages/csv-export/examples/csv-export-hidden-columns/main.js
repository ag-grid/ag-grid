var gridOptions = {
    defaultColDef: {
        editable: true,
        resizable: true,
        minWidth: 100,
        flex: 1
    },

    suppressExcelExport: true,
    popupParent:document.body,

    columnDefs: [
        { field: 'athlete' },
        { field: 'country' },
        { field: 'sport' },
        { field: 'gold', hide: true },
        { field: 'silver', hide: true },
        { field: 'bronze', hide: true },
        { field: 'total' },
    ],

    rowData: [
        { 'athlete': 'Eamon Sullivan', 'country': 'Australia', 'sport': 'Swimming', 'gold': 0,' silver': 2, 'bronze': 1, 'total':3 },
        { 'athlete': 'Dara Torres', 'country': 'United States', 'sport': 'Swimming', 'gold': 0,' silver': 3, 'bronze': 0, 'total':3 },
        { 'athlete': 'Amanda Beard', 'country': 'United States', 'sport': 'Swimming', 'gold': 1,' silver': 2, 'bronze': 0, 'total':3 },
        { 'athlete': 'Antje Buschschulte', 'country': 'Germany', 'sport': 'Swimming', 'gold': 0,' silver': 0, 'bronze': 3, 'total':3 },
        { 'athlete': 'Kirsty Coventry', 'country': 'Zimbabwe', 'sport': 'Swimming', 'gold': 1,' silver': 1, 'bronze': 1, 'total':3 },
        { 'athlete': 'Ian Crocker', 'country': 'United States', 'sport': 'Swimming', 'gold': 1,' silver': 1, 'bronze': 1, 'total':3 },
        { 'athlete': 'Grant Hackett', 'country': 'Australia', 'sport': 'Swimming', 'gold': 1,' silver': 2, 'bronze': 0, 'total':3 },
        { 'athlete': 'Brendan Hansen', 'country': 'United States', 'sport': 'Swimming', 'gold': 1,' silver': 1, 'bronze': 1, 'total':3 },
        { 'athlete': 'Jodie Henry', 'country': 'Australia', 'sport': 'Swimming', 'gold': 3,' silver': 0, 'bronze': 0, 'total':3 },
        { 'athlete': 'Otylia Jedrzejczak', 'country': 'Poland', 'sport': 'Swimming', 'gold': 1,' silver': 2, 'bronze': 0, 'total':3 },
        { 'athlete': 'Leisel Jones', 'country': 'Australia', 'sport': 'Swimming', 'gold': 1,' silver': 1, 'bronze': 1, 'total':3 },
        { 'athlete': 'Kosuke Kitajima', 'country': 'Japan', 'sport': 'Swimming', 'gold': 2,' silver': 0, 'bronze': 1, 'total': 3}
    ]
};

function getBoolean(id) {
    var field = document.querySelector('#' + id);

    return !!field.checked;
}

function getParams() {
    return {
        allColumns: getBoolean('allColumns'),
    }
}

function onBtnExport() {
    gridOptions.api.exportDataAsCsv(getParams());
}

function onBtnUpdate() {
    document.querySelector('#csvResult').value = gridOptions.api.getDataAsCsv(getParams());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});