[[only-vue]]
|Below is an example of no rows overlay class with custom `noRowsMessageFunc()` param:
|
|```js
|const MyOverlay = {
|    template: `
|        <div class="ag-overlay-loading-center" style="background-color: lightcoral;">
|            <i class="far fa-frown"> {{params.noRowsMessageFunc()}}</i>
|        </div>
|    `
|}
|
|const gridOptions: GridOptions = {
|  ...
|  noRowsOverlayComponent: 'MyOverlay',
|  noRowsOverlayComponentParams: {
|    noRowsMessageFunc: () => 'Sorry - no rows! at: ' + new Date(),
|  },
|}
|```
 
