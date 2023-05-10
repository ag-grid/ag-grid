<framework-specific-section frameworks="vue">
|Below is a example of loading overlay class with a custom `loadingMessage` param:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|const MyOverlay = {
|    template: `
|      &lt;div class="ag-overlay-loading-center" style="background-color: lightsteelblue;">
|          &lt;i class="fas fa-hourglass-half"> {{ params.loadingMessage }} &lt;/i>
|      &lt;/div>
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
</snippet>
</framework-specific-section>