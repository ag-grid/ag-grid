var gridOptions = {
    columnDefs: [
        {
            field: 'colA',
            tooltipField: 'colA',
            filter: 'agSetColumnFilter',
        },
        {
            field: 'colB',
            tooltipField: 'colB',
            filter: 'agSetColumnFilter',
            filterParams: {
                showTooltips: true,
            }
        },
        {
            field: 'colC',
            tooltipField: 'colC',
            tooltipComponent: 'customTooltip',
            filter: 'agSetColumnFilter',
            filterParams: {
                showTooltips: true,
            }
        },
    ],
    defaultColDef: {
        flex: 1,
        resizable: true,
    },
    components: {
        customTooltip: CustomTooltip,
    },
    tooltipShowDelay: 100,
    rowData: createRowData(),
};

function createRowData() {
    var latinWords =
        'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore'.split(' ');

    function randomSentence() {
        var startIndex = Math.floor(Math.random() * (latinWords.length / 2));
        var str = latinWords.slice(startIndex, latinWords.length).join(' ');
        return str.charAt(0).toUpperCase() + str.slice(1, str.length);
    }

    var rowData = [];
    for (var i = 0; i < 100; i++) {
        var row = {
            colA: randomSentence(),
            colB: randomSentence(),
            colC: randomSentence()
        };

        rowData.push(row);
    }

    return rowData;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
