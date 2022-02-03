[[only-angular]]
|
|Here we use the safe navigation operator (`?`) to ensure that both `params` and `data` are valid before attempting to access `theBoldValue`:
|
|```js
|// cell renderer component  
|@Component({
|    selector: 'my-app',
|    template: `<span>{{params?.data?.theBoldValue}}</span>`
|})
|class CellRendererComponent implements ICellRendererAngularComp {
|    params: ICellRendererParams;
|
|    agInit(ICellRendererParams) {
|        this.params = params;
|    }
|
|    refresh(ICellRendererParams) {
|        // Let AG Grid take care of refreshing by recreating our cell renderer.
|        return false;
|    }
|}
|```
