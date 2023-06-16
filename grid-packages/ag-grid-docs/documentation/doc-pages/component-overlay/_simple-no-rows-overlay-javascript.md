<framework-specific-section frameworks="javascript">
|Below is an example of no rows overlay class with custom `noRowsMessageFunc()` param:
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|class CustomNoRowsOverlay {
|    init(params) {
|        this.eGui = document.createElement('div');
|        this.eGui.innerHTML = `
|            &lt;div class="ag-overlay-loading-center" style="background-color: lightcoral;">   
|                &lt;i class="far fa-frown"> ${params.noRowsMessageFunc()} &lt;/i>
|            &lt;/div>
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
</snippet>
</framework-specific-section>