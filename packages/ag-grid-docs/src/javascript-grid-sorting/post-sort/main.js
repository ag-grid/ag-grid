var columnDefs = [
    {field: "athlete"},
    {field: "age", width: 100},
    {field: "country", sort: 'asc'},
    {field: "year"},
    {field: "date"},
    {field: "sport"},
    {field: "gold"},
    {field: "silver"},
    {field: "bronze"},
    {field: "total"}
];

var gridOptions = {
    defaultColDef: {
        width: 150
    },
    columnDefs: columnDefs,
    enableSorting: true,
    postSort(rowNodes) {
      // here we put Ireland rows on top while preserving the sort order

      function isIreland(node) {
        return node.data.country === "Ireland";
      }

      function move(toIndex, fromIndex) {
        rowNodes.splice(toIndex, 0, rowNodes.splice(fromIndex, 1)[0]);
      }

      var nextInsertPos = 0;
      for (var i = 0; i < rowNodes.length; i++) {
        if (isIreland(rowNodes[i])) {
          move(nextInsertPos, i)
          nextInsertPos++;
        }
      }
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });

});
