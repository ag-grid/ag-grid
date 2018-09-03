document.addEventListener('DOMContentLoaded', function () {
    gridDiv = document.querySelector('#myGrid');

    new agGrid.Grid(gridDiv, gridOptions);
    createData();
});

var gridDiv;
var colNames = ["Station", "Railway", "Street", "Address", "Toy", "Soft Box", "Make and Model", "Longest Day", "Shortest Night"];

var countries = [
    { country: "Ireland", continent: "Europe", language: "English" },
    { country: "Spain", continent: "Europe", language: "Spanish" },
    { country: "United Kingdom", continent: "Europe", language: "English" },
    { country: "France", continent: "Europe", language: "French" },
    { country: "Germany", continent: "Europe", language: "German" },
    { country: "Luxembourg", continent: "Europe", language: "French" },
    { country: "Sweden", continent: "Europe", language: "Swedish" },
    { country: "Norway", continent: "Europe", language: "Norwegian" },
    { country: "Italy", continent: "Europe", language: "Italian" },
    { country: "Greece", continent: "Europe", language: "Greek" },
    { country: "Iceland", continent: "Europe", language: "Icelandic" },
    { country: "Portugal", continent: "Europe", language: "Portuguese" },
    { country: "Malta", continent: "Europe", language: "Maltese" },
    { country: "Brazil", continent: "South America", language: "Portuguese" },
    { country: "Argentina", continent: "South America", language: "Spanish" },
    { country: "Colombia", continent: "South America", language: "Spanish" },
    { country: "Peru", continent: "South America", language: "Spanish" },
    { country: "Venezuela", continent: "South America", language: "Spanish" },
    { country: "Uruguay", continent: "South America", language: "Spanish" },
    { country: "Belgium", continent: "Europe", language: "French" }
];

var games = ["Chess", "Cross and Circle", "Daldøs", "Downfall", "DVONN", "Fanorona", "Game of the Generals", "Ghosts",
    "Abalone", "Agon", "Backgammon", "Battleship", "Blockade", "Blood Bowl", "Bul", "Camelot", "Checkers",
    "Go", "Gipf", "Guess Who?", "Hare and Hounds", "Hex", "Hijara", "Isola", "Janggi (Korean Chess)", "Le Jeu de la Guerre",
    "Patolli", "Plateau", "PÜNCT", "Rithmomachy", "Sáhkku", "Senet", "Shogi", "Space Hulk", "Stratego", "Sugoroku",
    "Tâb", "Tablut", "Tantrix", "Wari", "Xiangqi (Chinese chess)", "YINSH", "ZÈRTZ", "Kalah", "Kamisado", "Liu po",
    "Lost Cities", "Mad Gab", "Master Mind", "Nine Men's Morris", "Obsession", "Othello"
];
var booleanValues = [true, "true", false, "false"];

var firstNames = ["Sophie", "Isabelle", "Emily", "Olivia", "Lily", "Chloe", "Isabella",
    "Amelia", "Jessica", "Sophia", "Ava", "Charlotte", "Mia", "Lucy", "Grace", "Ruby",
    "Ella", "Evie", "Freya", "Isla", "Poppy", "Daisy", "Layla"];
var lastNames = ["Beckham", "Black", "Braxton", "Brennan", "Brock", "Bryson", "Cadwell",
    "Cage", "Carson", "Chandler", "Cohen", "Cole", "Corbin", "Dallas", "Dalton", "Dane",
    "Donovan", "Easton", "Fisher", "Fletcher", "Grady", "Greyson", "Griffin", "Gunner",
    "Hayden", "Hudson", "Hunter", "Jacoby", "Jagger", "Jaxon", "Jett", "Kade", "Kane",
    "Keating", "Keegan", "Kingston", "Kobe"];

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var dataSize = '.1x22';

var size = 'fill'; // model for size select
var width = '100%'; // the div gets its width and height from here
var height = '100%';

var rowSelection = 'checkbox';

