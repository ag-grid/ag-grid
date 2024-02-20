<framework-specific-section frameworks="angular">
|## Cell Component Function
|
|Instead of using an Angular component, it's possible to use a function for a Cell Component.
|
|This is useful if you have a simple String value to render and want to avoid the overhead of an Angular component.
|
|In the example below we're outputting a string value that depends on the cell value:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
|@Component({
|    selector: 'my-app',
|    template: `
|        &lt;ag-grid-angular
|                [columnDefs]="columnDefs"
|                ...other properties>
|        &lt;/ag-grid-angular>`
|})
|export class AppComponent {
|    private columnDefs = [
|        {
|            headerName: "Value",
|            field: "value",
|            cellRenderer: params => params.value > 1000 ? "LARGE VALUE" : "SMALL VALUE"
|        }
|     ];
|     //...
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| It is also possible to write a JavaScript-based Cell Renderer Component - refer to the [docs here](../../javascript-data-grid/component-cell-renderer/#cell-renderer-function) for more information
</framework-specific-section>
