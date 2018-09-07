function createImageSpan(imageMultiplier, image) {
    var resultElement = document.createElement("span");
    for (var i = 0; i < imageMultiplier; i++) {
        var imageElement = document.createElement("img");
        imageElement.src = "https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/images/" + image;
        resultElement.appendChild(imageElement);
    }
    return resultElement;
}

/**
 * Updates the Days of Air Frost column - adjusts the value which in turn will demonstrate the Component refresh functionality
 * After a data update, cellRenderer Components.refresh method will be called to re-render the altered Cells
 */
function frostierYear(extraDaysFrost) {
    // iterate over the rows and make each "days of air frost"
    gridOptions.api.forEachNode(function(rowNode) {
        rowNode.setDataValue('Days of air frost (days)', rowNode.data['Days of air frost (days)'] + extraDaysFrost);
    })
}

/**
 * Demonstrating function cell renderer
 * Visually indicates if this months value is higher or lower than last months value
 * by adding an +/- symbols according to the difference
 */
function deltaIndicator(params) {
    var element = document.createElement("span");
    var imageElement = document.createElement("img");

    // visually indicate if this months value is higher or lower than last months value
    if (params.value > 15) {
        imageElement.src = "https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/images/fire-plus.png"
    } else {
        imageElement.src = "https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/images/fire-minus.png"
    }
    element.appendChild(imageElement);
    element.appendChild(document.createTextNode(params.value));
    return element;
}

/**
 * Demonstrating Component Cell Renderer
 */
function DaysFrostRenderer() {
    this.eGui = document.createElement("span");
}
DaysFrostRenderer.prototype.init = function (params) {
    this.rendererImage = params.rendererImage;
    this.value = params.value;
    this.updateImages();
};
DaysFrostRenderer.prototype.updateImages = function() {
    var daysFrost = this.value;
    for (var i = 0; i < daysFrost; i++) {
        var imageElement = document.createElement("img");
        imageElement.src = "https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/images/" + this.rendererImage;
        this.eGui.appendChild(imageElement);
    }
};
DaysFrostRenderer.prototype.getGui = function getGui() {
    return this.eGui;
};
DaysFrostRenderer.prototype.refresh = function (params) {
    this.value = params.value;

    this.eGui.innerHTML = '';
    this.updateImages();
};

/**
 *  Cell Renderer by Property (using the api)
 */
function daysSunshineRenderer(params) {
    var daysSunshine = params.value / 24;
    return createImageSpan(daysSunshine, params.rendererImage);
}

/**
 *  Cell Renderer by Property (using the grid options parameter)
 */
function rainPerTenMmRenderer(params) {
    var rainPerTenMm = params.value / 10;
    return createImageSpan(rainPerTenMm, params.rendererImage);
}

var columnDefs = [
    {
        headerName: "Month",
        field: "Month",
        width: 75,
        cellStyle: {color: 'darkred'}
    },
    {
        headerName: "Max Temp (˚C)",
        field: "Max temp (C)",
        width: 120,
        cellRenderer: 'deltaIndicator'           // Function cell renderer
    },
    {
        headerName: "Min Temp (˚C)",
        field: "Min temp (C)",
        width: 120,
        cellRenderer: 'deltaIndicator'           // Function cell renderer
    },
    {
        headerName: "Days of Air Frost",
        field: "Days of air frost (days)",
        width: 233,
        cellRenderer: 'daysFrostRenderer',       // Component Cell Renderer
        cellRendererParams: {
            rendererImage: 'frost.png'         // Complementing the Cell Renderer parameters
        }
    },
    {
        headerName: "Days Sunshine",
        field: "Sunshine (hours)",
        width: 190,
        cellRenderer: 'daysSunshineRenderer',
        cellRendererParams: {
            rendererImage: 'sun.png'           // Complementing the Cell Renderer parameters
        }

    },
    {
        headerName: "Rainfall (10mm)",
        field: "Rainfall (mm)",
        width: 180,
        cellRenderer: 'rainPerTenMmRenderer',
        cellRendererParams: {
            rendererImage: 'rain.png'          // Complementing the Cell Renderer parameters
        }
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    components:{
        deltaIndicator: deltaIndicator,
        daysFrostRenderer: DaysFrostRenderer,
        daysSunshineRenderer: daysSunshineRenderer,
        rainPerTenMmRenderer: rainPerTenMmRenderer
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/weather_se_england.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
