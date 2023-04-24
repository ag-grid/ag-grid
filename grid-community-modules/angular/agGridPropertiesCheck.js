// satisfy ag-grid HTMLElement dependency
HTMLElement = typeof HTMLElement === 'undefined' ? function () { } : HTMLElement;
HTMLSelectElement = typeof HTMLSelectElement === 'undefined' ? function () { } : HTMLSelectElement;
HTMLInputElement = typeof HTMLInputElement === 'undefined' ? function () { } : HTMLInputElement;
HTMLButtonElement = typeof HTMLButtonElement === 'undefined' ? function () { } : HTMLButtonElement;
MouseEvent = typeof MouseEvent === 'undefined' ? function () { } : MouseEvent;

/* Checks for missing gridOptions on agGridAngular */
const { AgGridAngular } = require('./dist/ag-grid-angular/bundles/ag-grid-community-angular.umd.js');
const { ComponentUtil } = require("@ag-grid-community/core");

const agGridAngularObject = new AgGridAngular(
    { nativeElement: null },
    null,
    null,
    {
        setViewContainerRef: () => {
        },
        setComponentFactoryResolver: () => {
        }
    });

const missingProperties = [];
const gridSkippableProperties = ['reactUi', 'suppressReactUi'];
ComponentUtil.ALL_PROPERTIES.forEach((property) => {
    if (!gridSkippableProperties.includes(property) && !agGridAngularObject.hasOwnProperty(property)) {
        missingProperties.push(`Grid property ${property} does not exist on AgGridAngular`)
    }
});

const missingEvents = [];
ComponentUtil.PUBLIC_EVENTS.forEach((event) => {
    if (!agGridAngularObject.hasOwnProperty(event)) {
        missingEvents.push(`Grid event ${event} does not exist on AgGridAngular`)
    }
});

if (missingProperties.length || missingEvents.length) {
    console.error("*************************** BUILD FAILED ***************************");
    missingProperties.concat(missingEvents).forEach((message) => console.error(message));
    console.error("*************************** BUILD FAILED ***************************");

    throw ("Build Properties Check Failed");
} else {
    console.info("*************************** GridOptions - BUILD OK ***************************");
}
