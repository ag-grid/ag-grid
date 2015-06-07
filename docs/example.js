var gridsModule = angular.module("testAngularGrid", ["angularGrid"]);

gridsModule.controller('mainController', function($scope) {

    var colNames = ["Station","Railway","Street","Address","Toy","Soft Box","Make and Model","Longest Day","Shortest Night"];

    var countries = [
        {country: "Ireland", continent: "Europe", language: "English"},
        {country: "Spain", continent: "Europe", language: "Spanish"},
        {country: "United Kingdom", continent: "Europe", language: "English"},
        {country: "France", continent: "Europe", language: "French"},
        {country: "Germany", continent: "Europe", language: "(other)"},
        {country: "Sweden", continent: "Europe", language: "(other)"},
        {country: "Norway", continent: "Europe", language: "(other)"},
        {country: "Italy", continent: "Europe", language: "(other)"},
        {country: "Greece", continent: "Europe", language: "(other)"},
        {country: "Iceland", continent: "Europe", language: "(other)"},
        {country: "Portugal", continent: "Europe", language: "Portuguese"},
        {country: "Malta", continent: "Europe", language: "(other)"},
        {country: "Brazil", continent: "South America", language: "Portuguese"},
        {country: "Argentina", continent: "South America", language: "Spanish"},
        {country: "Colombia", continent: "South America", language: "Spanish"},
        {country: "Peru", continent: "South America", language: "Spanish"},
        {country: "Venezuela", continent: "South America", language: "Spanish"},
        {country: "Uruguay", continent: "South America", language: "Spanish"}
    ];

    var games = ["Chess","Cross and Circle game","Daldøs","Downfall","DVONN","Fanorona","Game of the Generals","Ghosts",
        "Abalone","Agon","Backgammon","Battleship","Blockade","Blood Bowl","Bul","Camelot","Checkers",
        "Go","Gipf","Guess Who?","Hare and Hounds","Hex","Hijara","Isola","Janggi (Korean Chess)","Le Jeu de la Guerre",
        "Patolli","Plateau","PÜNCT","Rithmomachy","Sáhkku","Senet","Shogi","Space Hulk","Stratego","Sugoroku",
        "Tâb","Tablut","Tantrix","Wari","Xiangqi (Chinese chess)","YINSH","ZÈRTZ","Kalah","Kamisado","Liu po",
        "Lost Cities","Mad Gab","Master Mind","Nine Men's Morris","Obsession","Othello"
    ];
    var booleanValues = [true, "true", false, "false", null, undefined, ""];

    var firstNames = ["Sophie","Isabelle","Emily","Olivia","Lily","Chloe","Isabella",
        "Amelia","Jessica","Sophia","Ava","Charlotte","Mia","Lucy","Grace","Ruby",
        "Ella","Evie","Freya","Isla","Poppy","Daisy","Layla"];
    var lastNames = ["Beckham","Black","Braxton","Brennan","Brock","Bryson","Cadwell",
        "Cage","Carson","Chandler","Cohen","Cole","Corbin","Dallas","Dalton","Dane",
        "Donovan","Easton","Fisher","Fletcher","Grady","Greyson","Griffin","Gunner",
        "Hayden","Hudson","Hunter","Jacoby","Jagger","Jaxon","Jett","Kade","Kane",
        "Keating","Keegan","Kingston","Kobe"];

    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    $scope.colCount = 20;
    $scope.rowCount = 100;

    $scope.size = 'fill'; // model for size select
    $scope.width = '100%'; // the div gets it's width and height from here
    $scope.height = '100%';

    $scope.style = 'ag-fresh';
    $scope.groupBy = '';
    $scope.groupType = 'col';
    $scope.groupHeaders = 'true';
    $scope.rowSelection = 'checkbox';

    var angularGrid = {
        columnDefs: [],
        rowData: null,
        rowsAlreadyGrouped: false, // set this to true, if you are passing in data alrady in nodes and groups
        groupHeaders: true,
        groupKeys: undefined, //set as string of keys eg ["region","country"],
//            groupUseEntireRow: true, //one of [true, false]
//            groupDefaultExpanded: false, //one of [true, false], or an integer if greater than 1
//            headerHeight: 100, // set to an integer, default is 25, or 50 if grouping columns
//        groupSuppressGroupColumn: true,
        groupIncludeFooter: false,
        pinnedColumnCount: 0, //and integer, zero or more, default is 0
        rowHeight: 25, // defaults to 25, can be any integer
        enableColResize: true, //one of [true, false]
        enableSorting: true, //one of [true, false]
        enableFilter: true, //one of [true, false]
        rowSelection: "multiple", // one of ['single','multiple'], leave blank for no selection
        rowDeselection: true,
        groupSelectsChildren: true, // one of [true, false]
        suppressRowClickSelection: true, // if true, clicking rows doesn't select (useful for checkbox selection)
        //suppressCellSelection: true,
        groupAggFunction: groupAggFunction,
        angularCompileRows: false,
        angularCompileFilters: true,
        angularCompileHeaders: true,
        //dontUseScrolls: true,
        //rowClass: function(row, pinnedRow) { return (row.country === 'Ireland') ? "theClass" : null; },
        //headerCellRenderer: headerCellRenderer_text,
        //headerCellRenderer: headerCellRenderer_dom,
        rowSelected: rowSelected, //callback when row selected
        selectionChanged: selectionChanged, //callback when selection changed,
        icons: {
            //menu: '<i class="fa fa-bars"/>',
            filter: '<i class="fa fa-filter"/>',
            sortAscending: '<i class="fa fa-long-arrow-down"/>',
            sortDescending: '<i class="fa fa-long-arrow-up"/>',
            groupExpanded: '<i class="fa fa-minus-square-o"/>',
            groupContracted: '<i class="fa fa-plus-square-o"/>',
            columnGroupOpened: '<i class="fa fa-minus-square-o"/>',
            columnGroupClosed: '<i class="fa fa-plus-square-o"/>'
        },
        // callback when row clicked
        rowClicked: function(params) {
            //console.log("Callback rowClicked: " + params.data + " - " + params.event);
        },
        // callback when cell clicked
        cellClicked: function(params) {
            console.log("Callback cellClicked: " + params.value + " - " + params.colDef.field + ' - ' + params.event);
        },
        // callback when cell double clicked
        cellDoubleClicked:  function(params) {
            console.log("Callback cellDoubleClicked: " + params.value + " - " + params.colDef.field + ' - ' + params.event);
        },
        ready: function(api) {
            console.log('Callback ready: api = ' + api);
        }
    };
    $scope.angularGrid = angularGrid;

    var groupColumn = {
        displayName: "Name", field: "name", group: 'Participant', width: 200, editable: editableFunc, filter: PersonFilter,
        floatCell: true,
            cellRenderer: {
                renderer: "group",
                checkbox: true
            }
        };

    var firstColumn = {displayName: "Name", field: "name", group: 'Participant', checkboxSelection: true, width: 200, editable: editableFunc, filter: PersonFilter,
        floatCell: true,
        icons: {
            sortAscending: '<i class="fa fa-sort-alpha-asc"/>',
            sortDescending: '<i class="fa fa-sort-alpha-desc"/>'
        }
    };

    var defaultCols = [
        //{displayName: "", valueGetter: "node.id", width: 20}, // this row is for showing node id, handy for testing
        groupColumn,
        firstColumn,
        {displayName: "Country", field: "country", group: 'Participant', width: 150, editable: editableFunc, cellRenderer: countryCellRenderer, filter: 'set',
            floatCell: true,
            filterParams: {cellRenderer: countryCellRenderer, cellHeight: 20},
            icons: {
                sortAscending: '<i class="fa fa-sort-alpha-asc"/>',
                sortDescending: '<i class="fa fa-sort-alpha-desc"/>'
            }
        },
        {displayName: "Language", field: "language", group: 'Participant', width: 150, editable: editableFunc, filter: 'set', cellRenderer: languageCellRenderer,
            icons: {
                sortAscending: '<i class="fa fa-sort-alpha-asc"/>',
                sortDescending: '<i class="fa fa-sort-alpha-desc"/>'
            }
        },
        {displayName: "Game of Choice", field: "game", group: 'Game', width: 180, editable: editableFunc, filter: 'set', cellClass: function() { return 'alphabet'; },
            icons: {
                sortAscending: '<i class="fa fa-sort-alpha-asc"/>',
                sortDescending: '<i class="fa fa-sort-alpha-desc"/>'
            }
        },
        {displayName: "Bought", field: "bought", filter: 'set', group: 'Game', editable: editableFunc, width: 100,
            cellRenderer: booleanCellRenderer, cellStyle: {"text-align": "center"}, comparator: booleanComparator,
            floatCell: true,
            filterParams: {cellRenderer: booleanFilterCellRenderer}},
        {displayName: "Bank Balance", field: "bankBalance", group: 'Performance', width: 150, editable: editableFunc, filter: WinningsFilter, cellRenderer: currencyRenderer, cellStyle: currencyCssFunc,
            filterParams: {cellRenderer: currencyRenderer},
            icons: {
                sortAscending: '<i class="fa fa-sort-amount-asc"/>',
                sortDescending: '<i class="fa fa-sort-amount-desc"/>'
            }
        },
        {displayName: "Extra Info", groupShow: 'open', group: 'Performance', width: 150, editable: false,
            suppressSorting: true, suppressMenu: true, cellStyle: {"text-align": "right"},
            cellRenderer: function() { return 'Abra...'; } },
        {displayName: "Extra Info", groupShow: 'open', group: 'Performance', width: 150, editable: false,
            suppressSorting: true, suppressMenu: true, cellStyle: {"text-align": "left"},
            cellRenderer: function() { return '...cadabra!'; } },
        {displayName: "Rating", field: "rating", width: 100, editable: editableFunc, cellRenderer: ratingRenderer,
            floatCell: true,
            filterParams: {cellRenderer: ratingFilterRenderer}
        },
        {displayName: "Total Winnings", field: "totalWinnings", filter: 'number', editable: editableFunc, newValueHandler: numberNewValueHandler, width: 150, cellRenderer: currencyRenderer, cellStyle: currencyCssFunc,
            icons: {
                sortAscending: '<i class="fa fa-sort-amount-asc"/>',
                sortDescending: '<i class="fa fa-sort-amount-desc"/>'
            }
        }
    ];
    //put in the month cols
    months.forEach(function(month) {
        defaultCols.push({displayName: month, group: 'Monthly Breakdown', field: month.toLocaleLowerCase(), width: 100, filter: 'number', editable: editableFunc,
            newValueHandler: numberNewValueHandler, cellRenderer: currencyRenderer, filterCellRenderer: currencyRenderer,
            cellStyle: {"text-align": "right"}})
    });

    createCols();
    createData();

    //setInterval(function() {
    //    $scope.angularGrid.api.ensureIndexVisible(Math.random*() * 100000);
    //});

    $scope.jumpToCol = function() {
        var index = Number($scope.jumpToColText);
        if (typeof index === 'number' && !isNaN(index)) {
            angularGrid.api.ensureColIndexVisible(index);
        }
    };

    $scope.jumpToRow = function() {
        var index = Number($scope.jumpToRowText);
        if (typeof index === 'number' && !isNaN(index)) {
            angularGrid.api.ensureIndexVisible(index);
        }
    };

    $scope.onRowCountChanged = function() {
        angularGrid.api.showLoading(true);
        // put into a timeout, so browser gets a chance to update the loading panel
        setTimeout( function () {
            createData();
            angularGrid.api.onNewRows();
        }, 0);
    };

    $scope.onPinnedColCountChanged = function() {
        angularGrid.api.onNewCols();
    };

    $scope.onColCountChanged = function() {
        angularGrid.api.showLoading(true);
        setTimeout( function () {
            createCols();
            createData();
            angularGrid.api.onNewCols();
            angularGrid.api.onNewRows();
        });
    };

    $scope.onSelectionChanged = function() {
        switch ($scope.rowSelection) {
            case 'checkbox' :
                firstColumn.checkboxSelection = true;
                groupColumn.cellRenderer.checkbox = true;
                angularGrid.rowSelection = 'multiple';
                angularGrid.suppressRowClickSelection = true;
                break;
            case 'single' :
                firstColumn.checkboxSelection = false;
                groupColumn.cellRenderer.checkbox = false;
                angularGrid.rowSelection = 'single';
                angularGrid.suppressRowClickSelection = false;
                break;
            case 'multiple' :
                firstColumn.checkboxSelection = false;
                groupColumn.cellRenderer.checkbox = false;
                angularGrid.rowSelection = 'multiple';
                angularGrid.suppressRowClickSelection = false;
                break;
            default :
                // turn selection off
                firstColumn.checkboxSelection = false;
                groupColumn.cellRenderer.checkbox = false;
                angularGrid.rowSelection = null;
                angularGrid.suppressRowClickSelection = false;
                break;
        }
        angularGrid.api.unselectAll();
        angularGrid.api.onNewCols();
    };

    $scope.onGroupHeaders = function() {
        angularGrid.groupHeaders = $scope.groupHeaders === 'true';
        angularGrid.api.onNewCols();
    };

    $scope.onSize = function() {
        if ($scope.size === 'fill') {
            $scope.width = '100%';
            $scope.height = '100%';
        } else {
            $scope.width = '800px';
            $scope.height = '600px';
        }
    };

    $scope.onGroupByChanged = function() {
        // setup keys
        var groupBy = null;
        if ($scope.groupBy!=="") {
            groupBy = $scope.groupBy.split(",");
        }
        angularGrid.groupKeys = groupBy;

        // setup type
        var groupUseEntireRow = $scope.groupType==='row' || $scope.groupType==='rowWithFooter';
        angularGrid.groupUseEntireRow = groupUseEntireRow;

        // use footer or not
        var useFooter = $scope.groupType==='colWithFooter' || $scope.groupType==='rowWithFooter';
        angularGrid.groupIncludeFooter = useFooter;

        createCols();
        angularGrid.api.onNewCols();
        angularGrid.api.onNewRows();
    };

    function editableFunc() {
        return true;
    }

    function createCols() {
        var colCount = parseInt($scope.colCount);

        // start with a copy of the default cols
        var columns = defaultCols.slice(0, colCount);

        // if not grouping, take out the group column
        var groupColNeeded = $scope.groupBy!=='' && ($scope.groupType==='col' || $scope.groupType==='colWithFooter');
        if (!groupColNeeded) {
            columns.splice(0,1);
        } else {
            columns.splice(1,1);
        }

        for (var col = defaultCols.length; col<colCount; col++) {
            var colName = colNames[col % colNames.length];
            var colDef = {displayName: colName, field: "col"+col, width: 200, editable: editableFunc};
            columns.push(colDef);
        }
        angularGrid.columnDefs = columns;
    }

    function createData() {
        var rowCount = parseInt($scope.rowCount);
        var colCount = parseInt($scope.colCount);
        var data = [];
        for (var row = 0; row<rowCount; row++) {
            var rowItem = {};

            //create data for the known columns
            var countryData = countries[row % countries.length];
            rowItem.country = countryData.country;
            rowItem.continent = countryData.continent;
            rowItem.language = countryData.language;

            var firstName = firstNames[row % firstNames.length];
            var lastName = lastNames[row % lastNames.length];
            rowItem.name = firstName + " " + lastName;

            rowItem.game = games[row % games.length];
            rowItem.bankBalance = ((Math.round(Math.random()*10000000))/100) - 3000;
            rowItem.rating = (Math.round(Math.random()*5));
            rowItem.bought = booleanValues[row % booleanValues.length];

            var totalWinnings = 0;
            months.forEach(function(month) {
                var value = ((Math.round(Math.random()*10000000))/100) - 20;
                rowItem[month.toLocaleLowerCase()] = value;
                totalWinnings += value;
            });
            rowItem.totalWinnings = totalWinnings;

            //create dummy data for the additional columns
            for (var col = defaultCols.length; col<colCount; col++) {
                var value;
                var randomBit = Math.random().toString().substring(2,5);
                value = colNames[col % colNames.length]+"-"+randomBit +" - (" +row+","+col+")";
                rowItem["col"+col] = value;
            }
            data.push(rowItem);
        }
        angularGrid.rowData = data;
    }

    function selectionChanged() {
        console.log('Callback selectionChanged: selection count = ' + $scope.angularGrid.selectedRows.length);
    }

    function rowSelected(row, node) {
        // this clogs the console, when to many rows displayed, and use selected 'select all'.
        // so check 'not to many rows'
        if (angularGrid.rowData.length <= 100) {
            var valueToPrint = node.group ? 'group ('+node.key+')' : row.name;
            console.log("Callback rowSelected: " + valueToPrint);
        }
    }

});

