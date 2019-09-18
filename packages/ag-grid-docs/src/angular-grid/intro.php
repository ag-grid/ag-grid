<style>
    #angular-demo .target-img {
        position: relative;
    }
    #angular-demo .target-img a:hover::before {
        content: '\f0a9';
        font-family: 'Font Awesome 5 Free';
        font-weight: 900;
        font-size: 5em;
        opacity: 1;
        position: absolute;
        z-index: 1;
        cursor: pointer;
        left: calc(50% - 0.8em);
        color: lightslategray;
    }
    #angular-demo .target-img a:hover img {
        opacity: 0.5;
    }
</style> 
<section id="angular-demo" class="mb-3">
    <div class="card">
        <div class="card-header">Basic Angular Example</div>
        <div class="card-body">
            <div class="target-img d-block mb-2 text-center bg-light">
                <a href="https://stackblitz.com/edit/ag-grid-angular-hello-world" target="_blank">
                    <img src="../images/helloWorldGrid.png" style="max-width: 505px;" alt="Angular Example" />
                </a>
            </div>
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">Component.ts</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">Template.html</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">
<snippet>
@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: [ './app.component.scss' ]
})
export class AppComponent  {
    columnDefs = [
        {field: 'make' },
        {field: 'model' },
        {field: 'price'}
    ];
    rowData = [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 }
    ];
}
</snippet>
                </div>
                <div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">
<snippet>
&lt;ag-grid-angular
    [rowData]="rowData"
    [columnDefs]="columnDefs">
&lt;/ag-grid-angular>
</snippet>  
                </div>
            </div>
            <div class="text-right" style="margin-top: -1.5rem;">
                <a class="btn btn-dark" href="https://stackblitz.com/edit/ag-grid-angular-hello-world" target="_blank">
                    Open in <img src="../images/stackBlitzIcon.svg"/> StackBlitz
                </a>
            </div>
        </div>
    </div>
</section>