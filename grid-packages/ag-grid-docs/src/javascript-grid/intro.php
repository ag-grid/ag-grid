<section id="angular-demo" class="mb-3">
    <div class="card">
        <div class="card-header">Quick Look Code Example</div>
        <div class="card-body">
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">main.js</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">index.html</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">
<snippet>
var columnDefs = [
  {headerName: "Make", field: "make"},
  {headerName: "Model", field: "model"},
  {headerName: "Price", field: "price"}
];
    
// specify the data
var rowData = [
  {make: "Toyota", model: "Celica", price: 35000},
  {make: "Ford", model: "Mondeo", price: 32000},
  {make: "Porsche", model: "Boxter", price: 72000}
];
    
// let the grid know which columns and what data to use
var gridOptions = {
  columnDefs: columnDefs,
  rowData: rowData
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
</snippet>
                </div>
                <div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">
<snippet>
&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
    &lt;title>Ag-Grid Basic Example&lt;/title&gt;
    &lt;script src="https://unpkg.com/ag-grid-community/dist/ag-grid-community.min.js"&gt;&lt;/script&gt;
    &lt;script src="main.js"&gt;&lt;/script&gt;
&lt;/head>
&lt;body>
    &lt;div id="myGrid" style="height: 200px; width:500px;" class="ag-theme-alpine"&gt;&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;
</snippet>
                </div>
            </div>
            <div class="text-right" style="margin-top: -1.5rem;">
                <a class="btn btn-dark" href="https://plnkr.co/edit/nmWxAxWONarW5gj2?p=preview?p=preview" target="_blank">
                    Open in <img src="../images/plunker_logo.png" alt="Open in Plunker" style="height: 34px; width: 34px;"/> Plunker
                </a>
            </div>
        </div>
    </div>
</section>
