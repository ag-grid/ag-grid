
document.addEventListener('DOMContentLoaded', function () {
    ng.bootstrap(SampleAppComponent);
});

var SampleAppComponent = function() {
    // put columnDefs directly onto the controller
    this.columnDefs = [
        {headerName: "Make", field: "make"},
        {headerName: "Model", field: "model"},
        {headerName: "Price", field: "price"}
    ];
    // put data directly onto the controller
    this.rowData = [
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxter", price: 72000}
    ];
};

// the template is simple, just include ag-Grid
var templateForSampleAppComponent =
    '<ag-grid-ng2 ' +
        // use one of the ag-Grid themes
        'class="ag-fresh" ' +
        // give some size to the grid
        'style="height: 100%;" ' +
        // use AngularJS 2 properties for column-defs and row-data
        '[column-defs]="columnDefs" ' +
        '[row-data]="rowData" ' +
    '/>';

SampleAppComponent.annotations = [
    new ng.Component({
        selector: 'simple-ng2-grid'
    }),
    new ng.View({
        // register the ag-Grid directive with this directive
        directives: [ag.grid.AgGridNg2],
        template: templateForSampleAppComponent
    })
];
