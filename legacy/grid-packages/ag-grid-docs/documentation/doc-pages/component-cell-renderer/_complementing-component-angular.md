<framework-specific-section frameworks="angular">
<snippet transform={false}>
|// define Cell Component to be reused
|@Component({
|    selector: 'colour-cell',
|    template: `&lt;span [style.colour]="params.color">{{params.value}}&lt;/span>`
|})
|class ColourCellComp implements ICellRendererAngularComp {
|    params!: ICellRendererParams;
|
|    agInit(params: ICellRendererParams) {
|        this.params = params;
|    }
|
|    refresh(params: ICellRendererParams) {
|        this.params = params;
|        // As we have updated the params we return true to let AG Grid know we have handled the refresh.
|        // So AG Grid will not recreate the cell renderer from scratch.
|        return true;
|    }
|}
|
|@Component({
|    selector: 'my-app',
|    template: `
|        &lt;ag-grid-angular
|                class="ag-theme-quartz"
|                [columnDefs]="columnDefs"
|                ...other properties>        
|        &lt;/ag-grid-angular>`
|})
|export class AppComponent {
|    private columnDefs = [
|        {
|            headerName: "Colour 1",
|            field: "value",
|            cellRenderer: ColourCellComp,
|            cellRendererParams: {
|               color: 'guinnessBlack'
|            }
|        },
|        {
|            headerName: "Colour 2",
|            field: "value",
|            cellRenderer: ColourCellComp,
|            cellRendererParams: {
|               color: 'irishGreen'
|            }
|        }
|    ];
|
|   //...
|}
|
</snippet>
</framework-specific-section>