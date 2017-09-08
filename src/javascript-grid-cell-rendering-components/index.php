<?php
$key = "Cell Rendering Components";
$pageTitle = "ag-Grid Cell Rendering";
$pageDescription = "You can customise every cell in ag-Grid. This is done by providing cell renderers. This page describe creating cell renderers.";
$pageKeyboards = "ag-Grid Cell Renderers";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1 class="first-h1" id="cell-rendering">Cell Renderer</h1>

<p>
    The Cell Renderer - the most important component of ag-Grid. With this, you can put whatever
    you want in the grid cells. The job of the grid is to lay out the cells. What goes into the cells,
    that's where you come in! You customise the rendering inside the cells by providing Cell Renderer's
    (cellRenderer's).
</p>

<p>
    You configure cellRenderers as part of the column definition and can be one of the following:
<ul>
    <li>function: The cellRenderer is a function that gets called once for each cell. The function
        should return a string (which will be treated as html) or a DOM object. Use this if you
        have no cleanup or refresh requirements of the cell - it's a 'fire and forget' approach
        to the cell rendering.</li>
    <li>component: The grid will call 'new' on the provided class and treat the object as a component, using
        lifecycle methods. Use this if you need to do cleanup when the cell is removed or have
        refresh requirements.</li>
    <li>string: The cellRenderer is looked up from the provided cellRenderers. Use this if you
        want to use a built in renderer (eg 'group').</li>
</ul>
</p>

<h1 id="cell-renderer-function">cellRenderer Function</h1>

<p>
    The easiest (but not as flexible) way to provide your own cellRenderer is to provide a function.
    The function takes a set of parameters (with information on what to render) and you return back
    either a) a string of HTML or b) a DOM object.
</p>

<p>
    Below are some simple examples of cellRenderer function:
</p>

<pre><code><span class="codeComment">// put the value in bold</span>
colDef.cellRenderer = function(params) {
    return '&lt;b>' + params.value.toUpperCase() + '&lt;/b>';
}

<span class="codeComment">// put a tooltip on the value</span>
colDef.cellRenderer = function(params) {
    return '&lt;span title="the tooltip">'+params.value+'&lt;/span>';
}

<span class="codeComment">// create a DOM object </span>
colDef.cellRenderer = function(params) {
    var eDiv = document.createElement('div');
    eDiv.innerHTML = '&lt;span class="my-css-class">&lt;button class="btn-simple">Push Me&lt;/button>&lt;/span>';
    var eButton = eDiv.querySelectorAll('.btn-simple')[0];

    var eButton.addEventListener('click', function() {
        console.log('button was clicked!!');
    });

    return eDiv;
}</code></pre>

<p>
    See further below for the set of parameters passed to the rendering function.
</p>

<h1 id="cell-renderer-component">cellRenderer Component</h1>

<p>
    The most flexible (but a little more tricky) way to provide a cellRenderer is to provide a component class.
    The component class that you provide can have callback methods on it for refresh and destroy.
</p>

<note>
    <p>
        A cellRenderer Component is an ag-Grid concept that is similar in how 'components' work in other frameworks.
        Other than sharing the same concept and name, ag-Grid Components have nothing to do with Angular components,
        React components, or any other components.
    </p>
    <p>
        An ag-Grid cellRenderer Component does not need to extend any class or do anything except implement the
        methods shown in the interface.
    </p>
</note>

<p>
    The interface for the cellRenderer component is as follows:
</p>

<pre>interface ICellRendererComp {
    <span class="codeComment">// Optional - Params for rendering. The same params that are passed to the cellRenderer function.</span>
    init?(params: ICellRendererParams): void;

    <span class="codeComment">// Mandatory - Return the DOM element of your editor, this is what the grid puts into the DOM</span>
    getGui(): HTMLElement;

    <span class="codeComment">// Optional - Gets called once by grid after editing is finished - if your editor needs to do any cleanup,</span>
    <span class="codeComment">// do it here</span>
    destroy?(): void;

    <span class="codeComment">// Mandatory - Get the cell to refresh. Return true if the refresh succeeded, otherwise return false.</span>
    <span class="codeComment">// If you return false, the grid will remove the component from the DOM and create</span>
    <span class="codeComment">// a new component in it's place with the new values.</span>
    refresh(params: any): boolean;
}</pre>

