<?php
$key = "Cell Rendering";
$pageTitle = "ag-Grid Cell Rendering";
$pageDescription = "You can customise every cell in ag-Grid. This is done by providing cell renderers. This page describe creating cell renderers.";
$pageKeyboards = "ag-Grid Cell Renderers";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h2 id="cell-rendering">Cell Renderer</h2>

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

<h3 id="cell-renderer-function">cellRenderer Function</h3>

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

<h3 id="cell-renderer-component">cellRenderer Component</h3>

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
    init?(params: any): void;

    <span class="codeComment">// Mandatory - Return the DOM element of your editor, this is what the grid puts into the DOM</span>
    getGui(): HTMLElement;

    <span class="codeComment">// Optional - Gets called once by grid after editing is finished - if your editor needs to do any cleanup,</span>
    <span class="codeComment">// do it here</span>
    destroy?(): void;

    <span class="codeComment">// Optional - Get the cell to refresh. If this method is not provided, then when refresh is needed, the grid</span>
    <span class="codeComment">// will remove the component from the DOM and create a new component in it's place with the new values.</span>
    refresh?(params: any): void;
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
};

<span class="codeComment">// gets called when the cell is removed from the grid</span>
MyCellRenderer.prototype.destroy = function() {
    <span class="codeComment">// do cleanup, remove event listener from button</span>
    this.eButton.removeEventListener('click', this.eventListener);
};</code></pre>

<h3 id="cell-renderer-component-refresh">cellRenderer Component Refresh</h3>

<p>
    The grid is constantly refreshing rows and cells into the browser, but not every refresh of the grid
    results in the refresh method of your cellRenderer getting called. The following details when your
    cellRenderer refresh method gets called and when not.
</p>

<p>
    The following will result in cellRenderer refresh method getting called:
<ul>
    <li>
        Calling <i>rowNode.setDataValue(colKey, value)</i> to set a value directly onto the rowNode
    </li>
    <li>
        When editing a cell and editing is stopped, so that cell displays new value after editing.
    </li>
    <li>
        Calling <i>api.refreshCells(rowNodes, colIds)</i> to inform grid data has changed (see <a href="../javascript-grid-refresh/">Refresh</a>).
    </li>
    <li>
        Calling <i>api.softRefreshView()</i> to inform grid data has changed (see <a href="../javascript-grid-refresh/">Refresh</a>).
    </li>
</ul>
If any of the above occur, the <i>refresh()</i> method will be called if it is provided. If not,
the component will be destroyed and replaced.
</p>

<p>
    The following will <b>not</b> result in cellRenderer refresh method getting called:
<ul>
    <li>
        Calling <i>rowNode.setData(data)</i> to set new data into a rowNode.
    </li>
    <li>
        Scrolling the grid vertically (results in rows getting ripped in / out of the dom).
    </li>
    <li>
        All other api refresh methods (<i>refreshRows, refreshView</i> etc).
    </li>
</ul>
All of the above will result in the component getting destroyed and recreated.
</p>

<h3 id="cell-renderer-component-lifecycle">
    cellRenderer Component Lifecycle
</h3>

<p>
    The lifecycle of the cellRenderer is as follows:
<ul>
    <li><i>new</i> is called on the class.</li>
    <li><i>init()</i> is called once.</li>
    <li><i>getGui()</i> is called once.</li>
    <li><i>refresh()</i> is called 0..n times (ie it may never be called, or called multiple times)</li>
    <li><i>destroy()</i> is called once.</li>
</ul>
In other words, <i>new(), init(), getGui()</i> and <i>destroy()</i> are always called exactly once.
<i>refresh()</i> is optionally called multiple times.
</p>

<p>
    If you are implementing <i>refresh()</i>, remember that <i>getGui()</i> is only called once, so be sure
    to update the existing GUI in your refresh, do not think that the grid is going to call <i>getGui()</i>
    again to get a new version of the GUI.
</p>

<h3 id="cell-renderer-params">cellRenderer Params</h3>

<p>
    The cellRenderer function and cellRenderer component take parameters as follows:
<ul>
    <li><b>cellRenderer function: </b> Passed to function.</li>
    <li><b>cellRenderer component: </b> Passed to init method.</li>
</ul>
The parameters are identical regardless of which cellRenderer type you use and contain the following:
</p>

