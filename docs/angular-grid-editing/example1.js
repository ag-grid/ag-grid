var columnDefs = [
    {headerName: "Default String", field: "defaultString", width: 150, editable: true},
    {headerName: "Upper Case Only", field: "upperCaseOnly", width: 150, editable: true, newValueHandler: upperCaseNewValueHandler},
    {headerName: "Number", valueGetter: 'data.number', width: 150, editable: true, newValueHandler: numberNewValueHandler},
    {headerName: "Custom", field: "setNoAngular", width: 175, cellRenderer: customEditor}
];

var data = [
    {defaultString: 'Apple', upperCaseOnly: 'APPLE', number: 11, setAngular: 'AAA', setNoAngular: 'AAA'},
    {defaultString: 'Orange', upperCaseOnly: 'ORANGE', number: 22, setAngular: 'BBB', setNoAngular: 'BBB'},
    {defaultString: 'Banana', upperCaseOnly: 'BANANA', number: 33, setAngular: 'CCC', setNoAngular: 'CCC'},
    {defaultString: 'Pear', upperCaseOnly: 'PEAR', number: 44, setAngular: 'DDD', setNoAngular: 'DDD'}
];

var setSelectionOptions = ['AAA','BBB','CCC','DDD','EEE','FFF','GGG'];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: [].concat(data).concat(data).concat(data).concat(data).concat(data)
};

function upperCaseNewValueHandler(params) {
    params.data[params.colDef.field] = params.newValue.toUpperCase();
}

function numberNewValueHandler(params) {
    var valueAsNumber = parseInt(params.newValue);
    if (isNaN(valueAsNumber)) {
        window.alert("Invalid value " + params.newValue + ", must be a number");
    } else {
        params.data.number = valueAsNumber;
    }
}

function customEditor(params) {

    var editing = false;

    var eCell = document.createElement('span');
    var eLabel = document.createTextNode(params.value);
    eCell.appendChild(eLabel);

    var eSelect = document.createElement("select");

    setSelectionOptions.forEach(function(item) {
        var eOption = document.createElement("option");
        eOption.setAttribute("value", item);
        eOption.innerHTML = item;
        eSelect.appendChild(eOption);
    });
    eSelect.value = params.value;

    eCell.addEventListener('click', function () {
        if (!editing) {
            eCell.removeChild(eLabel);
            eCell.appendChild(eSelect);
            eSelect.focus();
            editing = true;
        }
    });

    eSelect.addEventListener('blur', function () {
        if (editing) {
            editing = false;
            eCell.removeChild(eSelect);
            eCell.appendChild(eLabel);
        }
    });

    eSelect.addEventListener('change', function () {
        if (editing) {
            editing = false;
            var newValue = eSelect.value;
            params.data[params.colDef.field] = newValue;
            eLabel.nodeValue = newValue;
            eCell.removeChild(eSelect);
            eCell.appendChild(eLabel);
        }
    });

    return eCell;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});