var groupColumn = {
    headerName: "Group",
    width: 200,
    field: 'name',
    valueGetter: function (params) {
        if (params.node.group) {
            return params.node.key;
        } else {
            return params.data[params.colDef.field];
        }
    },
    cellRenderer: 'agGroupCellRenderer',
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    cellRendererParams: {
        checkbox: true
    }
};

var gridOptions = {
    components: {
        personFilter: PersonFilter
    },
    floatingFilter: true,
    suppressEnterprise: true,
    rowGroupPanelShow: 'always', // on of ['always','onlyWhenGrouping']
    pivotPanelShow: 'always', // on of ['always','onlyWhenPivoting']
    enableRtl: true,
    animateRows: true,
    enableColResize: true, //one of [true, false]
    enableSorting: true, //one of [true, false]
    enableFilter: true, //one of [true, false]
    statusBar: {
        items: [
            { component: 'agAggregationComponent' }
        ]
    },
    enableRangeSelection: true,
    rowSelection: "multiple", // one of ['single','multiple'], leave blank for no selection
    rowDeselection: true,
    quickFilterText: null,
    groupSelectsChildren: true, // one of [true, false]
    suppressRowClickSelection: true, // if true, clicking rows doesn't select (useful for checkbox selection)
    autoGroupColumnDef: groupColumn,
    showToolPanel: true,
    checkboxSelection: function (params) {
        // we show checkbox selection in the first column, unless we are grouping,
        // as the group column is configured to always show selection
        var isGrouping = gridOptions.columnApi.getRowGroupColumns().length > 0;
        return params.colIndex === 0 && !isGrouping;
    },
    onRowSelected: rowSelected, //callback when row selected
    onSelectionChanged: selectionChanged, //callback when selection changed,
    getBusinessKeyForNode: function (node) {
        if (node.data) {
            return node.data.name;
        } else {
            return '';
        }
    },
    // suppressRowHoverClass: true,
    // isScrollLag: function() { return true; },
    // suppressScrollLag: true,
    // floatingTopRowData: [{},{},{}],
    // floatingBottomRowData: [{},{},{}],
    // callback when row clicked
    onRowClicked: function (params) {
        // console.log("Callback onRowClicked: " + (params.data?params.data.name:null) + " - " + params.event);
    },
    // onSortChanged: function (params) {
    //     console.log("Callback onSortChanged");
    // },
    onRowDoubleClicked: function (params) {
        // console.log("Callback onRowDoubleClicked: " + params.data.name + " - " + params.event);
    },
    // callback when cell clicked
    onCellClicked: function (params) {
        // console.log("Callback onCellClicked: " + params.value + " - " + params.colDef.field + ' - ' + params.event);
    },
    onRowDataChanged: function (params) {
        console.log('Callback onRowDataChanged: ');
    },
    // callback when cell double clicked
    onCellDoubleClicked: function (params) {
        // console.log("Callback onCellDoubleClicked: " + params.value + " - " + params.colDef.field + ' - ' + params.event);
    },
    // callback when cell right clicked
    onCellContextMenu: function (params) {
        console.log("Callback onCellContextMenu: " + params.value + " - " + params.colDef.field + ' - ' + params.event);
    },
    onCellFocused: function (params) {
        // console.log('Callback onCellFocused: ' + params.rowIndex + " - " + params.colIndex);
    },
    onGridReady: function (event) {
        console.log('Callback onGridReady: api = ' + event.api);
        //event.api.addGlobalListener(function(type, event) {
        //    console.log('event ' + type);
        //});
    },
    onGridSizeChanged: function (event) {
        console.log('Callback onGridSizeChanged: clientWidth = ' + event.clientWidth + ', clientHeight = ' + event.clientHeight);
    },
    onRowGroupOpened: function (event) {
        console.log('Callback onRowGroupOpened: node = ' + event.node.key + ', ' + event.node.expanded);
    },
    onRangeSelectionChanged: function (event) {
        // console.log('Callback onRangeSelectionChanged: finished = ' + event.finished);
    },
    getContextMenuItems: getContextMenuItems
};

