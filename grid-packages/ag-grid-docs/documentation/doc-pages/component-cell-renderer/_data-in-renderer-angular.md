<framework-specific-section frameworks="angular">
|Here we use the safe navigation operator (`?`) to ensure that both `params` and `data` are valid before attempting to access `theBoldValue`:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
|// cell renderer component  
|@Component({
|    selector: 'cell-renderer',
|    template: `&lt;span>{{params?.data?.theBoldValue}}&lt;/span>`
|})
|class CellRendererComponent implements ICellRendererAngularComp {
|    params!: ICellRendererParams;
|
|    agInit(params: ICellRendererParams) {
|        this.params = params;
|    }
|
|    refresh(ICellRendererParams) {
|        // Let AG Grid take care of refreshing by recreating our cell renderer.
|        return false;
|    }
|}
</snippet>
</framework-specific-section>