<p>The interface for the cell renderer parameters is as follows:</p>
<pre>interface ICellRendererParams {
    value: any, <span class="codeComment">// value to be rendered</span>
    valueFormatted: any, <span class="codeComment">// value to be rendered formatted</span>
    getValue: ()=> any, <span class="codeComment">// convenience function to get most recent up to date value</span>
    setValue: (value: any) => void, <span class="codeComment">// convenience to set the value </span>
    formatValue: (value: any) => any, <span class="codeComment">// convenience to format a value using the columns formatter</span>
    data: any, <span class="codeComment">// the rows data</span>
    node: RowNode, <span class="codeComment">// row rows row node</span>
    colDef: ColDef, <span class="codeComment">// the cells column definition</span>
    column: Column, <span class="codeComment">// the cells column</span>
    rowIndex: number, <span class="codeComment">// the current index of the row (this changes after filter and sort)</span>
    api: GridApi, <span class="codeComment">// the grid API</span>
    eGridCell: HTMLElement, <span class="codeComment">// the grid's cell, a DOM div element</span>
    eParentOfValue: HTMLElement, <span class="codeComment">// the parent DOM item for the cell renderer, same as eGridCell unless using checkbox selection</span>
    columnApi: ColumnApi, <span class="codeComment">// grid column API</span>
    context: any, <span class="codeComment">// the grid's context</span>
    refreshCell: ()=>void <span class="codeComment">// convenience function to refresh the cell</span>
}</pre>

    <p>
        Below is a simple example of cellRenderer class:
    </p>

<pre><span class="codeComment">// function to act as a class</span>
function MyCellRenderer () {}

<span class="codeComment">// gets called once before the renderer is used</span>
MyCellRenderer.prototype.init = function(params) {
    <span class="codeComment">// create the cell</span>
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = '&lt;span class="my-css-class">&lt;button class="btn-simple">Push Me&lt;/button>&lt;span class="my-value">&lt;/span>&lt;/span>';

    <span class="codeComment">// get references to the elements we want</span>
    this.eButton = this.eGui.querySelectorAll('.btn-simple')[0];
    this.eValue = this.eGui.querySelectorAll('.my-value')[0];

    <span class="codeComment">// set value into cell</span>
    this.eValue.innerHTML = params.valueFormatted ? params.valueFormatted : params.value;

    <span class="codeComment">// add event listener to button</span>
    this.eventListener = function() {
        console.log('button was clicked!!');
    };
    this.eButton.addEventListener('click', this.eventListener);
};

<span class="codeComment">// gets called once when grid ready to insert the element</span>
MyCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

<span class="codeComment">// gets called whenever the user gets the cell to refresh</span>
MyCellRenderer.prototype.refresh = function(params) {
    <span class="codeComment">// set value into cell again</span>
    this.eValue.innerHTML = params.valueFormatted ? params.valueFormatted : params.value;
    <span class="codeComment">// return true to tell the grid we refreshed successfully</span>
    return true;
};

<span class="codeComment">// gets called when the cell is removed from the grid</span>
MyCellRenderer.prototype.destroy = function() {
    <span class="codeComment">// do cleanup, remove event listener from button</span>
    this.eButton.removeEventListener('click', this.eventListener);
};</code></pre>

<h1 id="cell-renderer-component-refresh">Component Refresh</h1>

<p>
    Component refresh needs a bit more explanation. Here we go through some of the finer details.
</p>

<h3>Events Causing Refresh</h3>
<p>
    The grid is constantly refreshing the data in the browser, but not every refresh of the grid
    results in the refresh method of your cellRenderer getting called.
    The following will result in cellRenderer refresh method getting called:
<ul>
    <li>
        Calling <code>rowNode.setDataValue(colKey, value)</code> to set a value directly onto the rowNode
    </li>
    <li>
        When editing a cell and editing is stopped, so that cell displays new value after editing.
    </li>
    <li>
        Calling <code>api.refreshCells()</code> to inform grid data has changed (see <a href="../javascript-grid-refresh/">Refresh</a>).
    </li>
</ul>
If any of the above occur and the grid confirms the data has changed via
<a href="../javascript-grid-change-detection/">Change Detection</a>, then the <i>refresh()</i>
method will be called.
</p>

<p>
    The following will <b>not</b> result in cellRenderer refresh method getting called:
<ul>
    <li>
        Calling <code>rowNode.setData(data)</code> to set new data into a rowNode.
    </li>
    <li>
        Scrolling the grid vertically (results in rows getting ripped in / out of the dom).
    </li>
</ul>
All of the above will result in the component getting destroyed and recreated.
</p>

<h3>Change Detection</h3>

    <p>
        As mentioned in the section on <a href="../javascript-grid-change-detection/">Change Detection</a>,
        the refresh of the cell will not take place if the value getting rendered has not changed.
    </p>

