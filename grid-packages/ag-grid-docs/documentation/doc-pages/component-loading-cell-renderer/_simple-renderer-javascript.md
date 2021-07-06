[[only-javascript]]
|Below is a simple example of cell renderer class:
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
|```
