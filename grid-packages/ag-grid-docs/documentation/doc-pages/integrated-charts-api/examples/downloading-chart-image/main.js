var gridOptions = {
    columnDefs: [
        {field: "country", chartDataType: 'category'},
        {field: "sugar", chartDataType: 'series'},
        {field: "fat", chartDataType: 'series'},
        {field: "weight", chartDataType: 'series'},
    ],
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    rowData: createRowData(),
    enableRangeSelection: true,
    popupParent: document.body,
    enableCharts: true,
    chartThemeOverrides: {
      cartesian: {
          axes: {
              category: {
                  label: {
                      rotation: 335
                  }
              }
          }
      }
    },
    onFirstDataRendered: onFirstDataRendered,
    onChartCreated: onChartCreated,
};

function onFirstDataRendered(params) {
    const createRangeChartParams = {
      cellRange: {
        columns: ['country', 'sugar', 'fat', 'weight'],
      },
      chartType: 'groupedColumn',
      chartContainer: document.querySelector('#myChart'),
    };
  
    params.api.createRangeChart(createRangeChartParams);
}

var chartId;
function onChartCreated(event) {
    chartId = event.chartId;
}

function downloadChartImage(fileFormat) {
    if (!chartId) {
        return;
    }

    const params = {fileFormat, chartId};
    const imageDataURL = gridOptions.api.getChartImageDataURL(params);

    if (imageDataURL) {
        const a = document.createElement('a');
        a.href = imageDataURL;
        a.download = "image";
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

function openChartImage(fileFormat) {
    if (!chartId) {
        return;
    }

    const params = {fileFormat, chartId};
    const imageDataURL = gridOptions.api.getChartImageDataURL(params);

    if (imageDataURL) {
        const image = new Image();
        image.src = imageDataURL;

        const w = window.open('');
        w.document.write(image.outerHTML);
        w.document.close();
    }
}

function createRowData() {
    var countries = ["Ireland", "Spain", "United Kingdom", "France", "Germany", "Luxembourg", "Sweden",
        "Norway", "Italy", "Greece", "Iceland", "Portugal", "Malta", "Brazil", "Argentina",
        "Colombia", "Peru", "Venezuela", "Uruguay", "Belgium"];

    return countries.map(function (country) {
        return {
            country: country,
            sugar: Math.floor(Math.floor(Math.random() * 50)),
            fat: Math.floor(Math.floor(Math.random() * 100)),
            weight: Math.floor(Math.floor(Math.random() * 200))
        };
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
