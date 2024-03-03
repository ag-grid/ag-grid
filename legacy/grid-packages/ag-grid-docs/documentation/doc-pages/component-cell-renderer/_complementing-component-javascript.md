<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|// define Cell Component to be reused
|const myCellComp = params => `&lt;span style="color: ${params.color}">${params.value}&lt;/span>`;
|
|// use with a colour
|colDef.cellRenderer = myCellComp;
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