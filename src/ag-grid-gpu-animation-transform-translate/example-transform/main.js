
var eRows = [];

var ROW_COUNT = 50;
var COL_COUNT = 200;
var COL_WIDTH = 40;
var ROW_HEIGHT = 25;

var colors = ["#FFFFFF","#FFFAFA","#F0FFF0","#F5FFFA","#F0FFFF",
    "#F0F8FF","#F8F8FF","#F5F5F5","#FFF5EE","#F5F5DC","#FDF5E6",
    "#FFFAF0","#FFFFF0","#FAEBD7","#FAF0E6","#FFF0F5","#FFE4E1"
];

function setupSampleGrid() {

    var eContainer = document.querySelector('#eContainer');
    eContainer.style.width = (COL_COUNT * COL_WIDTH) + 'px';

    for (var rowIndex = 0; rowIndex<ROW_COUNT; rowIndex++) {
        var eRow = document.createElement('div');
        eRow.classList.add('row');
        eRow.style.transform = 'translateY('+(rowIndex * ROW_HEIGHT)+'px)';
        eRow.style.backgroundColor = colors[rowIndex % colors.length];

        for (var colIndex = 0; colIndex<COL_COUNT; colIndex++) {
            var eCell = document.createElement('div');
            eCell.classList.add('cell');
            eCell.style.left = (colIndex * COL_WIDTH) + 'px';
            eCell.innerHTML = Math.floor(Math.random()*100).toLocaleString();
            eRow.appendChild(eCell);
        }

        eRows.push(eRow);

        eContainer.appendChild(eRow);
    }
}

function onShuffleRows() {
    eRows.reverse();
    eRows.forEach( function(eRow, rowIndex) {
        eRow.style.transform = 'translateY('+(rowIndex * ROW_HEIGHT)+'px)';
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    setupSampleGrid();
});