var COUNTRY_CODES = {
    Ireland: "ie",
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
    var valueAsNumber = parseFloat(params.newValue);
    var field = params.colDef.field;
    var data = params.data;
    data[field] = valueAsNumber;
}

function PersonFilter(params) {
    this.$scope = params.$scope;
    this.$scope.onFilterChanged = function() {
        params.filterChangedCallback();
    };
    this.valueGetter = params.valueGetter;
}

PersonFilter.prototype.getGui = function () {
    return '<div style="padding: 4px; width: 200px;">' +
        '<div style="font-weight: bold;">Example Custom Filter</div>' +
        '<div><input style="margin: 4px 0px 4px 0px;" type="text" ng-model="filterText" ng-change="onFilterChanged()" placeholder="Full name search..."/></div>' +
        '<div>This filter does partial word search, the following all bring back the name Sophie Beckham:</div>' +
        '<div>=> "sophie"</div>' +
        '<div>=> "beckham"</div>' +
        '<div>=> "sophie beckham"</div>' +
        '<div>=> "beckham sophie"</div>' +
        '<div>=> "beck so"</div>' +
        '</div>';
};

PersonFilter.prototype.doesFilterPass = function (params) {
    var filterText = this.$scope.filterText;
    if (!filterText) {
        return true;
    }
    // make sure each word passes separately, ie search for firstname, lastname
    var passed = true;
    var value = this.valueGetter(params);
    filterText.toLowerCase().split(" ").forEach(function(filterWord) {
        if (value.toString().toLowerCase().indexOf(filterWord)<0) {
            passed = false;
        }
    });

    return passed;
};

