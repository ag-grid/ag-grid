[[only-javascript]]
|Below is a example of loading overlay class with a custom `loadingMessage` param:
|
|```js
|class CustomLoadingCellRenderer {
|    init(params) {
|        this.eGui = document.createElement('div');
|        this.eGui.innerHTML = `
|            <div class="ag-custom-loading-cell" style="padding-left: 10px; line-height: 25px;">  
|                <i class="fas fa-spinner fa-pulse"></i> 
|                <span>${params.loadingMessage} </span>
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
|  loadingOverlayComponent: CustomLoadingCellRenderer,
|  loadingOverlayComponentParams: {
|    loadingMessage: 'One moment please...',
|  },
|}
|```
