<framework-specific-section frameworks="javascript">
|Below is an example of cell renderer class:
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|class CustomLoadingCellRenderer {
|    init(params) {
|        this.eGui = document.createElement('div');
|        this.eGui.innerHTML = `
|            &lt;div class="ag-custom-loading-cell" style="padding-left: 10px; line-height: 25px;">  
|                &lt;i class="fas fa-spinner fa-pulse">&lt;/i> 
|                &lt;span>${params.loadingMessage} &lt;/span>
|            &lt;/div>
|        `;
|    }
|
|    getGui() {
|        return this.eGui;
|    }
|}
</snippet>
</framework-specific-section>