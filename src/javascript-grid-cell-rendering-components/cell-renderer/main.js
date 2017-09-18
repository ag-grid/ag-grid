var gridOptions;

function createImageSpan(imageMultiplier, image) {
    var resultElement = document.createElement("span");
    for (var i = 0; i < imageMultiplier; i++) {
        var imageElement = document.createElement("img");
        imageElement.src = "https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/" + image;
        resultElement.appendChild(imageElement);
    }
    return resultElement;
}

/**
 * Updates the Days of Air Frost column - adjusts the value which in turn will demonstrate the Component refresh functionality
 * After a data update, cellRenderer Components.refresh method will be called to re-render the altered Cells
 */
function frostierYear(extraDaysFrost) {
    var model = gridOptions.api.getModel();
    for (var i = 0; i < model.rowsToDisplay.length; i++) {
        var rowNode = model.rowsToDisplay[i];
        rowNode.setDataValue('Days of air frost (days)', rowNode.data['Days of air frost (days)'] + extraDaysFrost);
    }
}

/**
 * Demonstrating function cell renderer
 * Visually indicates if this months value is higher or lower than last months value
 * by adding an +/- symbols according to the difference
 */
function deltaIndicator(params, field) {
    var rowsToDisplay = gridOptions.api.getModel().rowsToDisplay;

    var index = params.node.childIndex - 1;
    if (params.node.firstChild) {
        index = rowsToDisplay[rowsToDisplay.length - 1].childIndex;
    }

    var element = document.createElement("span");
    var imageElement = document.createElement("img");

    // visually indicate if this months value is higher or lower than last months value
    if (params.value > rowsToDisplay[index].data[field]) {
        imageElement.src = "https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/fire-plus.png"
    } else {
        imageElement.src = "https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/fire-minus.png"
    }
    element.appendChild(imageElement);
    element.appendChild(document.createTextNode(params.value));
    return element;
}

/**
 * Demonstrating Component Cell Rendere
 */
function DaysFrostRenderer() {
    this.eGui = document.createElement("span");
}
DaysFrostRenderer.prototype.init = function (params) {
    var daysFrost = params.value;
    for (var i = 0; i < daysFrost; i++) {
        var starImageElement = document.createElement("img");
        starImageElement.src = "https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/" + params.rendererImage;
        this.eGui.appendChild(starImageElement);
    }
};
DaysFrostRenderer.prototype.getGui = function getGui() {
    return this.eGui;
};
DaysFrostRenderer.prototype.refresh = function (params) {
    this.eGui.innerHTML = '';
    this.init(params)
};

/**
 *  Cell Renderer by Property (using the api)
 */
function daysSunshineRenderer(params) {
    var daysSunshine = params.value / 24;
    return createImageSpan(daysSunshine, params.rendererImage);
}

/**
 *  Cell Renderer by Property (using the gridOptions parameter)
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
        cellRenderer: function (params) {      // Function cell renderer
            return deltaIndicator(params, "Max temp (C)");
        }
    },
    {
        headerName: "Min Temp (˚C)",
        field: "Min temp (C)",
        width: 120,
        cellRenderer: function (params) {      // Function cell renderer
            return deltaIndicator(params, "Min temp (C)");
        }
    },
    {
        headerName: "Days of Air Frost",
        field: "Days of air frost (days)",
        width: 233,
        cellRenderer: DaysFrostRenderer,       // Component Cell Renderer
        cellRendererParams: {
            rendererImage: 'frost.png'         // Complementing the Cell Renderer parameters
        }
    },
    {
        headerName: "Days Sunshine",
        field: "Sunshine (hours)",
        width: 190,
        cellRenderer: daysSunshineRenderer,
        cellRendererParams: {
            rendererImage: 'sun.png'           // Complementing the Cell Renderer parameters
        }

    },
    {
        headerName: "Rainfall (10mm)",
        field: "Rainfall (mm)",
        width: 180,
        cellRenderer: rainPerTenMmRenderer,
        cellRendererParams: {
            rendererImage: 'rain.png'          // Complementing the Cell Renderer parameters
        }
    }
];

gridOptions = {
    columnDefs: columnDefs,
    rowData: null
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/weather_se_england.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