PersonFilter.prototype.isFilterActive = function () {
    var value = this.$scope.filterText;
    return value !== null && value !== undefined && value !== '';
};

function WinningsFilter(params) {
    var uniqueId = Math.random();
    this.filterChangedCallback = params.filterChangedCallback;
    this.eGui = document.createElement("div");
    this.eGui.innerHTML =
        '<div style="padding: 4px;">' +
        '<div style="font-weight: bold;">Example Custom Filter</div>' +
        '<div><label><input type="radio" name="filter"'+uniqueId+' id="cbNoFilter">No filter</input></label></div>' +
        '<div><label><input type="radio" name="filter"'+uniqueId+' id="cbPositive">Positive</input></label></div>' +
        '<div><label><input type="radio" name="filter"'+uniqueId+' id="cbNegative">Negative</input></label></div>' +
        '<div><label><input type="radio" name="filter"'+uniqueId+' id="cbGreater50">&gt; &pound;50,000</label></div>' +
        '<div><label><input type="radio" name="filter"'+uniqueId+' id="cbGreater90">&gt; &pound;90,000</label></div>' +
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
}

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

function headerCellRenderer_dom(colDef) {
    var eContainer = document.createElement("span");
    eContainer.style.border = '1px solid darkgreen';

    var eText = document.createTextNode(colDef.displayName);
    eContainer.appendChild(eText);

    return eContainer;
}

