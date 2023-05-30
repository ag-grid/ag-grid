<framework-specific-section frameworks="javascript">
|## Cell Renderer Function
|
|Instead of using a component, it's possible to use a simple function for a cell renderer. The function takes the same parameters as the cell renderer `init` method in the component variant. The function should return back  either a) a string of HTML or b) a DOM object.
|
|Use the function variant of a cell renderer if you have no refresh or cleanup requirements (ie you don't need to implement the refresh or destroy functions).
|
|Below are some simple examples of cell renderers provided as simple functions:
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|// put the value in bold
|colDef.cellRenderer = params => `**${params.value.toUpperCase()}**`;
|
|// put a tooltip on the value
|colDef.cellRenderer = params => `&lt;span title="the tooltip">${params.value}&lt;/span>`;
|
|// create a DOM object
|colDef.cellRenderer = params => {
|    const eDiv = document.createElement('div');
|    eDiv.innerHTML = '&lt;span class="my-css-class">&lt;button class="btn-simple">Push Me&lt;/button>&lt;/span>';
|    const eButton = eDiv.querySelectorAll('.btn-simple')[0];
|
|    return eDiv;
|}
</snippet>
</framework-specific-section>