function getContextMenuItems(params) {
    var result = params.defaultItems.splice(0);
    result.push(
        {
            name: 'Custom Menu Item',
            icon: '<img src="../../images/lab.png" style="width: 14px;"/>',
            //shortcut: 'Alt + M',
            action: function () {
                var value = params.value ? params.value : '<empty>';
                window.alert('You clicked a custom menu item on cell ' + value);
            }
        }
    );

    return result;
}

var firstColumn = {
    headerName: 'Name',
    field: 'name',
    width: 200,
    editable: true,
    enableRowGroup: true,
    // enablePivot: true,
    filter: 'personFilter',
    checkboxSelection: function (params) {
        // we put checkbox on the name if we are not doing no grouping
        return params.columnApi.getRowGroupColumns().length === 0;
    },
    headerCheckboxSelection: function (params) {
        // we put checkbox on the name if we are not doing grouping
        return params.columnApi.getRowGroupColumns().length === 0;
    },
    headerCheckboxSelectionFilteredOnly: true,
    icons: {
        sortAscending: '<i class="fa fa-sort-alpha-asc"/>',
        sortDescending: '<i class="fa fa-sort-alpha-desc"/>'
    }
};


var defaultCols = [
    {
        // column group 'Participant
        headerName: 'Participant',
        // marryChildren: true,
        children: [
            firstColumn,
            {
                headerName: "Language", field: "language", width: 150, editable: true, filter: 'agSetColumnFilter',
                cellRenderer: languageCellRenderer,
                cellEditor: 'agSelectCellEditor',
                enableRowGroup: true,
                enablePivot: true,
                // rowGroupIndex: 0,
                // pivotIndex: 0,
                cellEditorParams: {
                    values: ['English', 'Spanish', 'French', 'Portuguese', 'German',
                        'Swedish', 'Norwegian', 'Italian', 'Greek', 'Icelandic', 'Portuguese', 'Maltese']
                },
                pinned: 'right',
                headerTooltip: "Example tooltip for Language",
                filterParams: { newRowsAction: 'keep' }
            },
            {
                headerName: "Country", field: "country", width: 150, editable: true,
                cellRenderer: CountryCellRenderer,
                // pivotIndex: 1,
                // rowGroupIndex: 1,
                enableRowGroup: true,
                enablePivot: true,
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: {
                    cellRenderer: CountryCellRenderer,
                    values: ["Argentina", "Brazil", "Colombia", "France", "Germany", "Greece", "Iceland", "Ireland",
                        "Italy", "Malta", "Portugal", "Norway", "Peru", "Spain", "Sweden", "United Kingdom",
                        "Uruguay", "Venezuela", "Belgium", "Luxembourg"]
                },
                // pinned: 'left',
                floatCell: true,
                filterParams: {
                    cellRenderer: CountryCellRenderer,
                    cellHeight: 20,
                    newRowsAction: 'keep'
                }
            }
        ]
    },
    {
        // column group 'Game of Choice'
        headerName: 'Game of Choice',
        children: [
            {
                headerName: "Game Name", field: "game.name", width: 180, editable: true, filter: 'agSetColumnFilter',
                tooltipField: 'game.name',
                cellClass: function () {
                    return 'alphabet';
                },
                enableRowGroup: true,
                enablePivot: true,
                pinned: 'left',
                // rowGroupIndex: 1,
                icons: {
                    sortAscending: '<i class="fa fa-sort-alpha-asc"/>',
                    sortDescending: '<i class="fa fa-sort-alpha-desc"/>'
                }
            },
            {
                headerName: "Bought", field: "game.bought", filter: 'agSetColumnFilter', editable: true, width: 100,
                // pinned: 'right',
                // rowGroupIndex: 2,
                // pivotIndex: 1,
                enableRowGroup: true,
                enablePivot: true,
                enableValue: true,
                cellRenderer: booleanCellRenderer, cellStyle: { "text-align": "center" }, comparator: booleanComparator,
                floatCell: true,
                filterParams: { newRowsAction: 'keep', cellRenderer: booleanFilterCellRenderer }
            }
        ]
    },
    {
        // column group 'Performance'
        headerName: 'Performance',
        groupId: 'performance',
        children: [
            {
                headerName: "Bank Balance", field: "bankBalance", width: 150, editable: true,
                filter: WinningsFilter, cellRenderer: currencyRenderer, cellStyle: currencyCssFunc,
                filterParams: { cellRenderer: currencyRenderer },
                enableValue: true,
                // colId: 'sf',
                // valueGetter: '55',
                // aggFunc: 'sum',
                icons: {
                    sortAscending: '<i class="fa fa-sort-amount-asc"/>',
                    sortDescending: '<i class="fa fa-sort-amount-desc"/>'
                }
            },
            {
                headerName: "Extra Info 1", columnGroupShow: 'open', width: 150, editable: false,
                suppressSorting: true, suppressMenu: true, cellStyle: { "text-align": "right" },
                cellRenderer: function () { return 'Abra...'; }
            },
            {
                headerName: "Extra Info 2", columnGroupShow: 'open', width: 150, editable: false,
                suppressSorting: true, suppressMenu: true, cellStyle: { "text-align": "left" },
                cellRenderer: function () { return '...cadabra!'; }
            }
        ],
    },
    {
        headerName: "Rating", field: "rating", width: 100, editable: true, cellRenderer: ratingRenderer,
        floatCell: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        filterParams: { cellRenderer: ratingFilterRenderer }
    },
    {
        headerName: "Total Winnings", field: "totalWinnings", filter: 'agNumberColumnFilter',
        editable: true, newValueHandler: numberNewValueHandler, width: 150,
        // aggFunc: 'sum',
        enableValue: true,
        cellRenderer: currencyRenderer, cellStyle: currencyCssFunc,
        icons: {
            sortAscending: '<i class="fa fa-sort-amount-asc"/>',
            sortDescending: '<i class="fa fa-sort-amount-desc"/>'
        }
    }
];
//put in the month cols
var monthGroup = {
    headerName: 'Monthly Breakdown',
    children: []
};
defaultCols.push(monthGroup);
months.forEach(function (month) {
    monthGroup.children.push({
        headerName: month, field: month.toLocaleLowerCase(),
        width: 100, filter: 'agNumberColumnFilter', editable: true,
        enableValue: true,
        // aggFunc: 'sum',
        //hide: true,
        cellClassRules: {
            'good-score': 'typeof x === "number" && x > 50000',
            'bad-score': 'typeof x === "number" && x < 10000'
        },
        newValueHandler: numberNewValueHandler, cellRenderer: currencyRenderer,
        filterCellRenderer: currencyRenderer,
        cellStyle: { "text-align": "right" }
    })
});

