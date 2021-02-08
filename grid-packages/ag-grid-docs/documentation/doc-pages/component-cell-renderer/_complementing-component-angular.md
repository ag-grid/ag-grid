[[only-angular]]
|## Complementing Cell Renderer Params
|
|On top of the parameters provided by the grid, you can also provide your own parameters. This is useful if you want to 'configure' your cell renderer. For example, you might have a cell renderer for formatting currency but you need to provide what currency for your cell renderer to use.
|
|Provide params to a cell renderer using the colDef option `cellRendererParams`.
|
|
|```js
|// define cellRenderer to be reused
|@Component({
|    selector: 'my-app',
|    template: `<span [style.colour]="params.color">{{params.value}}</span>`
|})
|class ColourCellRenderer {
|    params: any;
|
|    agInit(params) {
|        this.params = params;
|    }
|}
|
|@Component({
|    selector: 'my-app',
|    template: `
|        <ag-grid-angular
|                class="ag-theme-alpine"
|                [columnDefs]="columnDefs"
|                [frameworkComponents]="frameworkComponents"
|                ...other properties>        
|        </ag-grid-angular>`
|})
|export class AppComponent {
|    private columnDefs = [
|        {
|            headerName: "Colour 1",
|            field: "value",
|            cellRendererParams: {
|               color: 'guinnessBlack'
|            }
|        },
|        {
|            headerName: "Colour 2",
|            field: "value",
|            cellRendererParams: {
|               color: 'irishGreen'
|            }
|        }
|    ];
|
|   private frameworkComponents = {
|       'colourCellRenderer': ColourCellRenderer
|   };
|
|   ..other methods
|}
|
|```
