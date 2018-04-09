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

var games = ["Chess", "Cross and Circle", "Daldos", "Downfall", "DVONN", "Fanorona", "Game of the Generals", "Ghosts",
    "Abalone", "Agon", "Backgammon", "Battleship", "Blockade", "Blood Bowl", "Bul", "Camelot", "Checkers",
    "Go", "Gipf", "Guess Who?", "Hare and Hounds", "Hex", "Hijara", "Isola", "Janggi (Korean Chess)", "Le Jeu de la Guerre",
    "Patolli", "Plateau", "PUNCT", "Rithmomachy", "Sahkku", "Senet", "Shogi", "Space Hulk", "Stratego", "Sugoroku",
    "Tab", "Tablut", "Tantrix", "Wari", "Xiangqi (Chinese chess)", "YINSH", "ZERTZ", "Kalah", "Kamisado", "Liu po",
    "Lost Cities", "Mad Gab", "Master Mind", "Nine Men's Morris", "Obsession", "Othello"
];
var booleanValues = [true, "true", false, "false"];

var firstNames = ["Tony", "Andrew", "Kevin", "Bricker", "Dimple", "Bas", "Sophie", "Isabelle", "Emily", "Olivia", "Lily", "Chloe", "Isabella",
    "Amelia", "Jessica", "Sophia", "Ava", "Charlotte", "Mia", "Lucy", "Grace", "Ruby",
    "Ella", "Evie", "Freya", "Isla", "Poppy", "Daisy", "Layla"];
var lastNames = ["Smith", "Connell", "Flanagan", "McGee", "Unalkat", "Rahman", "Beckham", "Black", "Braxton", "Brennan", "Brock", "Bryson", "Cadwell",
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
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
        checkbox: true
    }
};

//var aVisible = true;
//setTimeout( function() {
//    var start = new Date().getTime();
//    console.log('start');
//    aVisible = !aVisible;
//    gridOptions.columnApi.setColumnsVisible(gridOptions.columnApi.getAllColumns(), aVisible);
//    //gridOptions.columnApi.getAllColumns().forEach( function(column) {
//    //    gridOptions.columnApi.setColumnVisible(column, aVisible);
//    //});
//    var end = new Date().getTime();
//    console.log('end ' + (end - start));
//}, 5000);

// the moving animation looks crap on IE, firefox and safari, so we turn it off in the demo for them
function suppressColumnMoveAnimation() {
    var isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    return isFirefox || isSafari || isIE;
}

