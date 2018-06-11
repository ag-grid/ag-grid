var columnDefs = [
    {field: 'model'},
    {field: 'color'},
    {field: 'price', valueFormatter: '"$" + value.toLocaleString()'},
    {field: 'year'},
    {field: 'country'}
];

var models = ['Mercedes-AMG C63','BMW M2','Audi TT Roadster','Mazda MX-5','BMW M3','Porsche 718 Boxster','Porsche 718 Cayman'];
var colors = ['Red','Black','Green','White','Blue'];
var countries = ['UK', 'Spain', 'France', 'Ireland', 'USA'];

function createRowData() {
    var rowData = [];
    for (var i = 0; i<200; i++) {
        var item = {
            model: models[Math.floor(Math.random()*models.length)],
            color: colors[Math.floor(Math.random()*colors.length)],
            country: countries[Math.floor(Math.random()*countries.length)],
            year: 2018 - Math.floor(Math.random() * 20),
            price: 20000 + ((Math.floor(Math.random() * 100)*100))
        };
        rowData.push(item);
    }
    return rowData;
}

var gridOptions = {
    columnDefs: columnDefs,
    rowData: createRowData()
};

function onBtPrinterFriendly() {
    var eGridDiv = document.querySelector('.my-grid');

    var preferredWidth = gridOptions.api.getPreferredWidth();

    // add 2 pixels for the grid border
    preferredWidth += 2;

    eGridDiv.style.width = preferredWidth + 'px';
    eGridDiv.style.height = '';

    gridOptions.api.setGridAutoHeight(true);
}

function onBtNormal() {
    var eGridDiv = document.querySelector('.my-grid');

    eGridDiv.style.width = '400px';
    eGridDiv.style.height = '200px';

    gridOptions.api.setGridAutoHeight(false);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});