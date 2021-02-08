[[only-javascript]]
|## Cell Renderer Function
|
|Instead of using a component, it's possible to use a simple function for a cell renderer. The function takes the same parameters as the cell renderer `init` method in the component variant. The function should return back  either a) a string of HTML or b) a DOM object.
|
|Use the function variant of a cell renderer if you have no refresh or cleanup requirements (ie you don't need to implement the refresh or destroy functions).
|
|If using a framework such as React or Angular for your cell renderers then you must provide a cell renderer component. There is no function equivalent for the frameworks such as React and Angular.
|
|Below are some simple examples of cell renderers provided as simple functions:
|
|
|```js
|// put the value in bold
|colDef.cellRenderer = function(params) {
|    return '**' + params.value.toUpperCase() + '**';
|}
|
|// put a tooltip on the value
|colDef.cellRenderer = function(params) {
|    return '<span title="the tooltip">' + params.value + '</span>';
|}
|
|// create a DOM object
|colDef.cellRenderer = function(params) {
|    var eDiv = document.createElement('div');
|    eDiv.innerHTML = '<span class="my-css-class"><button class="btn-simple">Push Me</button></span>';
|    var eButton = eDiv.querySelectorAll('.btn-simple')[0];
|
|    eButton.addEventListener('click', function() {
|        console.log('button was clicked!!');
|    });
|
|    return eDiv;
|}
|```