function headerCellRenderer_text(params) {
    return params.colDef.displayName;
}

function headerCellRenderer_angular(params) {
    params.$scope.showIcon = false;
    return '<span ng-mouseover="showIcon = true" ng-mouseleave="showIcon = false">' +
        '<img ' +
        '   src="http://upload.wikimedia.org/wikipedia/commons/1/12/User_icon_2.svg"' +
        '   style="width: 20px; position: absolute; top: 3px; left: 5px;"' +
        '   ng-show="showIcon">' +
        '{{colDef.displayName}}' +
        '</span>';
}

function groupAggFunction(nodes) {
    var colsToSum = ['bankBalance','totalWinnings','jan','feb',"mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    var sums = {};
    colsToSum.forEach(function(key) { sums[key] = 0; });

    nodes.forEach(function(node) {
        colsToSum.forEach(function(key) {
            sums[key] += node.data[key];
        });
    });

    return sums;
}

function currencyCssFunc(params) {
    if (params.value!==null && params.value!==undefined && params.value<0) {
        return {"color": "red", "text-align": "right", "font-weight": "bold"};
    } else {
        return {"text-align": "right"};
    }
}

function ratingFilterRenderer(params)  {
    return ratingRendererGeneral(params.value, true)
}

function ratingRenderer(params) {
    return ratingRendererGeneral(params.value, false)
}

function ratingRendererGeneral(value, forFilter)  {
    var eContainer = document.createElement("span");
    for (var i = 0; i<5; i++) {
        if (value>i) {
            var starImage = document.createElement("img");
            starImage.src = "http://www.angulargrid.com/images/goldStar.png";
            eContainer.appendChild(starImage);
        }
    }
    if (forFilter && value === 0) {
        eContainer.appendChild(document.createTextNode('(no stars)'));
    }
    return eContainer;
}

function currencyRenderer(params)  {
    if (params.value===null || params.value===undefined) {
        return null;
    } else if (isNaN(params.value)) {
        return 'NaN';
    } else {
        var decimalSeparator = Number("1.2").toLocaleString().substr(1,1);

        var amountWithCommas = params.value.toLocaleString();
        var arParts = String(amountWithCommas).split(decimalSeparator);
        var intPart = arParts[0];
        var decPart = (arParts.length > 1 ? arParts[1] : '');
        decPart = (decPart + '00').substr(0,2);

        return '&pound; ' + intPart + decimalSeparator + decPart;
    }
}

function booleanComparator(value1, value2) {
    var value1Cleaned = booleanCleaner(value1);
    var value2Cleaned = booleanCleaner(value2);
    var value1Ordinal = value1Cleaned===true ? 0 : (value1Cleaned===false ? 1 : 2);
    var value2Ordinal = value2Cleaned===true ? 0 : (value2Cleaned===false ? 1 : 2);
    return value1Ordinal - value2Ordinal;
}

function booleanCellRenderer(params) {
    var valueCleaned = booleanCleaner(params.value);
    if (valueCleaned===true) {
        //this is the unicode for tick character
        return "<span title='true'>&#10004;</span>";
    } else if (valueCleaned===false) {
        //this is the unicode for cross character
        return "<span title='false'>&#10006;</span>";
    } else {
        return null;
    }
}

function booleanFilterCellRenderer(params) {
    var valueCleaned = booleanCleaner(params.value);
    if (valueCleaned===true) {
        //this is the unicode for tick character
        return "&#10004;";
    } else if (valueCleaned===false) {
        //this is the unicode for cross character
        return "&#10006;";
    } else {
        return "(empty)";
    }
}

function booleanCleaner(value) {
    if (value==="true" || value===true || value===1) {
        return true;
    } else if (value==="false" || value===false || value===0) {
        return false;
    } else {
        return null;
    }
}

function languageCellRenderer(params) {
    if (params.$scope) {
        return "<span ng-click='clicked=true' ng-show='!clicked'>Click Me</span>" +
            "<span ng-click='clicked=false' ng-show='clicked' ng-bind='data.language'></span>";
    } else if (params.value) {
        return params.value;
    } else {
        return null;
    }
}

function countryCellRenderer(params) {
    //get flags from here: http://www.freeflagicons.com/
    if (params.value==="" || params.value===undefined || params.value===null) {
        return null;
    } else {
        var flag = "<img border='0' width='15' height='10' src='http://flags.fmcdn.net/data/flags/mini/"+COUNTRY_CODES[params.value]+".png'>";
        return flag + " " + params.value;
    }
}