function filterDoubleClicked(event) {
    setInterval(function () {
        gridOptions.api.ensureIndexVisible(Math.floor(Math.random() * 100000));
    }, 4000);
}

function onDataSizeChanged(newDataSize) {
    dataSize = newDataSize;
    createData();
}

function toggleToolPanel() {
    var showing = gridOptions.api.isToolPanelShowing();
    gridOptions.api.showToolPanel(!showing);
}

function getColCount() {
    switch (dataSize) {
        case '10x100':
            return 100;
        default:
            return 22;
    }
}

function getRowCount() {
    switch (dataSize) {
        case '.1x22':
            return 100;
        case '1x22':
            return 1000;
        case '10x100':
            return 10000;
        case '100x22':
            return 100000;
        default:
            return -1;
    }
}

function createCols() {
    var colCount = getColCount();
    // start with a copy of the default cols
    var columns = defaultCols.slice(0, colCount);

    // there are 22 cols by default
    for (var col = 22; col < colCount; col++) {
        var colName = colNames[col % colNames.length];
        var colDef = { headerName: colName, field: "col" + col, width: 200, editable: true };
        columns.push(colDef);
    }

    return columns;
}

var loadInstance = 0;

function createData() {

    loadInstance++;

    var loadInstanceCopy = loadInstance;
    gridOptions.api.showLoadingOverlay();

    var colDefs = createCols();

    var rowCount = getRowCount();
    var colCount = getColCount();

    var row = 0;
    var data = [];

    var intervalId = setInterval(function () {
        if (loadInstanceCopy != loadInstance) {
            clearInterval(intervalId);
            return;
        }

        for (var i = 0; i < 1000; i++) {
            if (row < rowCount) {
                var rowItem = createRowItem(row, colCount);
                data.push(rowItem);
                row++;
            }
        }

        if (row >= rowCount) {
            clearInterval(intervalId);
            setTimeout(function () {
                gridOptions.api.setColumnDefs(colDefs);
                gridOptions.api.setRowData(data);
            }, 0);
        }

    }, 0);
}

