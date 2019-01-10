let api;
let columnApi;

let columnDefs = [
    {headerName: 'Athlete', field: 'athlete', width: 150},
    {headerName: 'Age', field: 'age', width: 90},
    {headerName: 'Country', field: 'country', width: 120},
    {headerName: 'Year', field: 'year', width: 90},
    {headerName: 'Sport', field: 'sport', width: 110},
    {headerName: 'Gold', field: 'gold', width: 100, aggFunc: 'sum'}
];

let gridOptions = {
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

const actions = {
    'sort-by-one-column': {
        code: 'api.setSortModel([\n' +
        '    {colId: \'country\', sort: \'asc\'}\n' +
        ']);',
        fn() {
            api.setSortModel([{colId: 'country', sort: 'asc'}]);
        }
    },
    'sort-by-two-columns': {
        code: 'api.setSortModel([\n' +
        '    {colId: \'country\', sort: \'asc\'},\n' +
        '    {colId: \'year\', sort: \'asc\'}\n' +
        ']);',
        fn() {
            api.setSortModel([{colId: 'country', sort: 'asc'}, {colId: 'year', sort: 'asc'}]);
        }
    },
    'clear-sorting': {
        code: 'api.setSortModel([]);',
        fn() {
            api.setSortModel([]);
        }
    },
    'set-filter-by-one-column': {
        code: 'api.setFilterModel({country: [\'United States\']});',
        fn() {
            api.setFilterModel({country: ['United States']});
        }
    },
    'remove-filter': {
        code: 'api.setFilterModel({});',
        fn() {
            api.setFilterModel({});
        }
    },
    'group-by-three-columns': {
        code: 'columnApi.setRowGroupColumns(\n' +
        '    [\'country\', \'year\', \'sport\']\n' +
        ');',
        fn() {
            columnApi.setRowGroupColumns(['country', 'year', 'sport']);
        }
    },
    'expand-top-level-rows': {
        code: 'api.forEachNode(function (node) {\n' +
        '    if (node.level === 0) {\n' +
        '        node.setExpanded(true);\n' +
        '    }\n' +
        '});',
        fn() {
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
        fn() {
            api.forEachNode(function (node) {
                if (node.level === 0) {
                    node.setExpanded(false);
                }
            });
        }
    },
    'remove-grouping': {
        code: 'columnApi.setRowGroupColumns([]);',
        fn() {
            columnApi.setRowGroupColumns([]);
        }
    },
    'set-row-height': {
        code: 'const rowNode = api.getDisplayedRowAtIndex(3);\n' +
        'rowNode.setRowHeight(100);\n' +
        'api.onRowHeightChanged();',
        fn() {
            const rowNode = api.getDisplayedRowAtIndex(3);
            rowNode.setRowHeight(100);
            api.onRowHeightChanged();
        }
    },
    'reset-row-height': {
        code: 'api.resetRowHeights();',
        fn() {
            api.resetRowHeights();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
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
    const placeholder = document.querySelector('.api-code > pre');
    const actionNodes = [];
    for (let action in actions) {
        const node = document.querySelector(`[data-action="${action}"]`);
        actionNodes.push(node);
        node.addEventListener('click', () => {
            actionNodes.forEach((n) => {
                n.classList.remove('active');
            });
            node.classList.add('active');
            callGridApi(actions[action], placeholder)
        });
    }

    actionNodes[0].classList.add('active');
    callGridApi(actions['sort-by-one-column'], placeholder);
});