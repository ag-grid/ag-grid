document.addEventListener('DOMContentLoaded', function () {
    gridDiv = document.querySelector('#myGrid');

    new agGrid.Grid(gridDiv, gridOptions);
    createData();
});

var gridDiv;

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

var games = ["Chess", "Cross and Circle", "Daldøs", "Downfall", "DVONN", "Fanorona", "Game of the Generals", "Ghosts",
    "Abalone", "Agon", "Backgammon", "Battleship", "Blockade", "Blood Bowl", "Bul", "Camelot", "Checkers",
    "Go", "Gipf", "Guess Who?", "Hare and Hounds", "Hex", "Hijara", "Isola", "Janggi (Korean Chess)", "Le Jeu de la Guerre",
    "Patolli", "Plateau", "PÜNCT", "Rithmomachy", "Sáhkku", "Senet", "Shogi", "Space Hulk", "Stratego", "Sugoroku",
    "Tâb", "Tablut", "Tantrix", "Wari", "Xiangqi (Chinese chess)", "YINSH", "ZÈRTZ", "Kalah", "Kamisado", "Liu po",
    "Lost Cities", "Mad Gab", "Master Mind", "Nine Men's Morris", "Obsession", "Othello"
];

var firstNames = ["Sophie", "Isabelle", "Emily", "Olivia"];
var lastNames = ["Beckham", "Black", "Braxton", "Brennan"];


var gridOptions = {
    groupSelectsChildren: true,
    groupDefaultExpanded: -1,
    autoGroupColumnDef:{
        headerName: 'Name',
        field: 'name',
        width: 250,
        editable: true
    },
    defaultColDef: {
        checkboxSelection: function (params) {
            var isGrouping = gridOptions.columnApi.getRowGroupColumns().length > 0;
            return params.colIndex === 0 && !isGrouping;
        }
    },
    rowSelection: "multiple",
    rowHeight: 48,
    icons: {
        checkboxChecked: '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxMTQzMkY1NDIyMjhFNjExQkVGOEFCQUI5MzdBNjFEMSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoyMzBBQkU2ODI4MjQxMUU2QjlDRUZCNUFDREJGRTVDMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyMzBBQkU2NzI4MjQxMUU2QjlDRUZCNUFDREJGRTVDMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjE0NDMyRjU0MjIyOEU2MTFCRUY4QUJBQjkzN0E2MUQxIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjExNDMyRjU0MjIyOEU2MTFCRUY4QUJBQjkzN0E2MUQxIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+O+zv0gAAAQ1JREFUeNpilJvw35OBgWEuEEsyEAeeA3EyI1DjMxI0wTUzkaEJBCSZiFVpJcvAsDqEgUFVCMInSqOeOAPDLG8GBjNpBoZCCyI1KggwMCzwZ2DgZWdgOPWUgaF4F5pGDxWgqT4MDPzsSB7hYWBYHMDAIMzJwHDjDQND0mYGhu9/0DT6qTEwuCszMOyIZmAwkoTYALJJjp+B4cEHBoaEjQwMn38iDAVFx38wA4gzTBgYSiwhEi++MDDI8DEwvP3OwBC0CqIZGcBtBOmefoaBIXQNA8PvfxBNf4B03AZMTVgD5xwwXcQDFX/8wcAw+RQDw5VX2AMN7lRSARM07ZEKXoA0poAYJGh6CkrkAAEGAKNeQxaS7i+xAAAAAElFTkSuQmCC"/>'
    }
};

var defaultCols = [
    {
        headerName: 'Name',
        field: 'name',
        width: 250,
        rowGroup: true,
        hide:true
    },
    {
        headerName: "Game Name", field: "game.name", width: 267, editable: true, filter: 'agSetColumnFilter',
        tooltipField: 'gameName',
        checkboxSelection: function (params) {
            return params.columnApi.getRowGroupColumns().length === 0;
        },
        cellClass: function () {
            return 'alphabet';
        }
    },
    {
        headerName: "Country", field: "country", width: 200, editable: true,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            values: ["Argentina", "Brazil", "Colombia", "France", "Germany", "Greece", "Iceland", "Ireland",
                "Italy", "Malta", "Portugal", "Norway", "Peru", "Spain", "Sweden", "United Kingdom",
                "Uruguay", "Venezuela"]
        },
        floatCell: true
    },
    {
        headerName: "Language", field: "language", width: 200, editable: true, filter: 'agSetColumnFilter',
        cellEditor:'agSelectCellEditor',
        cellEditorParams: {
            values: ['English', 'Spanish', 'French', 'Portuguese', '(other)']
        }
    }
];


function createData() {

    gridOptions.api.showLoadingOverlay();

    var rowCount = 20;

    var row = 0;
    var data = [];

    for (var i = 0; i < rowCount; i++) {
        var rowItem = createRowItem(row);
        data.push(rowItem);
        row++;
    }

    gridOptions.api.setColumnDefs(defaultCols);
    gridOptions.api.setRowData(data);
}

function createRowItem(row) {
    var rowItem = {};

    //create data for the known columns
    var countryData = countries[row % countries.length];
    rowItem.country = countryData.country;
    rowItem.language = countryData.language;

    var firstName = firstNames[row % firstNames.length];
    var lastName = lastNames[row % lastNames.length];
    rowItem.name = firstName + " " + lastName;

    rowItem.game = {
        name: games[Math.floor(row * 13 / 17 * 19) % games.length],
    };
    rowItem.gameName = 'toolTip: ' + rowItem.game.name.toUpperCase();

    return rowItem;
}
