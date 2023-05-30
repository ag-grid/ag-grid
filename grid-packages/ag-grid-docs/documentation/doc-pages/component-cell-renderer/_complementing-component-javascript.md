<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|// define cellRenderer to be reused
|const myCellRenderer = params => `&lt;span style="color: ${params.color}">${params.value}&lt;/span>`;
|
|// use with a colour
|colDef.cellRenderer = myCellRenderer;
|colDef.cellRendererParams = {
|    color: 'guinnessBlack'
|}
|
|// use with another colour
|colDef.cellRenderer = myCellRenderer;
|colDef.cellRendererParams = {
|    color: 'irishGreen'
|}
</snippet>
</framework-specific-section>