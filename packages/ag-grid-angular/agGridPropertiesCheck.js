// satisfy ag-grid HTMLElement dependency
HTMLElement = typeof HTMLElement === 'undefined' ? function () {} : HTMLElement;
HTMLSelectElement = typeof HTMLSelectElement === 'undefined' ? function () {} : HTMLSelectElement;
HTMLInputElement = typeof HTMLInputElement === 'undefined' ? function () {} : HTMLInputElement;
HTMLButtonElement = typeof HTMLButtonElement === 'undefined' ? function () {} : HTMLButtonElement;
MouseEvent = typeof MouseEvent === 'undefined' ? function () {} : MouseEvent;

/* Checks for missing gridOptions on agGridNg2 */
const {AgGridNg2} = require('./dist/agGridNg2');
const {ComponentUtil} = require("ag-grid-community");

const missingProperties = [];
ComponentUtil.ALL_PROPERTIES.forEach((property) => {
    if (!AgGridNg2.propDecorators.hasOwnProperty(property)) {
        missingProperties.push(`Grid property ${property} does not exist on AgGridNg2`)
    }
});

const missingEvents = [];
ComponentUtil.EVENTS.forEach((event) => {
    if (!AgGridNg2.propDecorators.hasOwnProperty(event)) {
        missingEvents.push(`Grid event ${event} does not exist on AgGridNg2`)
    }
});

if(missingProperties.length || missingEvents.length) {
    console.error("*************************** BUILD FAILED ***************************");
    missingProperties.concat(missingEvents).forEach((message) => console.error(message));
    console.error("*************************** BUILD FAILED ***************************");

    throw("Build Properties Check Failed");
} else {
    console.info("*************************** GridOptions - BUILD OK ***************************");
}

/* Checks for missing colDef properties on agGridColumn.ts */
const {AgGridColumn} = require('./dist/agGridColumn');
const {ColDefUtil} = require("ag-grid-community");

// colDef properties that dont make sense in an angular context (or are private)
const skippableProperties = ['template', 'templateUrl', 'pivotKeys', 'pivotValueColumn', 'pivotTotalColumnIds', 'templateUrl'];

const missingColDefProperties = [];
ColDefUtil.ALL_PROPERTIES.forEach((property) => {
    if (skippableProperties.indexOf(property) === -1 && !AgGridColumn.propDecorators.hasOwnProperty(property)) {
        missingColDefProperties.push(`ColDef property ${property} does not exist on AgGridColumn`)
    }
});

if(missingColDefProperties.length) {
    console.error("*************************** BUILD FAILED ***************************");
    missingColDefProperties.forEach((message) => console.error(message));
    console.error("*************************** BUILD FAILED ***************************");

    throw("Build Properties Check Failed");
} else {
    console.info("*************************** ColDef - BUILD OK ***************************");
}



