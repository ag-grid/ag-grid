<framework-specific-section frameworks="vue">
|Below is an example of no rows overlay class with custom `noRowsMessageFunc()` param:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|const MyOverlay = {
|    template: `
|        &lt;div class="ag-overlay-loading-center" style="background-color: lightcoral;">
|            &lt;i class="far fa-frown"> {{params.noRowsMessageFunc()}}&lt;/i>
|        &lt;/div>
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
</snippet>
</framework-specific-section>