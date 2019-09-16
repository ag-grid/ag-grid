
<div>

Component.ts
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

Template.html
<snippet>
&lt;ag-grid-angular
    [rowData]="rowData"
    [columnDefs]="columnDefs">
&lt;/ag-grid-angular>
</snippet>

<img src="../images/helloWorldGrid.png"/>

    <style>
        .stackblitz-button {
            border-radius: 5px;
            padding: 10px 10px;
            font-size: 20px;
            border: 1px solid #125082;
            background-color: #125082;
            color: #e6e6e6;
        }
    </style>

    <p>
        <a class="stackblitz-button" href="https://stackblitz.com/edit/ag-grid-angular-hello-world" target="_blank">
            Open in <img src="../images/stackBlitzIcon.svg"/> StackBlitz
        </a>
    </p>

</div>

<!--

This is how you embed, if we want it.

<iframe
        src="https://stackblitz.com/edit/ag-grid-angular-hello-world?embed=1&file=src/app/app.component.ts"
        style="width: 100%; height: 400px;">
</iframe>

<iframe
        src="https://stackblitz.com/edit/ag-grid-angular-hello-world?ctl=1&embed=1&file=src/app/app.component.ts"
        style="width: 100%; height: 400px;">
</iframe>
-->

<div style="margin: 100px 10px 100px 10px; padding: 20px; border: 1px solid grey; background-color: #8abde3;">
    Niall Notes:
    <ul>
        <li>
            Ideas for code:
            <ul>
                <li>Have code side by side, ie .ts to left, .html to right??</li>
                <li>Have code tabbed???</li>
            </ul>
        </li>
        <li>
            Have grid lazy load, so first show image, then if user tries to interact says 'loading...'
            and then shows.
        </li>
        <li>
            Code for the grid should be plain js. That way it's a) easier to download the .js files
            and b) can reuse the example for all the getting started pages.
        </li>
    </ul>
</div>


<!--

https://stackblitz.com/edit/ag-grid-angular-hello-world

-->
