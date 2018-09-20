<?php
$pageTitle = "ag-Grid Components: Cell Renderers";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. Use Cell Rendering to have cells rendering values other than simple strings. For example, put country flags beside country names, or push buttons for actions.";
$pageKeyboards = "ag-Grid Cell Renderers";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1>Cell Renderer</h1>

<p class="lead">
    The job of the grid is to lay out the cells. By default the grid will create the cell values
    using simple text. If you want more complex HTML inside the cells then this is achieved using
    cell renderers.
</p>

<p>
    This page explains first how to create cell renderers using standard JavaScript. It then continues
    on how to create cell renderers using components of different frameworks (eg how to create a cell
    renderer using a React or Angular component). If you intend to use the framework variant, you should
    first read the JavaScript sections as the framework sections build on this.
</p>

<h2>Simple Cell Renderer Example</h2>

<p>
    The example below shows a simple cell renderer in action. It uses a cell renderer to show a hash '#'
    symbol instead of the medal count.
</p>

<?= example('Simple Cell Renderer', 'simple-javascript', 'vanilla', array("showResult" => true, "exampleHeight" => 460)) ?>

<h2>Cell Renderer Component</h2>

<p>
    The interface for the cell renderer component is as follows:
</p>

<snippet>
interface ICellRendererComp {
    // Optional - Params for rendering. The same params that are passed to the cellRenderer function.
    init?(params: ICellRendererParams): void;

    // Mandatory - Return the DOM element of the component, this is what the grid puts into the cell
    getGui(): HTMLElement;

    // Optional - Gets called once by grid after rendering is finished - if your renderer needs to do any cleanup,
    // do it here
    destroy?(): void;

    // Mandatory - Get the cell to refresh. Return true if the refresh succeeded, otherwise return false.
    // If you return false, the grid will remove the component from the DOM and create
    // a new component in it's place with the new values.
    refresh(params: any): boolean;
}
</snippet>

<p>The interface for the cell renderer parameters is as follows:</p>

<snippet>
interface ICellRendererParams {
    value: any, // value to be rendered
    valueFormatted: any, // value to be rendered formatted
    getValue: ()=&gt; any, // convenience function to get most recent up to date value
    setValue: (value: any) =&gt; void, // convenience to set the value
    formatValue: (value: any) =&gt; any, // convenience to format a value using the columns formatter
    data: any, // the rows data
    node: RowNode, // row rows row node
    colDef: ColDef, // the cells column definition
    column: Column, // the cells column
    rowIndex: number, // the current index of the row (this changes after filter and sort)
    api: GridApi, // the grid API
    eGridCell: HTMLElement, // the grid's cell, a DOM div element
    eParentOfValue: HTMLElement, // the parent DOM item for the cell renderer, same as eGridCell unless using checkbox selection
    columnApi: ColumnApi, // grid column API
    context: any, // the grid's context
    refreshCell: ()=&gt;void // convenience function to refresh the cell
}
</snippet>

<p> Below is a simple example of cell renderer class: </p>

<snippet>
// function to act as a class
function MyCellRenderer () {}

// gets called once before the renderer is used
MyCellRenderer.prototype.init = function(params) {
    // create the cell
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = '&lt;span class="my-css-class"&gt;&lt;button class="btn-simple"&gt;Push Me&lt;/button&gt;&lt;span class="my-value"&gt;&lt;/span&gt;&lt;/span&gt;';

    // get references to the elements we want
    this.eButton = this.eGui.querySelector('.btn-simple');
    this.eValue = this.eGui.querySelector('.my-value');

    // set value into cell
    this.eValue.innerHTML = params.valueFormatted ? params.valueFormatted : params.value;

    // add event listener to button
    this.eventListener = function() {
        console.log('button was clicked!!');
    };
    this.eButton.addEventListener('click', this.eventListener);
};

// gets called once when grid ready to insert the element
MyCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

