[[only-javascript]]
|Below is an example of no rows overlay class with custom `noRowsMessageFunc()` param:
|
|```js
|class CustomNoRowsOverlay {
|    init(params) {
|        this.eGui = document.createElement('div');
|        this.eGui.innerHTML = `
|            <div class="ag-overlay-loading-center" style="background-color: lightcoral;">   
|                <i class="far fa-frown"> ${params.noRowsMessageFunc()} </i>
|            </div>
|        `;
|    }
|
|    getGui() {
|        return this.eGui;
|    }
|}
|
|const gridOptions: GridOptions = {
|  ...
|  noRowsOverlayComponent: CustomNoRowsOverlay,
|  noRowsOverlayComponentParams: {
|    noRowsMessageFunc: () => 'Sorry - no rows! at: ' + new Date(),
|  },
|}
|```
