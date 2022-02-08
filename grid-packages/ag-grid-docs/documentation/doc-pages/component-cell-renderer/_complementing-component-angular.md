[[only-angular]]
|
|```js
|// define cellRenderer to be reused
|@Component({
|    selector: 'my-app',
|    template: `<span [style.colour]="params.color">{{params.value}}</span>`
|})
|class ColourCellRenderer implements ICellRendererAngularComp {
|    params: ICellRendererParams;
|
|    agInit(ICellRendererParams) {
|        this.params = params;
|    }
|
|    refresh(ICellRendererParams) {
|        this.params = params;
|        // As we have updated the params we return true to let AG Grid we have handle refresh.
|        // So AG Grid will not recreate the cell renderer from scratch.
|        return true;
|    }
|}
|
|@Component({
|    selector: 'my-app',
|    template: `
|        <ag-grid-angular
|                class="ag-theme-alpine"
|                [columnDefs]="columnDefs"
|                ...other properties>        
|        </ag-grid-angular>`
|})
|export class AppComponent {
|    private columnDefs = [
|        {
|            headerName: "Colour 1",
|            field: "value",
|            cellRenderer: ColourCellRenderer,
|            cellRendererParams: {
|               color: 'guinnessBlack'
|            }
|        },
|        {
|            headerName: "Colour 2",
|            field: "value",
|            cellRenderer: ColourCellRenderer,
|            cellRendererParams: {
|               color: 'irishGreen'
|            }
|        }
|    ];
|
|   ..other methods
|}
|
|```