// gets called whenever the user gets the cell to refresh
MyCellRenderer.prototype.refresh = function(params) {
    // set value into cell again
    this.eValue.innerHTML = params.valueFormatted ? params.valueFormatted : params.value;
    // return true to tell the grid we refreshed successfully
    return true;
};

// gets called when the cell is removed from the grid
MyCellRenderer.prototype.destroy = function() {
    // do cleanup, remove event listener from button
    this.eButton.removeEventListener('click', this.eventListener);
};
</snippet>

<h2>Registering Cell Renderers with Columns</h2>

<p>
    See the section <a href="../javascript-grid-components/#registering-custom-components">
    registering custom components</a> for details on registering and using custom cell renderers.
</p>

<h2>Component Refresh</h2>

<p>Component refresh needs a bit more explanation. Here we go through some of the finer details. </p>

<h3>Events Causing Refresh</h3>

<p>
    The grid can refresh the data in the browser, but not every refresh / redraw of the grid
    results in the refresh method of your cell renderer getting called. The following items
    are those that <b>do</b> cause refresh to be called:
</p>

<ul class="content">
    <li>
        Calling <code>rowNode.setDataValue(colKey, value)</code> to set a value directly onto the <code>rowNode</code>.
        This is the preferred API way to change one value from outside of the grid.
    </li>
    <li>
        When editing a cell and editing is stopped, so that cell displays new value after editing.
    </li>
    <li>
        Calling <code>api.refreshCells()</code> to inform grid data has changed (see <a
                href="../javascript-grid-refresh/">Refresh</a>).
    </li>
</ul>

<p>If any of the above occur and the grid confirms the data has changed via
<a href="../javascript-grid-change-detection/">Change Detection</a>, then the <code>refresh()</code>
method will be called.
</p>

<p>
    The following will <b>not</b> result in the cell renderers refresh method getting called:
</p>

<ul class="content">
    <li>
        Calling <code>rowNode.setData(data)</code> to set new data into a <code>rowNode</code>.
        When you set the data for the whole row, then the whole row in the DOM is recreated again from scratch.
    </li>
    <li>
        Scrolling the grid vertically causes columns (and their containing cells) to be removed and inserted
        due to column virtualisation.
    </li>
</ul>

<p>
All of the above will result in the component getting destroyed and recreated.
</p>

<h3>Change Detection</h3>

<p>
    As mentioned in the section on <a href="../javascript-grid-change-detection/">Change Detection</a>,
    the refresh of the cell will not take place if the value getting rendered has not changed.
</p>

<h3>Grid vs Component Refresh</h3>

<p>
    The refresh method returns back a boolean value. If you do not want to handle the refresh in the
    cell renderer, just return back <code>false</code> from an otherwise empty method. This will indicate
    to the grid that you did not refresh and the grid will instead rip the component out and destroy it
    and create another instance of your component from scratch instead.
</p>

<h2>
    Cell Renderer Component Lifecycle
</h2>

<p>
    The lifecycle of the cell renderer is as follows:
</p>

<ul class="content">
    <li><code>new</code> is called on the class.</li>
    <li><code>init()</code> is called once.</li>
    <li><code>getGui()</code> is called once.</li>
    <li><code>refresh()</code> is called 0..n times (ie it may never be called, or called multiple times)</li>
    <li><code>destroy()</code> is called once.</li>
</ul>

<p>
In other words, <code>new()</code>, <code>init()</code>, <code>getGui()</code> and
<code>destroy()</code> are always called exactly once.
<code>refresh()</code> is optionally called multiple times.
</p>

<p>
    If you are doing <code>refresh()</code>, remember that <code>getGui()</code> is only called once, so be sure
    to update the existing GUI in your refresh, do not think that the grid is going to call <code>getGui()</code>
    again to get a new version of the GUI.
</p>

<h2>Cell Rendering Flow</h2>

<p>
    The diagram below (which is taken from the section <a href="../javascript-grid-value-getters/">Value Getters & Formatters</a>)
    summarises the steps the grid takes while working out what to render and how to render.
