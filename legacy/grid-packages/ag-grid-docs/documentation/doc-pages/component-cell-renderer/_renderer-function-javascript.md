<framework-specific-section frameworks="javascript">
|## Cell Component Function
|
|Instead of using a class component, it's possible to use a function for a Cell Component. The function takes the same parameters as the Cell Component `init` method in the class variant. The function should return back  either a) a string of HTML or b) a DOM object.
|
|Use the function variant of a Cell Component if you have no refresh or cleanup requirements (ie you don't need to implement the refresh or destroy functions).
|
|Below are some simple examples of Cell Components provided as simple functions:
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