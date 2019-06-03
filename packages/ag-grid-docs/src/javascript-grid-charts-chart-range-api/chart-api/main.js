var columnDefs = [
    {field: "name", width: 150, enableRowGroup: true},
    {field: "group", width: 150, enableRowGroup: true},
    {field: "apples", enableValue: true},
    {field: "oranges", enableValue: true},
    {field: "pears", enableValue: true},
    {field: "bananas", enableValue: true},
];

var names = ['Andy Murray', 'Magnus Moan', 'Eric Lamaze', 'Christine Girard', 'Alistair Brownlee',
    'Jonny Brownlee', 'Simon Whitfield', 'Simon Whitfield', 'Jade Jones', 'Lutalo Muhammad',
    'Karine Sergerie', 'Nina Solheim', 'Sarah Stevenson', 'Dominique Bosshart', 'Trude Gundersen',
    'Laura Robson', 'Sébastien Lareau', 'Daniel Nestor', 'Sara Nordenstam', 'Alexander Dale Oen',
    'Håvard Bøkko', 'Lasse Sætre', 'Ådne Søndrål', 'Jasey-Jay Anderson', 'Maëlle Ricker',
    'Mike Robertson', 'Kjersti Buaas', 'Dominique Maltais', 'Jon Montgomery', 'Amy Williams',
    'Duff Gibson', 'Mellisa Hollingsworth-Richards', 'Jeff Pain', 'Shelley Rudman', 'Alex Coomber',
    'Peter Wilson', 'Tore Brovold', 'Richard Faulds', 'Ian Peel', 'Harald Stenvaag', 'Ross MacDonald',
    'Siren Sundby', 'Mike Wolfs', 'Paul Davis', 'Herman Horn Johannessen', 'Espen Stokkeland',
    'Fredrik Bekken', 'Olaf Tufte', 'Karina Bryant', 'Gemma Gibbons', 'Antoine Valois-Fortier',
    'Nicolas Gill', 'Kate Howey', 'Kyle Shewfelt', 'Hedda Berntsen', 'Audun Grønvold', 'Kari Traa',
    'Bartosz Piasecki', 'Mac Cone', 'Jill Henselwood', 'Ian Millar', 'Tom Daley', 'Leon Taylor',
    'Peter Waterfield', 'Alexander Kristoff', 'Gunn Rita Dahle-Flesjå', 'Chandra Crawford', 'Sara Renner',
    'Beckie Scott', 'Gail Emms', 'Nathan Robertson', 'Simon Archer', 'Joanne Wright-Goode', 'Derek Drouin',
    'Priscilla Lopes-Schliep', 'Alison Williamson'];

var groups = ['Fast Ducks', 'Speedy Spanners', 'Lightening Strikers', 'Burning Buddies'];

var gridOptions = {
    defaultColDef: {
        width: 100,
        resizable: true
    },
    columnDefs: columnDefs,
    enableRangeSelection: true,
    enableCharts: true,
    onGridReady: function(params) {
        var rowData = [];
        names.forEach( function(name, index) {
            rowData.push({
                name: name,
                group: groups[index % 4],
                apples: ((index+1) * 17 % 20),
                oranges: ((index+1) * 19 % 20),
                pears: ((index+1) * 13 % 20),
                bananas: ((index+1) * 133 % 20),
            })
        });
        params.api.setRowData(rowData);
    }
};

function onChart1() {
    let params = {
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 4,
            columns: ['apples','oranges']
        },
        chartType: 'groupedBar'
    };
    gridOptions.api.chartRange(params);
}

function onChart2() {
    let params = {
        cellRange: {
            columns: ['bananas','pears']
        },
        chartType: 'line'
    };
    gridOptions.api.chartRange(params);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