</p>

<p>
    In short, a value is prepared. The value comes using either the <code>colDef.field</code> or the
    <code>colDef.valueGetter</code>. The value is also optionally passed through a <code>colDef.valueFormatter</code>
    if it exists. Then the value is finally placed into the DOM, either directly, or by using the chosen
    <code>colDef.cellRenderer</code>.
</p>

<img class="img-fluid" src="../javascript-grid-value-getters/valueGetterFlow.svg"/ alt="Value Getter Flow">

<h2>Complementing Cell Renderer Params</h2>

<p>
    On top of the parameters provided by the grid, you can also provide your own parameters. This is useful if
    you want to 'configure' your cell renderer. For example, you might have a cell renderer for formatting
    currency but you need to provide what currency for your cell renderer to use.
</p>

<p>
    Provide params to a cell renderer using the colDef option <code>cellRendererParams</code>.
</p>

<snippet>
// define cellRenderer to be reused
var myCellRenderer = function(params) {
    return '&lt;span style="color: '+params.color+'"&gt;' + params.value + '&lt;/span&gt;';
}

// use with a color
colDef.cellRenderer = myCellRenderer;
colDef.cellRendererParams = {
    color: 'guinnessBlack'
}

// use with another color
colDef.cellRenderer = myCellRenderer;
colDef.cellRendererParams = {
    color: 'irishGreen'
}
</snippet>

<h2>Cell Renderers and Row Groups</h2>

<p>
    If you are mixing cell renderers and row grouping, then you need to understand that the value and / or data
    may be missing in the group row. You can check if you are on a group row of not by checking
    <code>rowNode.group</code>.
    Groups will have <code>aggData</code> and <code>groupData</code> instead of data.
</p>

<p>
    This is simply fixed by checking for the existence of the data before you use it like the following:
</p>

<snippet>
colDef.cellRenderer = function(params) {
    // check the data exists, to avoid error
    if (!params.node.group) {
        // data exists, so we can access it
        return '&lt;b&gt;'+params.data.theBoldValue+'&lt;/b&gt;';
    } else {
        // when we return null, the grid will display a blank cell
        return null;
    }
};
</snippet>

<h2>Cell Renderer Function</h2>

<p>
    Instead of using a component, it's possible to use a simple function for a cell renderer.
    The function takes the same parameters as the cell renderer <code>init</code> method in the
    component variant. The function should return back  either a) a string of HTML or b) a DOM object.
</p>

