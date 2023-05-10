[[only-vue]]
|Below is a example of loading overlay class with a custom `loadingMessage` param:
|
|```js
|const MyOverlay = {
|    template: `
|      <div class="ag-overlay-loading-center" style="background-color: lightsteelblue;">
|          <i class="fas fa-hourglass-half"> {{ params.loadingMessage }} </i>
|      </div>
|    `
|}
|
|const gridOptions: GridOptions = {
|  ...
|  loadingOverlayComponent: 'MyOverlay',
|  loadingOverlayComponentParams: {
|    loadingMessage: 'One moment please...',
|  },
|}
|```
 
