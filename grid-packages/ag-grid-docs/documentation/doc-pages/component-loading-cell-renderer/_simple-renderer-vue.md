<framework-specific-section frameworks="vue">
|Below is an example of loading cell renderer component:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|const MyRenderer = {
|    template: `
|      &lt;div class="ag-custom-loading-cell" style="padding-left: 10px; line-height: 25px;">
|          &lt;i class="fas fa-spinner fa-pulse">&lt;/i> &lt;span>{{ params.loadingMessage }}&lt;/span>
|      &lt;/div>
|    `
|}
</snippet>
</framework-specific-section>