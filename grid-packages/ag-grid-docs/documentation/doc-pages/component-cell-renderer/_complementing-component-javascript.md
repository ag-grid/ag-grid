[[only-javascript]]
|
|```js
|// define cellRenderer to be reused
|const myCellRenderer = params => `<span style="color: ${params.color}">${params.value}</span>`;
|
|// use with a colour
|colDef.cellRendererComp = myCellRenderer;
|colDef.cellRendererCompParams = {
|    color: 'guinnessBlack'
|}
|
|// use with another colour
|colDef.cellRendererComp = myCellRenderer;
|colDef.cellRendererCompParams = {
|    color: 'irishGreen'
|}
|```