<h3 id="grid-vs-cell-refresh">Grid vs Component Refresh</h3>

    <p>
        The refresh method returns back a boolean value. If you do not want to handle the refresh in the
        cellRenderer, just return back <code>false</code> from an otherwise empty method. This will indicate
        to the grid that you did not refresh and the grid will instead rip the component out and destroy it
        and create another instance of your component from scratch instead.
    </p>

<h1 id="cell-renderer-component-lifecycle">
    cellRenderer Component Lifecycle
</h1>

<p>
    The lifecycle of the cellRenderer is as follows:
<ul>
    <li><code>new</code> is called on the class.</li>
    <li><code>init()</code> is called once.</li>
    <li><code>getGui()</code> is called once.</li>
    <li><code>refresh()</code> is called 0..n times (ie it may never be called, or called multiple times)</li>
    <li><code>destroy()</code> is called once.</li>
</ul>
In other words, <code>new()</code>, <code>init()</code>, <code>getGui()</code> and <code>destroy()</code> are always called exactly once.
<i>refresh()</i> is optionally called multiple times.
</p>

<p>
    If you are doing <code>refresh()</code>, remember that <code>getGui()</code> is only called once, so be sure
    to update the existing GUI in your refresh, do not think that the grid is going to call <code>getGui()</code>
    again to get a new version of the GUI.
</p>

<h3 id="complementing-cell-renderer-params">Complementing cellRenderer Params</h3>

<p>
    On top of the parameters provided by the grid, you can also provide your own parameters. This is useful if
    you want to 'configure' your cellRenderer. For example, you might have a cellRenderer for formatting
    currency but you need to provide what currency for your cellRenderer to use.
</p>

<p>
    Provide params to a cellRenderer using the colDef option cellRendererParams.
</p>

<pre><code><span class="codeComment">// define cellRenderer to be reused</span>
var myCellRenderer = function(params) {
    return '&lt;span style="color: '+params.color+'">' + params.value + '&lt;/span>';
}

<span class="codeComment">// use with a color</span>
colDef.cellRenderer = myCellRenderer;
colDef.cellRendererParams = {
    color: 'guinnessBlack'
}

<span class="codeComment">// use with another color</span>
colDef.cellRenderer = myCellRenderer;
colDef.cellRendererParams = {
    color: 'irishGreen'
}</code></pre>

<h1 id="example-using-cell-renderers">Example: Using cellRenderers</h1>

<p>
    The example below shows five columns formatted, demonstrating each of the
    methods above.
</p>
<ul>
    <li>'Month' column uses cellStyle to format each cell in the column with the same style.</li>
    <li>'Max Temp' and 'Min Temp' columns uses the Function method to format each cell in the column with the same style.</li>
    <li>'Days of Air Frost' column uses the Component method to format each cell in the column with the same style</li>
    <li>'Days Sunshine' and 'Rainfall (10mm)' use simple functions to display icons.</li>
</ul>

<show-example example="example2"></show-example>

<h1 id="cell-renderers-and-row-groups">Cell Renderers and Row Groups</h1>

<p>
    If you are mixing cellRenderers and row grouping, then you need to understand that the value and / or data
    may be missing in the group row. You can check if you are on a group row of not by checking <code>rowNode.group</code>.
    Groups will have <code>aggData</code> and <code>groupData</code> instead of data.
</p>
<p>
    This is simply fixed by checking for the existence of the data before you use it like the following:
    <pre>
colDef.cellRenderer = function(params) {

    <span class="codeComment">// check the data exists, to avoid error</span>
    if (!params.node.group) {
        <span class="codeComment">// data exists, so we can access it</span>
        return '&lt;b>'+params.data.theBoldValue+'&lt;/b>';
    } else {
        <span class="codeComment">// when we return null, the grid will display a blank cell</span>
        return null;
    }
};
</pre>
</p>

<?php if (isFrameworkAngular2()) { ?>
    <?php include './angular.php';?>
<?php } ?>

<?php if (isFrameworkReact()) { ?>
    <?php include './react.php';?>
<?php } ?>

<?php if (isFrameworkPolymer()) { ?>
    <?php include './polymer.php';?>
<?php } ?>

<?php if (isFrameworkVue()) { ?>
    <?php include './vuejs.php';?>
<?php } ?>

<?php if (isFrameworkAurelia()) { ?>
    <?php include './aurelia.php';?>
<?php } ?>


<?php include '../documentation-main/documentation_footer.php';?>

