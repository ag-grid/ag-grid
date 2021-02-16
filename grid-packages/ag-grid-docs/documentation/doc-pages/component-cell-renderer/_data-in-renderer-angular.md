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
|class CellRendererComponent {
|    params: ICellRendererParams;
|
|    agInit(ICellRendererParams) {
|        this.params = params;
|    }
|}
|```
