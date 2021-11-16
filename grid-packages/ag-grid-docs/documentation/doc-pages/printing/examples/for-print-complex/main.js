const columnDefs = [
    {field: 'group', rowGroup: true, hide: true},
    {field: 'id', pinned: 'left', width: 70},
    {field: 'model', width: 180},
    {field: 'color', width: 100},
    {field: 'price', valueFormatter: '\'$\' + value.toLocaleString()', width: 100},
    {field: 'year', width: 100},
    {field: 'country', width: 120}
];

const models = ['Mercedes-AMG C63', 'BMW M2', 'Audi TT Roadster', 'Mazda MX-5', 'BMW M3', 'Porsche 718 Boxster', 'Porsche 718 Cayman'];
const colors = ['Red', 'Black', 'Green', 'White', 'Blue'];
const countries = ['UK', 'Spain', 'France', 'Ireland', 'USA'];

const createRowData = () => {
    const rowData = [];
    for (let i = 0; i<200; i++) {
        const item = {
            id: i + 1,
            group: 'Group ' + (Math.floor(i / 20) + 1),
            model: models[Math.floor(Math.random() * models.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            country: countries[Math.floor(Math.random() * countries.length)],
            year: 2018 - Math.floor(Math.random() * 20),
            price: 20000 + ((Math.floor(Math.random() * 100) * 100))
        };
        rowData.push(item);
    }
    return rowData;
};

const gridOptions = {
    defaultColDef: {
        sortable: true
    },
    columnDefs: columnDefs,
    rowData: createRowData(),
    animateRows: true,
    groupDisplayType: 'groupRows',
    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered(params) {
    params.api.expandAll();
}

function onBtPrint() {
    const api = gridOptions.api;

    setPrinterFriendly(api);

    setTimeout( function( ) {
        print();
        setNormal(api);
    }, 2000);
}

function setPrinterFriendly(api) {
    const eGridDiv = document.querySelector('#myGrid');
    eGridDiv.style.height = '';
    api.setDomLayout('print');
}

function setNormal(api) {
    const eGridDiv = document.querySelector('#myGrid');
    eGridDiv.style.width = '700px';
    eGridDiv.style.height = '200px';

    api.setDomLayout(null);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
