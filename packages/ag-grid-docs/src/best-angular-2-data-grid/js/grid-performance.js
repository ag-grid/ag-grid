document.addEventListener('DOMContentLoaded', function () {
    gridDiv = document.querySelector('.performance .grid-container');

    new agGrid.Grid(gridDiv, gridOptions);
    createData();
});

let gridDiv;

const countries = [
    {country: 'Ireland', continent: 'Europe', language: 'English'},
    {country: 'Spain', continent: 'Europe', language: 'Spanish'},
    {country: 'United Kingdom', continent: 'Europe', language: 'English'},
    {country: 'France', continent: 'Europe', language: 'French'},
    {country: 'Germany', continent: 'Europe', language: 'German'},
    {country: 'Luxembourg', continent: 'Europe', language: 'French'},
    {country: 'Sweden', continent: 'Europe', language: 'Swedish'},
    {country: 'Norway', continent: 'Europe', language: 'Norwegian'},
    {country: 'Italy', continent: 'Europe', language: 'Italian'},
    {country: 'Greece', continent: 'Europe', language: 'Greek'},
    {country: 'Iceland', continent: 'Europe', language: 'Icelandic'},
    {country: 'Portugal', continent: 'Europe', language: 'Portuguese'},
    {country: 'Malta', continent: 'Europe', language: 'Maltese'},
    {country: 'Brazil', continent: 'South America', language: 'Portuguese'},
    {country: 'Argentina', continent: 'South America', language: 'Spanish'},
    {country: 'Colombia', continent: 'South America', language: 'Spanish'},
    {country: 'Peru', continent: 'South America', language: 'Spanish'},
    {country: 'Venezuela', continent: 'South America', language: 'Spanish'},
    {country: 'Uruguay', continent: 'South America', language: 'Spanish'},
    {country: 'Belgium', continent: 'Europe', language: 'French'}
];
const games = [
    'Chess', 'Cross and Circle', 'Daldos', 'Downfall', 'DVONN', 'Fanorona', 'Game of the Generals', 'Ghosts',
    'Abalone', 'Agon', 'Backgammon', 'Battleship', 'Blockade', 'Blood Bowl', 'Bul', 'Camelot', 'Checkers',
    'Go', 'Gipf', 'Guess Who?', 'Hare and Hounds', 'Hex', 'Hijara', 'Isola', 'Janggi (Korean Chess)', 'Le Jeu de la Guerre',
    'Patolli', 'Plateau', 'PUNCT', 'Rithmomachy', 'Sahkku', 'Senet', 'Shogi', 'Space Hulk', 'Stratego', 'Sugoroku',
    'Tab', 'Tablut', 'Tantrix', 'Wari', 'Xiangqi (Chinese chess)', 'YINSH', 'ZERTZ', 'Kalah', 'Kamisado', 'Liu po',
    'Lost Cities', 'Mad Gab', 'Master Mind', 'Nine Men\'s Morris', 'Obsession', 'Othello'
];
const booleanValues = [true, 'true', false, 'false'];
const firstNames = [
    'Tony', 'Andrew', 'Kevin', 'Bricker', 'Dimple', 'Bas', 'Sophie', 'Isabelle', 'Emily', 'Olivia', 'Lily', 'Chloe', 'Isabella',
    'Amelia', 'Jessica', 'Sophia', 'Ava', 'Charlotte', 'Mia', 'Lucy', 'Grace', 'Ruby',
    'Ella', 'Evie', 'Freya', 'Isla', 'Poppy', 'Daisy', 'Layla'
];
const lastNames = [
    'Smith', 'Connell', 'Flanagan', 'McGee', 'Unalkat', 'Rahman', 'Beckham', 'Black', 'Braxton', 'Brennan', 'Brock', 'Bryson', 'Cadwell',
    'Cage', 'Carson', 'Chandler', 'Cohen', 'Cole', 'Corbin', 'Dallas', 'Dalton', 'Dane',
    'Donovan', 'Easton', 'Fisher', 'Fletcher', 'Grady', 'Greyson', 'Griffin', 'Gunner',
    'Hayden', 'Hudson', 'Hunter', 'Jacoby', 'Jagger', 'Jaxon', 'Jett', 'Kade', 'Kane',
    'Keating', 'Keegan', 'Kingston', 'Kobe'
];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const colDefs = [
    {
        headerName: 'Participant',
        children: [
            {
                headerName: 'Name',
                rowDrag: true,
                field: 'name',
                width: 200,
                editable: true,
                enableRowGroup: true,
                filter: 'agTextColumnFilter',
                // floatingFilterComponent: 'personFloatingFilterComponent',
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
                headerName: 'Language', field: 'language', width: 150, editable: true, filter: 'agSetColumnFilter',
                cellEditor: 'agSelectCellEditor',
                enableRowGroup: true,
                enablePivot: true,
                cellEditorParams: {
                    values: [
                        'English', 'Spanish', 'French', 'Portuguese', 'German',
                        'Swedish', 'Norwegian', 'Italian', 'Greek', 'Icelandic', 'Portuguese', 'Maltese'
                    ]
                },
                headerTooltip: 'Example tooltip for Language',
                filterParams: {
                    selectAllOnMiniFilter: true,
                    newRowsAction: 'keep',
                    clearButton: true
                }
            },
            {
                headerName: 'Country', field: 'country', width: 150, editable: true,
                cellRenderer: 'countryCellRenderer',
                enableRowGroup: true,
                enablePivot: true,
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: {
                    cellRenderer: 'countryCellRenderer',
                    values: [
                        'Argentina', 'Brazil', 'Colombia', 'France', 'Germany', 'Greece', 'Iceland', 'Ireland',
                        'Italy', 'Malta', 'Portugal', 'Norway', 'Peru', 'Spain', 'Sweden', 'United Kingdom',
                        'Uruguay', 'Venezuela', 'Belgium', 'Luxembourg'
                    ]
                },
                floatCell: true,
                filter: 'agSetColumnFilter',
                filterParams: {
                    cellRenderer: 'countryCellRenderer',
                    newRowsAction: 'keep',
                    selectAllOnMiniFilter: true,
                    clearButton: true
                },
                icons: {
                    sortAscending: '<i class="fa fa-sort-alpha-asc"/>',
                    sortDescending: '<i class="fa fa-sort-alpha-desc"/>'
                }
            }
        ]
    },
    {
        headerName: 'Game of Choice',
        children: [
            {
                headerName: 'Game Name', field: 'game.name', width: 180, editable: true, filter: 'agSetColumnFilter',
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
                icons: {
                    sortAscending: '<i class="fa fa-sort-alpha-asc"/>',
                    sortDescending: '<i class="fa fa-sort-alpha-desc"/>'
                }
            },
            {
                headerName: 'Bought', field: 'game.bought', filter: 'agSetColumnFilter', editable: true, width: 150,
                enableRowGroup: true,
                enablePivot: true,
                enableValue: true,
                cellRenderer: 'booleanCellRenderer', cellStyle: {'text-align': 'center'}, comparator: booleanComparator,
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
        headerName: 'Performance',
        groupId: 'performance',
        children: [
            {
                headerName: 'Bank Balance', field: 'bankBalance', width: 180, editable: true,
                filter: 'agNumberColumnFilter', valueFormatter: currencyFormatter,
                type: 'numericColumn',
                enableValue: true,
                icons: {
                    sortAscending: '<i class="fa fa-sort-amount-asc"/>',
                    sortDescending: '<i class="fa fa-sort-amount-desc"/>'
                }
            }
        ]
    },
    {
        headerName: 'Rating',
        field: 'rating',
        width: 120,
        editable: true,
        cellRenderer: 'ratingRenderer',
        floatCell: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        filterParams: {
            cellRenderer: 'ratingFilterRenderer'
        }
    },
    {
        headerName: 'Total Winnings',
        field: 'totalWinnings',
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        editable: true, valueParser: numberParser, width: 170,
        enableValue: true,
        valueFormatter: currencyFormatter, cellStyle: currencyCssFunc,
        icons: {
            sortAscending: '<i class="fa fa-sort-amount-asc"/>',
            sortDescending: '<i class="fa fa-sort-amount-desc"/>'
        }
    }
];
const monthGroup = {
    headerName: 'Monthly Breakdown',
    children: []
};
colDefs.push(monthGroup);
months.forEach(function (month) {
    monthGroup.children.push({
        headerName: month, field: month.toLocaleLowerCase(),
        width: 110, filter: 'agNumberColumnFilter', editable: true, type: 'numericColumn',
        enableValue: true,
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

const gridOptions = {
    components: {
        booleanFilterCellRenderer: booleanFilterCellRenderer,
        ratingFilterRenderer: ratingFilterRenderer,

        countryCellRenderer: countryCellRenderer,
        booleanCellRenderer: booleanCellRenderer,
        ratingRenderer: ratingRenderer
    },
    floatingFilter: true,
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    enableRangeSelection: true
};

const rowCount = 100000;

function createData() {
    let row = 0;
    let data = [];

    gridOptions.api.showLoadingOverlay();

    const intervalId = setInterval(function () {
        for (let i = 0; i < 1000; i++) {
            if (row < rowCount) {
                const rowItem = createRowItem(row);
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

// it's important for the `seed` to be outside `pseudoRandom`
// since it's mutated inside the function
let seed = 123456789;

function pseudoRandom() {
    const m = Math.pow(2, 32);
    const a = 1103515245;
    const c = 12345;

    // taken from http://stackoverflow.com/questions/3062746/special-simple-random-number-generator
    seed = (a * seed + c) % m;
    return seed / m;
}

function createRowItem(row) {
    const rowItem = {};

    //create data for the known columns
    const countriesToPickFrom = Math.floor(countries.length * ((row % 3 + 1) / 3));
    const countryData = countries[(row * 19) % countriesToPickFrom];

    rowItem.country = countryData.country;
    rowItem.continent = countryData.continent;
    rowItem.language = countryData.language;

    const firstName = firstNames[row % firstNames.length];
    const lastName = lastNames[row % lastNames.length];

    rowItem.name = firstName + ' ' + lastName;

    rowItem.game = {
        name: games[Math.floor(row * 13 / 17 * 19) % games.length],
        bought: booleanValues[row % booleanValues.length]
    };

    rowItem.bankBalance = (Math.round(pseudoRandom() * rowCount)) - 3000;
    rowItem.rating = (Math.round(pseudoRandom() * 5));

    let totalWinnings = 0;
    months.forEach(function (month) {
        const value = (Math.round(pseudoRandom() * rowCount)) - 20;
        rowItem[month.toLocaleLowerCase()] = value;
        totalWinnings += value;
    });
    rowItem.totalWinnings = totalWinnings;

    return rowItem;
}

function numberParser(params) {
    const newValue = params.newValue;
    let valueAsNumber;
    if (newValue === null || newValue === undefined || newValue === '') {
        valueAsNumber = null;
    } else {
        valueAsNumber = parseFloat(params.newValue);
    }
    return valueAsNumber;
}

function currencyCssFunc(params) {
    if (params.value !== null && params.value !== undefined && params.value < 0) {
        return {'color': 'red', 'font-weight': 'bold'};
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
    let result = '<span>';
    for (let i = 0; i < 5; i++) {
        if (value > i) {
            result += '<img src="../assets/images/star.svg" class="star" width=12 height=12 />';
        }
    }
    if (forFilter && value === 0) {
        result += '(no stars)';
    }
    result += '</span>';
    return result;
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
            return '$' + Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        }
    }
}

function parseBoolean(value) {
    if (value === 'true' || value === true || value === 1) {
        return true;
    } else if (value === 'false' || value === false || value === 0) {
        return false;
    } else {
        return null;
    }
}

function booleanComparator(value1, value2) {
    const value1Cleaned = parseBoolean(value1);
    const value2Cleaned = parseBoolean(value2);
    const value1Ordinal = value1Cleaned === true ? 0 : (value1Cleaned === false ? 1 : 2);
    const value2Ordinal = value2Cleaned === true ? 0 : (value2Cleaned === false ? 1 : 2);
    return value1Ordinal - value2Ordinal;
}

function booleanCellRenderer(params) {
    const valueCleaned = parseBoolean(params.value);
    if (valueCleaned === true) {
        return '<span title=\'true\' class=\'ag-icon ag-icon-tick content-icon\'></span>';
    } else if (valueCleaned === false) {
        return '<span title=\'false\' class=\'ag-icon ag-icon-cross content-icon\'></span>';
    } else if (params.value !== null && params.value !== undefined) {
        return params.value.toString();
    } else {
        return null;
    }
}

function booleanFilterCellRenderer(params) {
    const valueCleaned = parseBoolean(params.value);
    if (valueCleaned === true) {
        return '<span title=\'true\' class=\'ag-icon ag-icon-tick content-icon\'></span>';
    } else if (valueCleaned === false) {
        return '<span title=\'false\' class=\'ag-icon ag-icon-cross content-icon\'></span>';
    } else {
        return '(empty)';
    }
}

function countryCellRenderer(params) {
    const COUNTRY_CODES = {
        Ireland: 'ie',
        Luxembourg: 'lu',
        Belgium: 'be',
        Spain: 'es',
        'United Kingdom': 'gb',
        France: 'fr',
        Germany: 'de',
        Sweden: 'se',
        Italy: 'it',
        Greece: 'gr',
        Iceland: 'is',
        Portugal: 'pt',
        Malta: 'mt',
        Norway: 'no',
        Brazil: 'br',
        Argentina: 'ar',
        Colombia: 'co',
        Peru: 'pe',
        Venezuela: 've',
        Uruguay: 'uy'
    };

    //get flags from here: http://www.freeflagicons.com/
    if (params.value === '' || params.value === undefined || params.value === null) {
        return '';
    } else {
        const flag = '<img class="flag" border="0" width="15" height="10" src="https://flags.fmcdn.net/data/flags/mini/' + COUNTRY_CODES[params.value] + '.png">';
        return flag + ' ' + params.value;
    }
}