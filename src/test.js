define([
    "angular",
    "./angularGrid"
], function(angular) {

    var gridsModule = angular.module("grids", ["angularGrid"]);

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

        $scope.width = "100%";
        $scope.height = "100%";
        $scope.style = "ag-fresh";
        $scope.groupBy = "";
        $scope.groupType = "firstCol";

        var angularGrid = {
            columnDefs: [],
            rowData: [],
            groupKeys: undefined, //set as string of keys eg ["region","country"],
//            groupUseEntireRow: true, //one of [true, false]
//            groupInnerCellRenderer: groupInnerCellRenderer,
//            groupDefaultExpanded: true, //one of [true, false]
            pinnedColumnCount: 0, //and integer, zero or more, default is 0
            rowHeight: 25, // defaults to 25, can be any integer
            enableColResize: true, //one of [true, false]
            enableSorting: true, //one of [true, false]
            enableFilter: true, //one of [true, false]
            rowSelection: "single", // one of ['single','multiple'], leave blank for no selection
            groupAggFunction: groupAggFunction,
            angularCompile: false,
            angularCompileFilters: true,
            //dontUseScrolls: true,
            rowClass: function(row, pinnedRow) { return (row.country === 'Ireland') ? "theClass" : null; },
            //headerCellRenderer: headerCellRenderer_text,
            //headerCellRenderer: headerCellRenderer_dom,
            rowSelected: function(row) {console.log("Callback rowSelected: " + row); }, //callback when row selected
            selectionChanged: function() {console.log("Callback selectionChanged"); }, //callback when selection changed
            rowClicked: function(row, event) {console.log("Callback rowClicked: " + row + " - " + event);}, //callback when row clicked
            cellClicked: function(row, colDef, event) {console.log("Callback cellClicked: " + row + " - " + colDef.field + ' - ' + event);} //callback when cell clicked
        };
        $scope.angularGrid = angularGrid;

        var defaultCols = [
            {displayName: "Name", field: "name", width: 200, filter: PersonFilter, cellStyle: nameCssFunc, headerTooltip: "The Name Column"},
            {displayName: "Country", field: "country", width: 150, cellRenderer: countryCellRenderer, filter: 'set',
                filterParams: {cellRenderer: countryFilterCellRenderer, cellHeight: 20}
            },
            {displayName: "Language", field: "language", width: 150, filter: 'set', cellRenderer: languageCellRenderer},
            {displayName: "Game of Choice", field: "game", width: 180, filter: 'set', editable: true, newValueHandler: gameNewValueHandler, cellClass: function() { return 'alphabet'; } },
            {displayName: "Bought", field: "bought", filter: 'set', width: 100, cellRenderer: booleanCellRenderer, cellStyle: {"text-align": "center"}, comparator: booleanComparator ,filterCellRenderer: booleanFilterCellRenderer},
            {displayName: "Bank Balance", field: "bankBalance", width: 150, filter: WinningsFilter, cellRenderer: currencyRenderer, filterCellRenderer: currencyRenderer, cellStyle: currencyCssFunc},
            {displayName: "Rating", field: "rating", width: 100, cellRenderer: ratingRenderer,
                filterParams: {cellRenderer: ratingRenderer}},
            {displayName: "Total Winnings", field: "totalWinnings", filter: 'number', width: 150, cellRenderer: currencyRenderer, filterCellRenderer: currencyRenderer, cellStyle: currencyCssFunc}
        ];
        //put in the month cols
        months.forEach(function(month) {
            defaultCols.push({displayName: month, field: month.toLocaleLowerCase(), width: 100, filter: 'number',
                cellRenderer: currencyRenderer, filterCellRenderer: currencyRenderer, cellStyle: {"text-align": "right"}})
        });

        createCols();
        createData();

        $scope.onRowCountChanged = function() {
            createData();
            angularGrid.api.onNewRows();
        };

        $scope.onPinnedColCountChanged = function() {
            angularGrid.api.onNewCols();
        };

        $scope.onColCountChanged = function() {
            createCols();
            angularGrid.api.onNewCols();
        };

        $scope.onSelectionChanged = function() {
            if (angularGrid.rowSelection=='') {
                angularGrid.api.unselectAll();
            }
        };

        $scope.onGroupByChanged = function() {
            //setup keys
            var groupBy = null;
            if ($scope.groupBy!=="") {
                groupBy = $scope.groupBy.split(",");
            }
            angularGrid.groupKeys = groupBy;

            //setup type
            var groupUseEntireRow = $scope.groupType==='row';
            angularGrid.groupUseEntireRow = groupUseEntireRow;

            angularGrid.api.onNewRows();
        };

        function createCols() {
            var colCount = parseInt($scope.colCount);

            //start with a copy of the default cols
            var columns = defaultCols.slice(0, colCount);

            for (var col = defaultCols.length; col<colCount; col++) {
                var colName = colNames[col % colNames.length];
                var colDef = {displayName: colName, field: "col"+col, width: 200};
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

        //because name is the first col, if grouping present, we want to indent it.
        //this method is inside the controller as we access the scope
        function nameCssFunc() {
            var style = {};
            if ($scope.angularGrid.groupKeys) {
                switch ($scope.angularGrid.groupKeys.length) {
                    case 1 :
                        style["padding-left"] = "30px";
                        break;
                    case 2 :
                        style["padding-left"] = "40px";
                        break;
                }
            }
            return style;
        }

        function gameNewValueHandler(data, newValue) {
            data.game = newValue;
        }

    });

    var COUNTRY_CODES = {
        Ireland: "ie",
        Spain: "es",
        "United Kingdom": "gb",
        France: "fr",
        Germany: "de",
        Sweden: "se",
        Italy: "is",
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

    function PersonFilter(colDef, rowModel, filterChangedCallback, filterParams, $scope) {
        this.$scope = $scope;
        $scope.onFilterChanged = function() {
            filterChangedCallback();
        };
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

    PersonFilter.prototype.doesFilterPass = function (value, model) {
        var filterText = this.$scope.filterText;
        if (!filterText) {
            return true;
        }
        // make sure each word passes separately, ie search for firstname, lastname
        var passed = true;
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

    function WinningsFilter(colDef, rowModel, filterChangedCallback) {
        var uniqueId = Math.random();
        this.filterChangedCallback = filterChangedCallback;
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
        this.cbNoFilter.onclick = filterChangedCallback;
        this.cbPositive.onclick = filterChangedCallback;
        this.cbNegative.onclick = filterChangedCallback;
        this.cbGreater50.onclick = filterChangedCallback;
        this.cbGreater90.onclick = filterChangedCallback;
    }

    WinningsFilter.prototype.getGui = function () {
        return this.eGui;
    };

    WinningsFilter.prototype.doesFilterPass = function (value, model) {
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

    function headerCellRenderer_text(colDef) {
        return colDef.displayName;
    }

    function groupInnerCellRenderer(data) {
        return "<b>" + data.key + "</b>";
    }

    function groupAggFunction(rows) {
        var colsToSum = ['bankBalance','totalWinnings','jan','feb',"mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
        var sums = {};
        colsToSum.forEach(function(key) { sums[key] = 0; });

        rows.forEach(function(row) {
            var rowIsAGroup = row._angularGrid_group;
            colsToSum.forEach(function(key) {
                if (rowIsAGroup) {
                    sums[key] += row.aggData[key];
                } else {
                    sums[key] += row[key];
                }
            });
        });

        return sums;
    }

    function currencyCssFunc(value) {
        if (value!==null && value!==undefined && value<0) {
            return {"color": "red", "text-align": "right", "font-weight": "bold"};
        } else {
            return {"text-align": "right"};
        }
    }

    function ratingRenderer(value)  {
        var eContainer = document.createElement("span");
        for (var i = 0; i<5; i++) {
            if (value>i) {
                var starImage = document.createElement("img");
                starImage.src = "http://www.angulargrid.com/images/goldStar.png";
                eContainer.appendChild(starImage);
            }
        }
        return eContainer;
    }

    function currencyRenderer(value)  {
        if (value===null || value===undefined) {
            return null;
        } else {
            var decimalSeparator = Number("1.2").toLocaleString().substr(1,1);

            var amountWithCommas = value.toLocaleString();
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

    function booleanCellRenderer(value) {
        var valueCleaned = booleanCleaner(value);
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

    function booleanFilterCellRenderer(value) {
        var valueCleaned = booleanCleaner(value);
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

    function languageCellRenderer(value, data, colDef, $childScope) {
        if ($childScope) {
            return "<span ng-click='clicked=true' ng-show='!clicked'>Click Me</span>" +
                "<span ng-click='clicked=false' ng-show='clicked' ng-bind='rowData.language'></span>";
        } else {
            return value;
        }
    }

    function countryCellRenderer(value) {
        //get flags from here: http://www.freeflagicons.com/
        if (value==="" || value===undefined || value===null) {
            return null;
        } else {
            var flag = "<img border='0' width='20' height='15' src='http://flags.fmcdn.net/data/flags/mini/"+COUNTRY_CODES[value]+".png'>";
            var link = "<a href='http://en.wikipedia.org/wiki/" + value + "' style='text-decoration: none;'> "+value+"</a>";
            var padding = 0;
            return "<span style='padding-left: "+padding+"px'>"+flag + link+"</span>";
        }
    }

    function countryFilterCellRenderer(value) {
        if (value==="" || value===undefined || value===null) {
            return "(no country)";
        } else {
            var flag = "<img border='0' width='15' height='10' src='http://flags.fmcdn.net/data/flags/mini/"+COUNTRY_CODES[value]+".png'>";
            return flag + " " + value;
        }
    }

    angular.bootstrap(document, ['grids']);

});
