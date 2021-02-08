[[only-javascript]]
|## Complementing Cell Renderer Params
|
|On top of the parameters provided by the grid, you can also provide your own parameters. This is useful if you want to 'configure' your cell renderer. For example, you might have a cell renderer for formatting currency but you need to provide what currency for your cell renderer to use.
|
|Provide params to a cell renderer using the colDef option `cellRendererParams`.
|
|
|```js
|// define cellRenderer to be reused
|var myCellRenderer = function(params) {
|    return '<span style="color: ' + params.color + '">' + params.value + '</span>';
|}
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
|```
