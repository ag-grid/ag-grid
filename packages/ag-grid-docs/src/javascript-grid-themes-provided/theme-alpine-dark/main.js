function countries() {
    var countries = [
        {country: 'Ireland', continent: 'Europe', language: 'English'},
        {country: 'Spain', continent: 'Europe', language: 'Spanish'},
        {country: 'United Kingdom', continent: 'Europe', language: 'English'},
        {country: 'France', continent: 'Europe', language: 'French'},
        {country: 'Germany', continent: 'Europe', language: '(other)'},
        {country: 'Sweden', continent: 'Europe', language: '(other)'},
        {country: 'Norway', continent: 'Europe', language: '(other)'},
        {country: 'Italy', continent: 'Europe', language: '(other)'},
        {country: 'Greece', continent: 'Europe', language: '(other)'},
        {country: 'Iceland', continent: 'Europe', language: '(other)'},
        {country: 'Portugal', continent: 'Europe', language: 'Portuguese'},
        {country: 'Malta', continent: 'Europe', language: '(other)'},
        {country: 'Brazil', continent: 'South America', language: 'Portuguese'},
        {country: 'Argentina', continent: 'South America', language: 'Spanish'},
        {country: 'Colombia', continent: 'South America', language: 'Spanish'},
        {country: 'Peru', continent: 'South America', language: 'Spanish'},
        {country: 'Venezuela', continent: 'South America', language: 'Spanish'},
        {country: 'Uruguay', continent: 'South America', language: 'Spanish'}
    ];
    return countries;
}

var games = [
    'Chess',
    'Cross and Circle',
    'Daldøs',
    'Downfall',
    'DVONN',
    'Fanorona',
    'Game of the Generals',
    'Ghosts',
    'Abalone',
    'Agon',
    'Backgammon',
    'Battleship',
    'Blockade',
    'Blood Bowl',
    'Bul',
    'Camelot',
    'Checkers',
    'Go',
    'Gipf',
    'Guess Who?',
    'Hare and Hounds',
    'Hex',
    'Hijara',
    'Isola',
    'Janggi (Korean Chess)',
    'Le Jeu de la Guerre',
    'Patolli',
    'Plateau',
    'PÜNCT',
    'Rithmomachy',
    'Sáhkku',
    'Senet',
    'Shogi',
    'Space Hulk',
    'Stratego',
    'Sugoroku',
    'Tâb',
    'Tablut',
    'Tantrix',
    'Wari',
    'Xiangqi (Chinese chess)',
    'YINSH',
    'ZÈRTZ',
    'Kalah',
    'Kamisado',
    'Liu po',
    'Lost Cities',
    'Mad Gab',
    'Master Mind',
    "Nine Men's Morris",
    'Obsession',
    'Othello'
];
var columnDefs = [
    {
        field: 'name',
        headerName: 'Name',
        rowGroup: true,
        hide: true
    },
    {
        headerName: 'Game Name',
        field: 'game.name',
        width: 267,
        editable: true,
        filter: 'agSetColumnFilter',
        tooltipField: 'gameName',
        checkboxSelection: function(params) {
            return params.columnApi.getRowGroupColumns().length === 0;
        },
        cellClass: function() {
            return 'alphabet';
        }
    },
    {
        headerName: 'Country',
        field: 'country',
        width: 200,
        editable: true,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            values: [
                'Argentina',
                'Brazil',
                'Colombia',
                'France',
                'Germany',
                'Greece',
                'Iceland',
                'Ireland',
                'Italy',
                'Malta',
                'Portugal',
                'Norway',
                'Peru',
                'Spain',
                'Sweden',
                'United Kingdom',
                'Uruguay',
                'Venezuela'
            ]
        },
        floatCell: true,
        filterParams: {
            cellHeight: 20,
            newRowsAction: 'keep'
        }
    },
    {
        headerName: 'Language',
        field: 'language',
        width: 200,
        editable: true,
        filter: 'agSetColumnFilter',
        cellEditor:'agSelectCellEditor',
        cellEditorParams: {
            values: ['English', 'Spanish', 'French', 'Portuguese', '(other)']
        }
    }
];

function createData() {
    var rowCount = 20;

    var row = 0;
    var data = [];

    for (var i = 0; i < rowCount; i++) {
        var rowItem = createRowItem(row);
        data.push(rowItem);
        row++;
    }

    return data;
}

function createRowItem(row) {
    var firstNames = ['Sophie', 'Isabelle', 'Emily', 'Olivia'];
    var lastNames = ['Beckham', 'Black', 'Braxton', 'Brennan'];

    var rowItem = {};

    //create data for the known columns
    var countryData = countries()[row % countries().length];
    rowItem.country = countryData.country;
    rowItem.language = countryData.language;

    var firstName = firstNames[row % firstNames.length];
    var lastName = lastNames[row % lastNames.length];
    rowItem.name = firstName + ' ' + lastName;

    rowItem.game = {
        name: games[Math.floor(row * 13 / 17 * 19) % games.length]
    };
    rowItem.gameName = 'toolTip: ' + rowItem.game.name.toUpperCase();

    return rowItem;
}

var gridOptions = {
    groupSelectsChildren: true,
    groupDefaultExpanded: -1,
    autoGroupColumnDef: {
        headerName: 'Name',
        field: 'name',
        width: 250,
        editable: true,
        cellRendererParams: {
            checkbox: true
        }
    },
    defaultColDef: {
        checkboxSelection: function(params) {
            var isGrouping = params.columnApi.getRowGroupColumns().length > 0;
            return params.colIndex === 0 && !isGrouping;
        }
    },
    columnDefs: columnDefs,
    rowData: createData(),
    rowSelection: 'multiple'
};

document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.sizeColumnsToFit();
});