var gridOptions = {
    components: {
        personFilter: PersonFilter,
        personFloatingFilterComponent: PersonFloatingFilterComponent,
        countryCellRenderer: countryCellRenderer,
        countryFloatingFilterComponent: CountryFloatingFilterComponent,
        booleanCellRenderer: booleanCellRenderer,
        booleanFilterCellRenderer: booleanFilterCellRenderer,
        winningsFilter: WinningsFilter,
        ratingRenderer: ratingRenderer,
        ratingFilterRenderer: ratingFilterRenderer
    },
    defaultExportParams:{
        columnGroups: true
    },
    defaultColDef: {
        minWidth: 50
    },
    enableCellChangeFlash: true,
    rowDragManaged: true,
    // ensureDomOrder: true,
    // postProcessPopup: function(params) {
    //     console.log(params);
    // },
    // need to be careful here inside the normal demo, as names are not unique if big data sets
    // getRowNodeId: function(data) {
    //     return data.name;
    // },
    // suppressAsyncEvents: true,
    // suppressAggAtRootLevel: true,
    floatingFilter: true,
    //debug: true,
    //     editType: 'fullRow',
    //     debug: true,
    //     suppressMultiRangeSelection: true,
    rowGroupPanelShow: 'always', // on of ['always','onlyWhenGrouping']
    pivotPanelShow: 'always', // on of ['always','onlyWhenPivoting']
    pivotTotals: true,
    //minColWidth: 50,
    //maxColWidth: 300,
    rowBuffer: 10,
    //columnDefs: [],
    //singleClickEdit: true,
    // suppressClickEdit: true,
    //rowData: [
    //    {name: 'Niall'},
    //    {name: 'Eamon'},
    //    {name: 'Kevin'},
    //    {name: 'Brian'}
    //],
    enterMovesDownAfterEdit: true,
    enterMovesDown: true,
    // groupUseEntireRow: true, //one of [true, false]
    //        groupDefaultExpanded: 9999, //one of [true, false], or an integer if greater than 1
    //            headerHeight: 100, // set to an integer, default is 25, or 50 if grouping columns
    //        groupSuppressAutoColumn: true,
    //groupSuppressBlankHeader: true,
    //suppressMovingCss: true,
    //suppressMovableColumns: true,
    //groupIncludeFooter: true,
    suppressColumnMoveAnimation: suppressColumnMoveAnimation(),
    // suppressTouch: true,
    // suppressDragLeaveHidesColumns: true,
    // suppressMakeColumnVisibleAfterUnGroup: true,
    //unSortIcon: true,
    //     enableRtl: true,
    multiSortKey: 'ctrl',
    animateRows: true,
    enableColResize: true, //one of [true, false]
    enableSorting: true, //one of [true, false]
    enableFilter: true, //one of [true, false]
    enableStatusBar: true,
    enableRangeSelection: true,
    rowSelection: "multiple", // one of ['single','multiple'], leave blank for no selection
    rowDeselection: true,
    quickFilterText: null,
    groupSelectsChildren: true, // one of [true, false]
    // pagination: true,
    // embedFullWidthRows: true,
    // groupSelectsFiltered: true,
    suppressRowClickSelection: true, // if true, clicking rows doesn't select (useful for checkbox selection)
    // suppressColumnVirtualisation: true,
    //suppressContextMenu: true,
    //suppressFieldDotNotation: true,
    autoGroupColumnDef: groupColumn,
    //suppressCellSelection: true,
    //suppressMultiSort: true,
    showToolPanel: true,//window.innerWidth > 1000,
    // toolPanelSuppressColumnFilter: true,
    // toolPanelSuppressColumnSelectAll: true,
    // toolPanelSuppressColumnExpandAll: true,
    //  autoSizePadding: 20,
    //toolPanelSuppressGroups: true,
    //toolPanelSuppressValues: true,
    //groupSuppressAutoColumn: true,
    //contractColumnSelection: true,
    //groupAggFields: ['bankBalance','totalWinnings'],
    //     groupMultiAutoColumn: true,
    //     groupHideOpenParents: true,
    //suppressMenuFilterPanel: true,
    //     clipboardDeliminator: ',',
    //suppressMenuMainPanel: true,
    //suppressMenuColumnPanel: true,
    //forPrint: true,
    //rowClass: function(params) { return (params.data.country === 'Ireland') ? "theClass" : null; },
    //headerCellRenderer: headerCellRenderer_text,
    //headerCellRenderer: headerCellRenderer_dom,
    onRowSelected: rowSelected, //callback when row selected
    onSelectionChanged: selectionChanged, //callback when selection changed,
    aggFuncs: {
        'zero': function () { return 0; }
    },
    getBusinessKeyForNode: function (node) {
        if (node.data) {
            return node.data.name;
        } else {
            return '';
        }
    },
    defaultGroupSortComparator: function(nodeA, nodeB) {
        if (nodeA.key < nodeB.key) {
            return -1;
        } else if (nodeA.key > nodeB.key) {
            return 1;
        } else {
            return 0;
        }
    },
    // rowHeight: 100,
    // suppressTabbing: true,
    // rowHoverClass: true,
    // layoutInterval: -1,
    // suppressAnimationFrame: true,
    //     pinnedTopRowData: [{},{},{}],
    //     pinnedBottomRowData: [{},{},{}],
    // callback when row clicked
    //     stopEditingWhenGridLosesFocus: true,
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
    onColumnVisible: function (event) {
        console.log("Callback onColumnVisible:", event);
    },
    onCellValueChanged: function (params) {
        console.log("Callback onCellValueChanged:", params);
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
    getContextMenuItems: getContextMenuItems,
    excelStyles: [
        {
            id: 'good-score',
            interior: {
                color: "#94e494", pattern: 'Solid'
            }
        },
        {
            id: 'bad-score',
            interior: {
                color: "#e49494", pattern: 'Solid'
            }
        },
        {
            id: 'header',
            interior: {
                color: "#CCCCCC", pattern: 'Solid'
            }
        }
    ]
};

function getContextMenuItems(params) {
    if (params.node == null) return null;
    var result = params.defaultItems.splice(0);
    result.push(
        {
            name: 'Custom Menu Item',
            icon: '<img src="images/lab.svg" style="width: 14px;"/>',
            //shortcut: 'Alt + M',
            action: function () {
                var value = params.value ? params.value : '<empty>';
                window.alert('You clicked a custom menu item on cell ' + value);
            }
        }
    );

    return result;
}

//var groupColumn = {
//    headerName: "Name", field: "name", headerGroup: 'Participant', width: 200, editable: true, filter: PersonFilter,
//    cellRenderer: {
//        renderer: "group",
//        checkbox: true
//    }
//};

var defaultCols = [
    // {
    //     headerName: 'Test Date',
    //     editable: true,
    //     cellEditor: 'date',
    //     field: 'testDate'
    // },
    //{headerName: "", valueGetter: "node.id", width: 20}, // this row is for showing node id, handy for testing
    {
        // column group 'Participant
        headerName: 'Participant',
        // marryChildren: true,
        children: [
            {
                headerName: 'Name',
                rowDrag: true,
                field: 'name',
                width: 200,
                editable: true,
                enableRowGroup: true,
                // enablePivot: true,
                filter: 'personFilter',
                floatingFilterComponent: 'personFloatingFilterComponent',
                checkboxSelection: function (params) {
                    // we put checkbox on the name if we are not doing grouping
                    return params.columnApi.getRowGroupColumns().length === 0;
                },
                headerCheckboxSelection: function (params) {
                    // we put checkbox on the name if we are not doing grouping
                    return params.columnApi.getRowGroupColumns().length === 0;
                },
                headerCheckboxSelectionFilteredOnly: true
            },
            {
                headerName: "Language", field: "language", width: 150, editable: true, filter: 'agSetColumnFilter',
                cellEditor: 'agSelectCellEditor',
                enableRowGroup: true,
                enablePivot: true,
                // rowGroupIndex: 0,
                // pivotIndex: 0,
                cellEditorParams: {
                    values: ['English', 'Spanish', 'French', 'Portuguese', 'German',
                        'Swedish', 'Norwegian', 'Italian', 'Greek', 'Icelandic', 'Portuguese', 'Maltese']
                },
                // pinned: 'left',
                headerTooltip: "Example tooltip for Language",
                filterParams: {
                    selectAllOnMiniFilter: true,
                    newRowsAction: 'keep',
                    clearButton: true
                }
            },
            {
                headerName: "Country", field: "country", width: 150, editable: true,
                cellRenderer: 'countryCellRenderer',
                // pivotIndex: 1,
                // rowGroupIndex: 1,
                enableRowGroup: true,
                enablePivot: true,
                cellEditor: 'agRichSelect',
                cellEditorParams: {
                    cellRenderer: 'countryCellRenderer',
                    values: ["Argentina", "Brazil", "Colombia", "France", "Germany", "Greece", "Iceland", "Ireland",
                        "Italy", "Malta", "Portugal", "Norway", "Peru", "Spain", "Sweden", "United Kingdom",
                        "Uruguay", "Venezuela", "Belgium", "Luxembourg"]
                },
                // pinned: 'left',
                floatCell: true,
                filterParams: {
                    applyButton:true,
                    cellRenderer: 'countryCellRenderer',
                    // cellHeight: 20,
                    newRowsAction: 'keep',
                    selectAllOnMiniFilter: true,
                    clearButton: true
                },
                floatingFilterComponent: 'countryFloatingFilterComponent',
                icons: {
                    sortAscending: '<i class="fa fa-sort-alpha-asc"/>',
                    sortDescending: '<i class="fa fa-sort-alpha-desc"/>'
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
                filterParams: {
                    selectAllOnMiniFilter: true,
                    newRowsAction: 'keep',
                    clearButton: true
                },
                enableRowGroup: true,
                enablePivot: true,
                // pinned: 'right',
                // rowGroupIndex: 1,
                icons: {
                    sortAscending: '<i class="fa fa-sort-alpha-asc"/>',
                    sortDescending: '<i class="fa fa-sort-alpha-desc"/>'
                }
            },
            {
                headerName: "Bought", field: "game.bought", filter: 'agSetColumnFilter', editable: true, width: 150,
                // pinned: 'right',
                // rowGroupIndex: 2,
                // pivotIndex: 1,
                enableRowGroup: true,
                enablePivot: true,
                enableValue: true,
                cellRenderer: 'booleanCellRenderer', cellStyle: { "text-align": "center" }, comparator: booleanComparator,
                floatCell: true,
                filterParams: {
                    cellRenderer: 'booleanFilterCellRenderer',
                    selectAllOnMiniFilter: true,
                    newRowsAction: 'keep',
                    clearButton: true
                }
            }
        ]
    },
    {
        // column group 'Performance'
        headerName: 'Performance',
        groupId: 'performance',
        children: [
            {
                headerName: "Bank Balance", field: "bankBalance", width: 180, editable: true,
                filter: 'winningsFilter', valueFormatter: currencyFormatter,
                type: 'numericColumn',
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
        ]
    },
    {
        headerName: "Rating", field: "rating", width: 120, editable: true, cellRenderer: 'ratingRenderer',
        floatCell: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        filterParams: { cellRenderer: 'ratingFilterRenderer' }
    },
    {
        headerName: "Total Winnings", field: "totalWinnings", filter: 'agNumberColumnFilter', type: 'numericColumn',
        editable: true, valueParser: numberParser, width: 170,
        // aggFunc: 'sum',
        enableValue: true,
        valueFormatter: currencyFormatter, cellStyle: currencyCssFunc,
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
        width: 110, filter: 'agNumberColumnFilter', editable: true, type: 'numericColumn',
        enableValue: true,
        // aggFunc: 'sum',
        //hide: true,
        cellClassRules: {
            'good-score': 'typeof x === "number" && x > 50000',
            'bad-score': 'typeof x === "number" && x < 10000'
        },
        valueParser: numberParser, valueFormatter: currencyFormatter,
        filterParams: {
            clearButton: true
        }
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

    var eMessage = document.querySelector('#message');
    var eMessageText = document.querySelector('#messageText');
    loadInstance++;

    var loadInstanceCopy = loadInstance;
    gridOptions.api.showLoadingOverlay();

    var colDefs = createCols();

    var rowCount = getRowCount();
    var colCount = getColCount();

    var row = 0;
    var data = [];

    eMessage.style.display = 'inline';

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

        eMessageText.innerHTML = ' Generating rows ' + row;

        if (row >= rowCount) {
            clearInterval(intervalId);
            setTimeout(function () {
                gridOptions.api.setColumnDefs(colDefs);
                gridOptions.api.setRowData(data);
                eMessage.style.display = 'none';
                eMessageText.innerHTML = '';
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
        console.log("Callback rowSelected: " + valueToPrint + " - " + event.node.isSelected());
    }
}

function onThemeChanged(newTheme) {
    gridDiv.className = newTheme;

    gridOptions.api.resetRowHeights();
    gridOptions.api.redrawRows();
    gridOptions.api.refreshHeader();
    gridOptions.api.refreshToolPanel();
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

function numberParser(params) {
    var newValue = params.newValue;
    var valueAsNumber;
    if (newValue === null || newValue === undefined || newValue === '') {
        valueAsNumber = null;
    } else {
        valueAsNumber = parseFloat(params.newValue);
    }
    return valueAsNumber;
}

function PersonFilter() {
}

PersonFilter.prototype.init = function (params) {
    this.valueGetter = params.valueGetter;
    this.filterText = null;
    this.params = params;
    this.setupGui();
};

// not called by ag-Grid, just for us to help setup
PersonFilter.prototype.setupGui = function () {
    this.gui = document.createElement('div');
    this.gui.innerHTML =
        '<div style="padding: 4px;">' +
        '<div style="font-weight: bold;">Custom Athlete Filter</div>' +
        '<div><input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Full name search..."/></div>' +
        '<div style="margin-top: 20px; width: 200px;">This filter does partial word search on multiple words, e.g. "mich phel" still brings back Michael Phelps.</div>' +
        '<div style="margin-top: 20px; width: 200px;">Just to illustrate that anything can go in here, here is an image:</div>' +
        '<div><img src="images/ag-Grid2-200.png" style="width: 150px; text-align: center; padding: 10px; margin: 10px; border: 1px solid lightgrey;"/></div>' +
        '</div>';

    var that = this;
    this.onFilterChanged = function () {
        that.extractFilterText();
        that.params.filterChangedCallback();
    };

    this.eFilterText = this.gui.querySelector('#filterText');
    this.eFilterText.addEventListener("input", this.onFilterChanged);
};

PersonFilter.prototype.extractFilterText = function () {
    this.filterText = this.eFilterText.value;
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

PersonFilter.prototype.getModelAsString = function (model) {
    return model ? model : '';
};

PersonFilter.prototype.getModel = function () {
    return this.eFilterText.value;
};

// lazy, the example doesn't use setModel()
PersonFilter.prototype.setModel = function (model) {
    this.eFilterText.value = model;
    this.extractFilterText();
};

PersonFilter.prototype.destroy = function () {
    this.eFilterText.removeEventListener("input", this.onFilterChanged);
};

function PersonFloatingFilterComponent() { }

PersonFloatingFilterComponent.prototype.init = function (params) {
    this.params = params;
    this.eGui = document.createElement('input');
    var eGui = this.eGui;
    this.changeEventListener = function () {
        params.onFloatingFilterChanged(eGui.value);
    };
    this.eGui.addEventListener('input', this.changeEventListener);
};

PersonFloatingFilterComponent.prototype.getGui = function () {
    return this.eGui;
};

PersonFloatingFilterComponent.prototype.onParentModelChanged = function (model) {
    // add in child, one for each flat
    if (model) {
        this.eGui.value = model;
    } else {
        this.eGui.value = '';
    }
};

PersonFloatingFilterComponent.prototype.destroy = function () {
    this.eGui.removeEventListener('input', this.changeEventListener);
};

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

WinningsFilter.prototype.getModelAsString = function (model) {
    return model ? model : '';
};

WinningsFilter.prototype.getModel = function () {
    if (this.cbNoFilter.checked) {
        return '';
    } else if (this.cbPositive.checked) {
        return 'value >= 0';
    } else if (this.cbNegative.checked) {
        return 'value < 0';
    } else if (this.cbGreater50.checked) {
        return 'value >= 50000';
    } else if (this.cbGreater90.checked) {
        return 'value >= 90000';
    } else {
        console.error('invalid checkbox selection');
    }
};
// lazy, the example doesn't use setModel()
WinningsFilter.prototype.setModel = function () { };

function currencyCssFunc(params) {
    if (params.value !== null && params.value !== undefined && params.value < 0) {
        return { "color": "red", "font-weight": "bold" };
    } else {
        return {};
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
            result += '<img src="images/star.svg" class="star" width=12 height=12 />';
        }
    }
    if (forFilter && value === 0) {
        result += '(no stars)';
    }
    result += '</span>';
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

function currencyFormatter(params) {
    if (params.value === null || params.value === undefined) {
        return null;
    } else if (isNaN(params.value)) {
        return 'NaN';
    } else {
        // if we are doing 'count', then we do not show pound sign
        if (params.node.group && params.column.aggFunc === 'count') {
            return params.value;
        } else {
            return '$' + Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
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
        return "<span title='true' class='ag-icon ag-icon-tick content-icon'></span>";
    } else if (valueCleaned === false) {
        return "<span title='false' class='ag-icon ag-icon-cross content-icon'></span>";
    } else if (params.value !== null && params.value !== undefined) {
        return params.value.toString();
    } else {
        return null;
    }
}

function booleanFilterCellRenderer(params) {
    var valueCleaned = booleanCleaner(params.value);
    if (valueCleaned === true) {
        return "<span title='true' class='ag-icon ag-icon-tick content-icon'></span>";
    } else if (valueCleaned === false) {
        return "<span title='false' class='ag-icon ag-icon-cross content-icon'></span>";
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

function CountryFloatingFilterComponent() { }

CountryFloatingFilterComponent.prototype.init = function (params) {
    this.params = params;
    this.eGui = document.createElement('div');
    // this.eGui.style.borderBottom = '1px solid lightgrey';
};

CountryFloatingFilterComponent.prototype.getGui = function () {
    return this.eGui;
};

CountryFloatingFilterComponent.prototype.onParentModelChanged = function (dataModel) {
    // add in child, one for each flat
    if (dataModel) {

        var model = dataModel.values;

        var flagsHtml = [];
        var printDotDotDot = false;
        if (model.length > 4) {
            var toPrint = model.slice(0, 4);
            printDotDotDot = true;
        } else {
            var toPrint = model;
        }
        toPrint.forEach(function (country) {
            flagsHtml.push('<img class="flag" style="border: 0px; width: 15px; height: 10px; margin-left: 2px" ' +
                'src="https://flags.fmcdn.net/data/flags/mini/'
                + COUNTRY_CODES[country] + '.png">');
        });
        this.eGui.innerHTML = '(' + model.length + ') ' + flagsHtml.join('');
        if (printDotDotDot) {
            this.eGui.innerHTML = this.eGui.innerHTML + '...';
        }
    } else {
        this.eGui.innerHTML = '';
    }
};

function countryCellRenderer(params) {
    //get flags from here: http://www.freeflagicons.com/
    if (params.value === "" || params.value === undefined || params.value === null) {
        return '';
    } else {
        var flag = '<img class="flag" border="0" width="15" height="10" src="https://flags.fmcdn.net/data/flags/mini/' + COUNTRY_CODES[params.value] + '.png">';
        return flag + ' ' + params.value;
    }
}