var columnDefs = [
    { field: "athlete", minWidth: 200 },
    { field: "age" },
    { field: "country", minWidth: 200 },
    { field: "year" },
    {
        field: "date",
        minWidth: 180,
        menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'],
    },
    {
        field: "sport",
        minWidth: 200,
        menuTabs: ['filterMenuTab', 'columnsMenuTab'],
    },
    {
        field: "gold",
        menuTabs: ['generalMenuTab', 'gibberishMenuTab'],
    },
    { field: "silver", menuTabs: [] },
    { field: "bronze" },
    { field: "total" }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true
    },
    getMainMenuItems: getMainMenuItems,
    postProcessPopup: function(params) {
        // check callback is for menu
        if (params.type !== 'columnMenu') {
            return;
        }
        var columnId = params.column.getId();
        if (columnId === 'gold') {
            var ePopup = params.ePopup;

            var oldTopStr = ePopup.style.top;
            // remove 'px' from the string (ag-Grid uses px positioning)
            oldTopStr = oldTopStr.substring(0, oldTopStr.indexOf('px'));
            var oldTop = parseInt(oldTopStr);
            var newTop = oldTop + 25;

            ePopup.style.top = newTop + 'px';
        }
    }
};

function getMainMenuItems(params) {
    // you don't need to switch, we switch below to just demonstrate some different options
    // you have on how to build up the menu to return
    switch (params.column.getId()) {

        // return the defaults, put add some extra items at the end
        case 'athlete':
            var athleteMenuItems = params.defaultItems.slice(0);
            athleteMenuItems.push({
                name: 'ag-Grid Is Great', action: function() { console.log('ag-Grid is great was selected'); }
            });
            athleteMenuItems.push({
                name: 'Casio Watch', action: function() { console.log('People who wear casio watches are cool'); }
            });
            athleteMenuItems.push({
                name: 'Custom Sub Menu',
                subMenu: [
                    { name: 'Black', action: function() { console.log('Black was pressed'); } },
                    { name: 'White', action: function() { console.log('White was pressed'); } },
                    { name: 'Grey', action: function() { console.log('Grey was pressed'); } }
                ]
            });
            return athleteMenuItems;

        // return some dummy items
        case 'age':
            return [
                { // our own item with an icon
                    name: 'Joe Abercrombie',
                    action: function() { console.log('He wrote a book'); },
                    icon: '<img src="../images/lab.png" style="width: 14px;"/>'
                },
                { // our own icon with a check box
                    name: 'Larsson',
                    action: function() { console.log('He also wrote a book'); },
                    checked: true
                },
                'resetColumns' // a built in item
            ];

        // return all the default items, but remove app seperators and the two sub menus
        case 'country':
            var countryMenuItems = [];
            var itemsToExclude = ['separator', 'pinSubMenu', 'valueAggSubMenu'];
            params.defaultItems.forEach(function(item) {
                if (itemsToExclude.indexOf(item) < 0) {
                    countryMenuItems.push(item);
                }
            });
            return countryMenuItems;

        default:
            // make no changes, just accept the defaults
            return params.defaultItems;
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
