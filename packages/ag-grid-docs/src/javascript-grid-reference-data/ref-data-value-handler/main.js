var carMappings = {"tyt": "Toyota", "frd": "Ford", "prs": "Porsche", "nss": "Nissan"};
var colourMappings = {"cb": "Cadet Blue", "bw": "Burlywood", "fg": "Forest Green"};

var rowData = [
    {make: "tyt", exteriorColour: "fg", interiorColour: "bw", price: 35000},
    {make: "frd", exteriorColour: "bw", interiorColour: "cb", price: 32000},
    {make: "prs", exteriorColour: "cb", interiorColour: "fg", price: 72000},
    {make: "tyt", exteriorColour: "fg", interiorColour: "bw", price: 35000},
    {make: "frd", exteriorColour: "bw", interiorColour: "cb", price: 32000},
    {make: "prs", exteriorColour: "cb", interiorColour: "fg", price: 72000},
    {make: "tyt", exteriorColour: "fg", interiorColour: "bw", price: 35000},
    {make: "frd", exteriorColour: "bw", interiorColour: "cb", price: 32000},
    {make: "prs", exteriorColour: "cb", interiorColour: "fg", price: 72000},
    {make: "tyt", exteriorColour: "fg", interiorColour: "bw", price: 35000},
    {make: "frd", exteriorColour: "bw", interiorColour: "cb", price: 32000},
    {make: "prs", exteriorColour: "cb", interiorColour: "fg", price: 72000},
    {make: "tyt", exteriorColour: "fg", interiorColour: "bw", price: 35000},
    {make: "frd", exteriorColour: "bw", interiorColour: "cb", price: 32000},
    {make: "prs", exteriorColour: "cb", interiorColour: "fg", price: 72000},
    {make: "prs", exteriorColour: "cb", interiorColour: "fg", price: 72000},
    {make: "tyt", exteriorColour: "fg", interiorColour: "bw", price: 35000},
    {make: "frd", exteriorColour: "bw", interiorColour: "cb", price: 32000}
];

var gridOptions = {
    rowData: rowData,
    columnDefs: [
        {
            headerName: "Make",
            field: "make",
            cellEditor: "select",
            cellEditorParams: {
                values: extractValues(carMappings)
            },
            valueFormatter: function (params) {
                return lookupValue(carMappings, params.value);
            },
            valueParser: function (params) {
                return lookupKey(carMappings, params.newValue);
            }
        },
        {
            headerName: "Exterior Colour",
            field: "exteriorColour",
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
                values: extractValues(colourMappings),
                cellRenderer: colorCellRenderer
            },
            filter: 'agSetColumnFilter',
            filterParams: {
                values: extractValues(colourMappings),
                cellRenderer: colorCellRenderer
            },
            valueFormatter: function (params) {
                return lookupValue(colourMappings, params.value);
            },
            valueParser: function (params) {
                return lookupKey(colourMappings, params.newValue);
            },
            cellRenderer: colorCellRenderer
        },
        {
            headerName: "Interior Colour",
            field: "interiorColour",
            cellEditor:'agTextCellEditor',
            cellEditorParams: {
                useFormatter: true
            },
            filter: 'agSetColumnFilter',
            filterParams: {
                values: extractValues(colourMappings),
                cellRenderer: colorCellRenderer
            },
            valueFormatter: function (params) {
                return lookupValue(colourMappings, params.value);
            },
            valueParser: function (params) {
                return lookupKey(colourMappings, params.newValue);
            },
            cellRenderer: colorCellRenderer
        },
        {
            headerName: "Retail Price",
            field: "price",
            colId: "retailPrice",
            valueGetter: function (params) {
                return params.data.price;
            },
            valueFormatter: currencyFormatter,
            valueSetter: numberValueSetter
        },
        {
            headerName: "Retail Price (incl Taxes)",
            editable: false,
            // cellStyle: {'background-color': 'lightGrey'},
            valueGetter: function (params) {
                // example of chaining value getters
                return params.getValue("retailPrice") * 1.2;
            },
            valueFormatter: currencyFormatter
        }
    ],
    defaultColDef: {width: 185, editable: true},
    enableFilter: true,
    onCellValueChanged: function (params) {
        // notice that the data always contains the keys rather than values after editing
        console.log("onCellValueChanged: ", params);
    }
};

function extractValues(mappings) {
    return Object.keys(mappings);
}

function lookupValue(mappings, key) {
    return mappings[key];
}

function lookupKey(mappings, name) {
    for (var key in mappings) {
        if (mappings.hasOwnProperty(key)) {
            if (name === mappings[key]) {
                return key;
            }
        }
    }
}

function colorCellRenderer(params) {
    return "<span style='color:" + removeSpaces(params.valueFormatted) + "'>" + params.valueFormatted + "</span>";
}

function currencyFormatter(params) {
    var value = Math.floor(params.value);
    if (isNaN(value)) return "";
    return "£" + value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function numberValueSetter(params) {
    if (isNaN(parseFloat(params.newValue)) || !isFinite(params.newValue)) {
        return false; // don't set invalid numbers!
    }
    params.data.price = params.newValue;
    return true;
}

function removeSpaces(str) {
    return str ? str.replace(/\s/g, '') : str;
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function () {
    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector('#myGrid');

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, gridOptions);
});