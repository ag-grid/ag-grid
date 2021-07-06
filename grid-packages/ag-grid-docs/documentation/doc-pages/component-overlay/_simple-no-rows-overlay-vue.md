[[only-vue]]
|Below is a simple example of a no-rows overlay component:
|
|```js
|const MyOverlay = {
|    template: `
|        <div class="ag-overlay-loading-center" style="background-color: lightcoral;">
|            <i class="far fa-frown"> {{params.noRowsMessageFunc()}}</i>
|        </div>
|    `
|}
|```
 
