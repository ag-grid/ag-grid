(function() {
    var api;
    var columnApi;

    var columnDefs = [
        {headerName: 'Athlete', field: 'athlete', width: 150},
        {headerName: 'Age', field: 'age', width: 90},
        {headerName: 'Country', field: 'country', width: 120},
        {headerName: 'Year', field: 'year', width: 90},
        {headerName: 'Sport', field: 'sport', width: 110},
        {headerName: 'Gold', field: 'gold', width: 100, aggFunc: 'sum'}
    ];

    var gridOptions = {
        columnDefs: columnDefs,
        enableRangeSelection: true,
        enableSorting: true,
        enableFilter: true,
        animateRows: true,

        // so we don't see sum() in aggregate column headers
        suppressAggFuncInHeader: true
    };

    function callGridApi(action, placeholder) {
        placeholder.textContent = action.code;
        action.fn();
    }

    var actions = {
        'sort-by-one-column': {
            code: 'api.setSortModel([\n' +
                '    {colId: \'country\', sort: \'asc\'}\n' +
                ']);',
            fn: function() {
                api.setSortModel([{colId: 'country', sort: 'asc'}]);
            }
        },
        'sort-by-two-columns': {
            code: 'api.setSortModel([\n' +
                '    {colId: \'country\', sort: \'asc\'},\n' +
                '    {colId: \'year\', sort: \'asc\'}\n' +
                ']);',
            fn: function() {
                console.log("here", api);
                api.setSortModel([{colId: 'country', sort: 'asc'}, {colId: 'year', sort: 'asc'}]);
            }
        },
        'clear-sorting': {
            code: 'api.setSortModel([]);',
            fn: function() {
                api.setSortModel([]);
            }
        },
        'set-filter-by-one-column': {
            code: 'api.setFilterModel({country: [\'Great Britain\']});',
            fn: function() {
                api.setFilterModel({country: ['Great Britain']});
            }
        },
        'remove-filter': {
            code: 'api.setFilterModel({});',
            fn: function() {
                api.setFilterModel({});
            }
        },
        'group-by-three-columns': {
            code: 'columnApi.setRowGroupColumns(\n' +
                '    [\'country\', \'year\', \'sport\']\n' +
                ');',
            fn: function() {
                columnApi.setRowGroupColumns(['country', 'year', 'sport']);
            }
        },
        'expand-top-level-rows': {
            code: 'api.forEachNode(function (node) {\n' +
                '    if (node.level === 0) {\n' +
                '        node.setExpanded(true);\n' +
                '    }\n' +
                '});',
            fn: function() {
                api.forEachNode(function (node) {
                    if (node.level === 0) {
                        node.setExpanded(true);
                    }
                });
            }
        },
        'collapse-top-level-rows': {
            code: 'api.forEachNode(function (node) {\n' +
                '    if (node.level === 0) {\n' +
                '        node.setExpanded(false);\n' +
                '    }\n' +
                '});',
            fn: function() {
                api.forEachNode(function (node) {
                    if (node.level === 0) {
                        node.setExpanded(false);
                    }
                });
            }
        },
        'remove-grouping': {
            code: 'columnApi.setRowGroupColumns([]);',
            fn: function() {
                columnApi.setRowGroupColumns([]);
            }
        },
        'set-row-height': {
            code: 'var rowNode = api.getDisplayedRowAtIndex(3);\n' +
                'rowNode.setRowHeight(100);\n' +
                'api.onRowHeightChanged();',
            fn: function() {
                var rowNode = api.getDisplayedRowAtIndex(3);
                rowNode.setRowHeight(100);
                api.onRowHeightChanged();
            }
        },
        'reset-row-height': {
            code: 'api.resetRowHeights();',
            fn: function() {
                api.resetRowHeights();
            }
        }
    };

    document.addEventListener('DOMContentLoaded', function() {
        // initialize the grid
        new agGrid.Grid(document.querySelector('.api .grid-container'), gridOptions);
        api = gridOptions.api;
        columnApi = gridOptions.columnApi;

        // feed data into the grid
        agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinnersSmall.json'})
            .then(function (data) {
                gridOptions.api.setRowData(data.slice(0, 1000));
                setTimeout(function () {
                    gridOptions.api.sizeColumnsToFit();
                }, 0);
            });

        // set up action listeners
        var placeholder = document.querySelector('.api-code > pre');
        var actionNodes = [];
        for (var action in actions) {
            (function() {
                var currentAction = action;
                var node = document.querySelector('[data-action="' + currentAction + '"]');
                actionNodes.push(node);
                node.addEventListener('click', function() {
                    actionNodes.forEach(function(n) {
                        n.classList.remove('active');
                    });
                    node.classList.add('active');

                    console.log(currentAction);
                    callGridApi(actions[currentAction], placeholder)
                });

            })();
        }

        actionNodes[0].classList.add('active');
        callGridApi(actions['sort-by-one-column'], placeholder);
    });
})();
