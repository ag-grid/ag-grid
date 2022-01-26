[[only-angular]]
|
|```js
|// define cell editor to be used
|@Component({
|    ...cell editor definition...
|})
|class MyCellEditor {
|    params: any;
|
|    agInit(params) {
|        this.params = params;
|    }
|    ...rest of the component...
|}
|
|@Component({
|    selector: 'my-app',
|    template: `
|        <ag-grid-angular
|                class="ag-theme-alpine"
|                [columnDefs]="columnDefs"
|                [comps]="comps"
|                ...other properties>        
|        </ag-grid-angular>`
|})
|export class AppComponent {
|    private columnDefs = [
|        {
|            headerName: "Value Column",
|            field: "value",
|            cellEditorComp: MyCellEditor,
|            cellEditorCompParams: {
|               // make "country" value available to cell editor
|               color: 'Ireland'
|            }
|        }
|    ];
|
|   ..other methods
|}
|
|```