function createRowItem(row, colCount) {
    var rowItem = {};

    //create data for the known columns
    var countriesToPickFrom = Math.floor(countries.length * ((row % 3 + 1) / 3));
    var countryData = countries[(row * 19) % countriesToPickFrom];
    rowItem.country = countryData.country;
    rowItem.continent = countryData.continent;
    rowItem.language = countryData.language;

    var firstName = firstNames[row % firstNames.length];
    var lastName = lastNames[row % lastNames.length];
    rowItem.name = firstName + " " + lastName;

    rowItem.game = {
        name: games[Math.floor(row * 13 / 17 * 19) % games.length],
        bought: booleanValues[row % booleanValues.length]
    };

    rowItem.bankBalance = ((Math.round(pseudoRandom() * 10000000)) / 100) - 3000;
    rowItem.rating = (Math.round(pseudoRandom() * 5));

    var totalWinnings = 0;
    months.forEach(function (month) {
        var value = ((Math.round(pseudoRandom() * 10000000)) / 100) - 20;
        rowItem[month.toLocaleLowerCase()] = value;
        totalWinnings += value;
    });
    rowItem.totalWinnings = totalWinnings;

    //create dummy data for the additional columns
    for (var col = defaultCols.length; col < colCount; col++) {
        var value;
        var randomBit = pseudoRandom().toString().substring(2, 5);
        value = colNames[col % colNames.length] + "-" + randomBit + " - (" + (row + 1) + "," + col + ")";
        rowItem["col" + col] = value;
    }

    return rowItem;
}

// taken from http://stackoverflow.com/questions/3062746/special-simple-random-number-generator
var seed = 123456789;
var m = Math.pow(2, 32);
var a = 1103515245;
var c = 12345;
function pseudoRandom() {
    seed = (a * seed + c) % m;
    return seed / m;
}

function selectionChanged(event) {
    console.log('Callback selectionChanged: selection count = ' + gridOptions.api.getSelectedNodes().length);
}

function rowSelected(event) {
    // the number of rows selected could be huge, if the user is grouping and selects a group, so
    // to stop the console from clogging up, we only print if in the first 10 (by chance we know
    // the node id's are assigned from 0 upwards)
    if (event.node.id < 10) {
        var valueToPrint = event.node.group ? 'group (' + event.node.key + ')' : event.node.data.name;
        console.log("Callback rowSelected: " + valueToPrint);
    }
}