<table class="table">
    <tr>
        <th>Value</th>
        <th>Description</th>
    </tr>
    <tr>
        <th>value</th>
        <td>The value to be rendered.</td>
    </tr>
    <tr>
        <th>valueFormatted</th>
        <td>If a valueFormatter was provided, is the result of calling the formatter.</td>
    </tr>
    <tr>
        <th>valueGetter</th>
        <td>A function, that when called, gives you the value, calling the relevant valueGetter / expression
            if necessary. This can be called at any time after rendering should the value change and you
            find the refresh functionality provided by the grid is not enough.</td>
    </tr>
    <tr>
        <th>formatValue</th>
        <td>A function, that when called, formats the value. The valueFormatted attribute already gives
            you the formatted value, however you can call this if you need to format another value,
            maybe you need to format a different value (this is used by the provided 'animation' cellRenderers
            where they need to format the delta difference).</td>
    </tr>
    <tr>
        <th>node</th>
        <td>The RowNode of the row being rendered.</td>
    </tr>
    <tr>
        <th>data</th>
        <td>The row (from the rowData array, where value was taken) been rendered.</td>
    </tr>
    <tr>
        <th>column</th>
        <td>The column been rendered (in ag-Grid, each colDef is wrapped by a Column).</td>
    </tr>
    <tr>
        <th>colDef</th>
        <td>The colDef been rendered.</td>
    </tr>
    <tr>
        <th>$scope</th>
        <td>If compiling to Angular, is the row's child scope, otherwise null.</td>
    </tr>
    <tr>
        <th>rowIndex</th>
        <td>The index of the row, after sorting and filtering.</td>
    </tr>
    <tr>
        <th>api</th>
        <td>A reference to the grid api.</td>
    </tr>
    <tr>
        <th>columnApi</th>
        <td>A reference to the column api.</td>
    </tr>
    <tr>
        <th>context</th>
        <td>The context as set on the gridOptions.</td>
    </tr>
    <tr>
        <th>refreshCell</th>
        <td>A callback function, to tell the grid to refresh this cell and reapply all css styles and classes.
            Useful if you update the data for the cell and want to just render again from scratch.</td>
    </tr>
    <tr>
        <th>eGridCell</th>
        <td>A reference to the DOM element representing the grid cell that your component will live inside.
            Useful if you want to add event listeners or classes at this level. This is the DOM element that
            gets browser focus when selecting cells.</td>
    </tr>
    <tr>
        <th>eParentOfValue</th>
        <td>If using checkbox selection, your component will live inside eParentOfValue which sits beside a
            checkbox and both live inside eGridCell.</td>
    </tr>

</table>

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

<h3 id="provided-cell-renderers">Provided cellRenderers</h3>

<p>Instead of providing a cellRenderer function or component, you can select from ones that come with the
    grid or install your own into the grid.</p>

<p>
    The cellRenderers provided by the grid are as follows:
<ul>
    <li><b>group</b>: For group rendering.</li>
    <li><b>animateShowChange</b>: Cell renderer that when data changes, it animates showing the difference by showing the delta for a period of time.</li>
    <li><b>animateSlide</b>: Cell renderer that when data changes, it animates showing the old value fading away to the left.</li>
</ul>
</p>

<p>
    From the provided cellRenderers, it is intended the you use 'group' as is, however
    'animateShowChange' and 'animateSlide' are given as examples on what is possible. How you show
    changes or otherwise want to refresh is going to be different for everyone. So take influence from
    what you see, but consider creating your own.
</p>

<p>Usage of group cellRenderer is detailed in the section <a href="../javascript-grid-grouping/">Grouping Rows and Aggregation</a>.</p>

<p>Usage of animateShowChange and animateSlide is demonstrated in the section <a href="../javascript-grid-viewport/">Viewport</a>.</p>

<h3 id="example-using-cell-renderers">Example: Using cellRenderers</h3>

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

<h3 id="cell-renderers-and-row-groups">Cell Renderers and Row Groups</h3>

<p>
    If you are mixing cellRenderers and row grouping, then you need to understand that the value and / or data
    may be missing in the group row. The data and value will be missing if you are not doing any aggregations
    (hence no data at the group level) and the value will be missing if you are doing aggregations but not
    on the column the cellRenderer is on.
</p>
<p>
    This is simply fixed by checking for the existence of the data before you use it like the following:
    <pre>
colDef.cellRenderer = function(params) {

    <span class="codeComment">// check the data exists, to avoid error when grouping but not aggregating</span>
    if (params.data) {
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

<?php if (isFrameworkVue()) { ?>
    <?php include './vuejs.php';?>
<?php } ?>

<?php if (isFrameworkAurelia()) { ?>
    <?php include './aurelia.php';?>
<?php } ?>


<?php include '../documentation-main/documentation_footer.php';?>