<p>
    Use the function variant of a cell renderer if you have no refresh or cleanup requirements (ie
    you don't need to implement the refresh or destroy functions).
</p>

<p>
    If using a framework such as React or Angular for your cell renderers then you must provide a
    cell renderer component. There is no function equivalent for the frameworks such as React and Angular.
</p>

<p>
    Below are some simple examples of cell renderers provided as simple functions:
</p>

<snippet>
// put the value in bold
colDef.cellRenderer = function(params) {
    return '&lt;b&gt;' + params.value.toUpperCase() + '&lt;/b&gt;';
}

// put a tooltip on the value
colDef.cellRenderer = function(params) {
    return '&lt;span title="the tooltip"&gt;'+params.value+'&lt;/span&gt;';
}

// create a DOM object
colDef.cellRenderer = function(params) {
    var eDiv = document.createElement('div');
    eDiv.innerHTML = '&lt;span class="my-css-class"&gt;&lt;button class="btn-simple"&gt;Push Me&lt;/button&gt;&lt;/span&gt;';
    var eButton = eDiv.querySelectorAll('.btn-simple')[0];

    eButton.addEventListener('click', function() {
        console.log('button was clicked!!');
    });

    return eDiv;
}
</snippet>

<note>
    You might be wondering how the grid knows if you have provided a cell renderer component class or
    a simple function, as JavaScript uses functions to implement classes. The answer is the grid looks
    for the getGui() method in the prototype of the function (the only mandatory method in the cell renderer
    interface). If the getGui() method exists, it assumes a component, otherwise it assumes a function.
</note>

<h2>Complex Cell Renderer Example</h2>

<p>
    The example below shows five columns formatted, demonstrating each of the
    methods above.
</p>

<ul class="content">
    <li>'Month' column uses <code>cellStyle</code> to format each cell in the column with the same style.</li>
    <li>'Max Temp' and 'Min Temp' columns uses the Function method to format each cell in the column with the same
        style.
    </li>
    <li>'Days of Air Frost' column uses the Component method to format each cell in the column with the same style</li>
    <li>'Days Sunshine' and 'Rainfall (10mm)' use simple functions to display icons.</li>
</ul>

<?= example('Cell Renderer', 'cell-renderer') ?>

<h2 id="accessing-cell-renderer-instances">Accessing Cell Renderer Instances</h2>

<p>
    After the grid has created an instance of a cell renderer for a cell it is possible to access that instance.
    This is useful if you want to call a method that you provide on the cell renderer that has nothing to do
    with the operation of the grid. Accessing cell renderers is done using the grid API
    <code>getCellRendererInstances(params)</code>.
</p>

<snippet>
// function takes params to identify what cells and returns back a list of cell renderers
function getCellRendererInstances(params: GetCellRendererInstancesParams): ICellRendererComp[];

// params object for the above
interface GetCellRendererInstancesParams {
    // an optional list of row nodes
    rowNodes?: RowNode[];
    // an optional list of columns
    columns?: (string|Column)[];
}
</snippet>

<p>
    An example of getting the cell renderer for exactly one cell is as follows:
</p>

<snippet>
// example - get cell renderer for first row and column 'gold'
var firstRowNode = gridOptions.api.getDisplayedRowAtIndex(0);
var params = { columns: ['gold'], rowNodes: [firstRowNode]};
var instances = gridOptions.api.getCellRendererInstances(params);
if (instances.length > 0) {
    // got it, user must be scrolled so that it exists
    var instance = instances[0];
}
</snippet>

<p>
    Not that this method will only return instances of the cell renderer that exists. Due to row
    and column virtualisation, renderers will only exists for the user can actually see due to horizontal
    and vertical scrolling.
</p>

<p>
    The example below demonstrates custom methods on cell renderers called by the application. The following
    can be noted:
    <ul>
        <li>
            The medal columns are all using the user defined <code>MedalCellRenderer</code>.
            The cell renderer has an arbitrary method <code>medalUserFunction()</code> which
            prints some data to the console.
        </li>
        <li>
            The <b>Gold</b> method executes a method on all instances of the cell renderer in the
            gold column.
        </li>
        <li>
            The <b>First Row Gold</b> method executes a method on the gold cell of the first row only.
            Note that the <code>getCellRendererInstances()</code> method will return nothing if the
            grid is scrolled past the first row.
        </li>
        <li>
            The <b>All Cells</b> method executes a method on all instances of all cell renderers.
        </li>
    </ul>
</p>

<?= example('Get Cell Renderer', 'get-cell-renderer') ?>

<p>
    If your are using a framework component (detailed below), then the returned object
    is a wrapper and you can get the underlying cell renderer using <code>getFrameworkComponentInstance()</code>
</p>

<snippet>
// example - get cell renderer for first row and column 'gold'
var firstRowNode = gridOptions.api.getDisplayedRowAtIndex(0);
var params = { columns: ['gold'], rowNodes: [firstRowNode]};
var instances = gridOptions.api.getCellRendererInstances(params);
if (instances.length > 0) {
    // got it, user must be scrolled so that it exists
    var wrapperInstance = instances[0];
    var frameworkInstance = wrapperInstance.getFrameworkComponentInstance();
}
</snippet>


<?php include './angular.php'; ?>

<?php include './react.php'; ?>

<?php include './polymer.php'; ?>

<?php include './vuejs.php'; ?>

<?php include './aurelia.php'; ?>

<?php include '../documentation-main/documentation_footer.php'; ?>