function onThemeChanged(newTheme) {
    gridDiv.className = newTheme;
    if (newTheme === 'ag-theme-material') {
        gridOptions.rowHeight = 48;
        // gridOptions.icons.checkboxChecked = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AUZEBAL/ldO7gAAAEpJREFUKM9jZJjW8Z+BDMDEQCagrcb/meUM/zPL6WQjzCbG6Z10sBGXbRgasQUCLsCCzyZctmHYiEsRUX5E1ozPIKxOJcZmsqMDAKbtFz19uHD9AAAAAElFTkSuQmCC"/>';
        gridOptions.icons.checkboxChecked = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxMTQzMkY1NDIyMjhFNjExQkVGOEFCQUI5MzdBNjFEMSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoyMzBBQkU2ODI4MjQxMUU2QjlDRUZCNUFDREJGRTVDMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyMzBBQkU2NzI4MjQxMUU2QjlDRUZCNUFDREJGRTVDMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjE0NDMyRjU0MjIyOEU2MTFCRUY4QUJBQjkzN0E2MUQxIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjExNDMyRjU0MjIyOEU2MTFCRUY4QUJBQjkzN0E2MUQxIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+O+zv0gAAAQ1JREFUeNpilJvw35OBgWEuEEsyEAeeA3EyI1DjMxI0wTUzkaEJBCSZiFVpJcvAsDqEgUFVCMInSqOeOAPDLG8GBjNpBoZCCyI1KggwMCzwZ2DgZWdgOPWUgaF4F5pGDxWgqT4MDPzsSB7hYWBYHMDAIMzJwHDjDQND0mYGhu9/0DT6qTEwuCszMOyIZmAwkoTYALJJjp+B4cEHBoaEjQwMn38iDAVFx38wA4gzTBgYSiwhEi++MDDI8DEwvP3OwBC0CqIZGcBtBOmefoaBIXQNA8PvfxBNf4B03AZMTVgD5xwwXcQDFX/8wcAw+RQDw5VX2AMN7lRSARM07ZEKXoA0poAYJGh6CkrkAAEGAKNeQxaS7i+xAAAAAElFTkSuQmCC"/>';
    } else {
        gridOptions.rowHeight = 25;
        gridOptions.icons.checkboxChecked = undefined;
        gridOptions.icons.checkboxIndeterminate = undefined;
    }
    gridOptions.api.resetRowHeights();
    gridOptions.api.redrawRows();
}

var filterCount = 0;
function onFilterChanged(newFilter) {
    filterCount++;
    var filterCountCopy = filterCount;
    setTimeout(function () {
        if (filterCount === filterCountCopy) {
            gridOptions.api.setQuickFilter(newFilter);
        }
    }, 300);
}

var COUNTRY_CODES = {
    Ireland: "ie",
    Luxembourg: "lu",
    Belgium: "be",
    Spain: "es",
    "United Kingdom": "gb",
    France: "fr",
    Germany: "de",
    Sweden: "se",
    Italy: "it",
    Greece: "gr",
    Iceland: "is",
    Portugal: "pt",
    Malta: "mt",
    Norway: "no",
    Brazil: "br",
    Argentina: "ar",
    Colombia: "co",
    Peru: "pe",
    Venezuela: "ve",
    Uruguay: "uy"
};

function numberNewValueHandler(params) {
    var newValue = params.newValue;
    var valueAsNumber;
    if (newValue === null || newValue === undefined || newValue === '') {
        valueAsNumber = null;
    } else {
        valueAsNumber = parseFloat(params.newValue);
    }
    var field = params.colDef.field;
    var data = params.data;
    data[field] = valueAsNumber;
}

function PersonFilter() {
}

PersonFilter.prototype.init = function (params) {
    this.valueGetter = params.valueGetter;
    this.filterText = null;
    this.setupGui(params);
};

// not called by ag-Grid, just for us to help setup
PersonFilter.prototype.setupGui = function (params) {
    this.gui = document.createElement('div');
    this.gui.innerHTML =
        '<div style="padding: 4px;">' +
        '<div style="font-weight: bold;">Custom Athlete Filter</div>' +
        '<div><input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Full name search..."/></div>' +
        '<div style="margin-top: 20px; width: 200px;">This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>' +
        '<div style="margin-top: 20px; width: 200px;">Just to iterate anything can go in here, here is an image:</div>' +
        '<div><img src="images/ag-Grid2-200.png" style="width: 150px; text-align: center; padding: 10px; margin: 10px; border: 1px solid lightgrey;"/></div>' +
        '</div>';

    this.eFilterText = this.gui.querySelector('#filterText');
    this.eFilterText.addEventListener("changed", listener);
    this.eFilterText.addEventListener("paste", listener);
    this.eFilterText.addEventListener("input", listener);
    // IE doesn't fire changed for special keys (eg delete, backspace), so need to
    // listen for this further ones
    this.eFilterText.addEventListener("keydown", listener);
    this.eFilterText.addEventListener("keyup", listener);

    var that = this;

    function listener(event) {
        that.filterText = event.target.value;
        params.filterChangedCallback();
    }
};

