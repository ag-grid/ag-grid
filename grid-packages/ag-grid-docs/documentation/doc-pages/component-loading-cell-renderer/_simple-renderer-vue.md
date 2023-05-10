[[only-vue]]
|Below is a simple example of loading cell renderer component:
|
|```js
|const MyRenderer = {
|    template: `
|      <div class="ag-custom-loading-cell" style="padding-left: 10px; line-height: 25px;">
|          <i class="fas fa-spinner fa-pulse"></i> <span>{{ params.loadingMessage }}</span>
|      </div>
|    `
|}
|```
 
