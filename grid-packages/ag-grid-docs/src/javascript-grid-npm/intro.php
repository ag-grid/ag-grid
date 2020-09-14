<section id="angular-demo" class="mb-3">
    <div class="card">
        <div class="card-header">Example: NPM and ECMA 6 Imports</div>
        <div class="card-body">
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">index.js</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">index.html</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="template-tab" data-toggle="tab" href="#packages" role="tab" aria-controls="packages" aria-selected="false">package.json</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">

<?= createSnippet(<<<SNIPPET
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import { Grid } from 'ag-grid-community';

var columnDefs = [
  { headerName: 'Make', field: 'make' },
  { headerName: 'Model', field: 'model' },
  { headerName: 'Price', field: 'price' }
];

// specify the data
var rowData = [
  { make: 'Toyota', model: 'Celica', price: 35000 },
  { make: 'Ford', model: 'Mondeo', price: 32000 },
  { make: 'Porsche', model: 'Boxter', price: 72000 }
];

// let the grid know which columns and what data to use
var gridOptions = {
  columnDefs: columnDefs,
  rowData: rowData
};

var eGridDiv = document.querySelector('#myGrid');

new Grid(eGridDiv, gridOptions);
SNIPPET
) ?>
                </div>
                <div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">
<?= createSnippet(<<<SNIPPET
<html>
<head>
<title>Ag Grid Javascript Starter Example</title>
</head>
<body>
<div id="myGrid" style="height: 600px; width:500px;" class="ag-theme-alpine"></div>
</body>
</html>
SNIPPET
, 'html') ?>
                </div>
                <div class="tab-pane" id="packages" role="tabpanel" aria-labelledby="packages-tab">
<?= createSnippet(<<<SNIPPET
{
  "name": "ag-grid-javascript-npm-example",
  "version": "0.0.0",
  "private": true,
  "dependencies": {
    "ag-grid-community": "latest"
  }
}
SNIPPET
) ?>
                </div>
            </div>
            <div class="text-right" style="margin-top: -1.5rem;">
                <a class="btn btn-dark" href="https://stackblitz.com/edit/ag-grid-javascript-hello-world" target="_blank">
                    Open in <img src="../images/stackBlitzIcon.svg" alt="Open in StackBlitz"/> StackBlitz
                </a>
            </div>
        </div>
    </div>
</section>