PersonFilter.prototype.getGui = function () {
    return this.gui;
};

PersonFilter.prototype.doesFilterPass = function (params) {
    // make sure each word passes separately, ie search for firstname, lastname
    var passed = true;
    var valueGetter = this.valueGetter;
    this.filterText.toLowerCase().split(" ").forEach(function (filterWord) {
        var value = valueGetter(params);
        if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
            passed = false;
        }
    });

    return passed;
};

PersonFilter.prototype.isFilterActive = function () {
    var isActive = this.filterText !== null && this.filterText !== undefined && this.filterText !== '';
    return isActive;
};

PersonFilter.prototype.getApi = function () {
    var that = this;
    return {
        getModel: function () {
            var model = { value: that.filterText.value };
            return model;
        },
        setModel: function (model) {
            that.eFilterText.value = model.value;
        }
    }
};

// lazy, the example doesn't use getModel() and setModel()
PersonFilter.prototype.getModel = function () { };
PersonFilter.prototype.setModel = function () { };

function WinningsFilter() {
}

WinningsFilter.prototype.init = function (params) {

    var uniqueId = Math.random();
    this.filterChangedCallback = params.filterChangedCallback;
    this.eGui = document.createElement("div");
    this.eGui.innerHTML =
        '<div style="padding: 4px;">' +
        '<div style="font-weight: bold;">Example Custom Filter</div>' +
        '<div><label><input type="radio" name="filter"' + uniqueId + ' id="cbNoFilter">No filter</input></label></div>' +
        '<div><label><input type="radio" name="filter"' + uniqueId + ' id="cbPositive">Positive</input></label></div>' +
        '<div><label><input type="radio" name="filter"' + uniqueId + ' id="cbNegative">Negative</input></label></div>' +
        '<div><label><input type="radio" name="filter"' + uniqueId + ' id="cbGreater50">&gt; &pound;50,000</label></div>' +
        '<div><label><input type="radio" name="filter"' + uniqueId + ' id="cbGreater90">&gt; &pound;90,000</label></div>' +
        '</div>';
    this.cbNoFilter = this.eGui.querySelector('#cbNoFilter');
    this.cbPositive = this.eGui.querySelector('#cbPositive');
    this.cbNegative = this.eGui.querySelector('#cbNegative');
    this.cbGreater50 = this.eGui.querySelector('#cbGreater50');
    this.cbGreater90 = this.eGui.querySelector('#cbGreater90');
    this.cbNoFilter.checked = true; // initialise the first to checked
    this.cbNoFilter.onclick = this.filterChangedCallback;
    this.cbPositive.onclick = this.filterChangedCallback;
    this.cbNegative.onclick = this.filterChangedCallback;
    this.cbGreater50.onclick = this.filterChangedCallback;
    this.cbGreater90.onclick = this.filterChangedCallback;
    this.valueGetter = params.valueGetter;
};

WinningsFilter.prototype.getGui = function () {
    return this.eGui;
};

WinningsFilter.prototype.doesFilterPass = function (node) {
    var value = this.valueGetter(node);
    if (this.cbNoFilter.checked) {
        return true;
    } else if (this.cbPositive.checked) {
        return value >= 0;
    } else if (this.cbNegative.checked) {
        return value < 0;
    } else if (this.cbGreater50.checked) {
        return value >= 50000;
    } else if (this.cbGreater90.checked) {
        return value >= 90000;
    } else {
        console.error('invalid checkbox selection');
    }
};

WinningsFilter.prototype.isFilterActive = function () {
    return !this.cbNoFilter.checked;
};

// lazy, the example doesn't use getModel() and setModel()
WinningsFilter.prototype.getModel = function () { };
WinningsFilter.prototype.setModel = function () { };

function currencyCssFunc(params) {
    if (params.value !== null && params.value !== undefined && params.value < 0) {
        return { "color": "red", "text-align": "right", "font-weight": "bold" };
    } else {
        return { "text-align": "right" };
    }
}

function ratingFilterRenderer(params) {
    return ratingRendererGeneral(params.value, true)
}

function ratingRenderer(params) {
    return ratingRendererGeneral(params.value, false)
}

function ratingRendererGeneral(value, forFilter) {
    var result = '<span>';
    for (var i = 0; i < 5; i++) {
        if (value > i) {
            result += '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/images/goldStar.png"/>';
        }
    }
    if (forFilter && value === 0) {
        result += '(no stars)';
    }
    return result;
}

function currencyRenderer(params) {
    if (params.value === null || params.value === undefined) {
        return null;
    } else if (isNaN(params.value)) {
        return 'NaN';
    } else {
        // if we are doing 'count', then we do not show pound sign
        if (params.node.group && params.column.aggFunc === 'count') {
            return params.value;
        } else {
            return '&pound;' + Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        }
    }
}

function booleanComparator(value1, value2) {
    var value1Cleaned = booleanCleaner(value1);
    var value2Cleaned = booleanCleaner(value2);
    var value1Ordinal = value1Cleaned === true ? 0 : (value1Cleaned === false ? 1 : 2);
    var value2Ordinal = value2Cleaned === true ? 0 : (value2Cleaned === false ? 1 : 2);
    return value1Ordinal - value2Ordinal;
}

var count = 0;

function booleanCellRenderer(params) {
    count++;
    if (count <= 1) {
        // params.api.onRowHeightChanged();
    }

    var valueCleaned = booleanCleaner(params.value);
    if (valueCleaned === true) {
        //this is the unicode for tick character
        return "<span title='true'>&#10004;</span>";
    } else if (valueCleaned === false) {
        //this is the unicode for cross character
        return "<span title='false'>&#10006;</span>";
    } else if (params.value !== null && params.value !== undefined) {
        return params.value.toString();
    } else {
        return null;
    }
}

function booleanFilterCellRenderer(params) {
    var valueCleaned = booleanCleaner(params.value);
    if (valueCleaned === true) {
        //this is the unicode for tick character
        return "&#10004;";
    } else if (valueCleaned === false) {
        //this is the unicode for cross character
        return "&#10006;";
    } else {
        return "(empty)";
    }
}

function booleanCleaner(value) {
    if (value === "true" || value === true || value === 1) {
        return true;
    } else if (value === "false" || value === false || value === 0) {
        return false;
    } else {
        return null;
    }
}

function languageCellRenderer(params) {
    if (params.$scope) {
        return "<span ng-click='clicked=true' ng-show='!clicked'>Click Me</span>" +
            "<span ng-click='clicked=false' ng-show='clicked' ng-bind='data.language'></span>";
    } else if (params.value !== null && params.value !== undefined) {
        return params.value;
    } else {
        return null;
    }
}

function countryCellRenderer(params) {
    //get flags from here: http://www.freeflagicons.com/
    if (params.value === "" || params.value === undefined || params.value === null) {
        return null;
    } else {
        var flag = '<img border="0" width="15" height="10" src="https://flags.fmcdn.net/data/flags/mini/' + COUNTRY_CODES[params.value] + '.png">';
        return '<span style="cursor: default;">' + flag + ' ' + params.value + '</span>';
    }
}

function CountryCellRenderer() {
    this.eGui = document.createElement('span');
    this.eGui.style.cursor = 'default';
}

CountryCellRenderer.prototype.init = function (params) {
    //get flags from here: http://www.freeflagicons.com/
    if (params.value === "" || params.value === undefined || params.value === null) {
        this.eGui.innerHTML = '';
    } else {
        var flag = '<img border="0" width="15" height="10" src="https://flags.fmcdn.net/data/flags/mini/' + COUNTRY_CODES[params.value] + '.png">';
        this.eGui.innerHTML = flag + ' ' + params.value;
    }
};

CountryCellRenderer.prototype.getGui = function () {
    return this.eGui;
};
