<?php
$pageTitle = "Cell Rendering: Styling & Appearance Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Cell Rendering. Use Cell Rendering to have cells rendering values other than simple strings. For example, put country flags beside country names, or push buttons for actions.";
$pageKeyboards = "ag-Grid Rendering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Cell Rendering</h1>

<p>
    By default the grid renders values into the cells as strings.
    If you want something more complex you use a cell renderer.
</p>

<p>
    The cell editor for a column is set via <code>colDef.cellRenderer</code> and can
    be any of the following types:
    <ol class="content">
        <li><code>undefined / null</code>: Grid renders the value as a string.</li>
        <li><code>String</code>: The name of a cell renderer component.</li>
        <li><code>Class</code>: Direct reference to a cell renderer component.</li>
        <li><code>Function</code>: A function that returns either an HTML string or DOM element for display.</li>
    </ol>
    The code snippet below demonstrates each of these method types.
</p>

<snippet>
// 1 - undefined / null - Grid renders the value as a string.
var colDef1 = {
    cellRenderer: null,
    ...
}

// 2 - String - The name of a cell renderer registered with the grid.
var colDef2 = {
    cellRenderer: 'agGroupCellRenderer',
    ...
}

// 3 - Class - Provide your own cell renderer component directly without registering.
var colDef3 = {
    cellRenderer: MyCustomCellRendererClass,
    ...
}

// 4 - Function - A function that returns an HTML string or DOM element for display
var colDef3 = function(params) {
    // put the value in bold
    return 'Value is &lt;b>'+params.value+'&lt;/b>';
}

</snippet>

<p>
    This remainder of this documentation page goes through the grid provided cell renderer's.
    To build your own cell renderer see the section
    <a href="../javascript-grid-cell-rendering-components/">Cell Rendering Components</a>.
</p>

<h2>No Cell Renderer</h2>

<p>
    If you have no requirements for custom cells, then you should use no cell renderer.
    Having no custom cell renderers will result in the fastest possible grid (which might
    be important to you if using Internet Explorer) as even the simplest cell renderer
    will result in some extra div's in the DOM.
</p>

<p>
    If you just want to do simple formatting of the data (eg currency or date formatting)
    then you can use <code>colDef.valueFormatter</code>.
</p>

<h2>Cell Renderer Components</h2>

<p>
    Cell renderer components can be referenced by string or directly by class. They can be
    <a href="../javascript-grid-provided-renderers/">Provided Cell Renderers</a> (they come
    with the grid) or <a href="../javascript-grid-cell-rendering-components/">Custom Cell
    Renderers</a> (built by you).
</p>

<h2>Many Renderers One Column</h2>

<p>It is also possible to use different renderers for different rows in the same column.
    Typically an application might check the rows contents and choose a renderer accordingly.
    To configure this set <code>colDef.cellRendererSelector</code>
    to a function that returns the name of the component to be used as a renderer and optionally
    the custom params to be passed into it<p>

<p>The parameters that this functions will receive the same parameters than a renderer would receive:<p>

<p>The following example illustrates how to use different renderers and parameters in the same column. Note that:</p>

<ul class="content">
    <li>The column 'Value' holds data of different types as shown in the column 'Type' (numbers/genders/moods).
    </li>
    <li><code>colDef.cellRendererSelector</code> is a function that selects the renderer based on the row data
    </li>
    <snippet>cellRendererSelector:function (params) {
            var moodDetails = {
                component: 'moodCellRenderer'
            };

            var genderDetails = {
                component: 'genderCellRenderer',
                params: {values: ['Male', 'Female']}
            };

            if (params.data.type === 'gender')
                return genderDetails;
            else if (params.data.type === 'mood')
                return moodDetails;
            else
                return null;

        }
</snippet>
    <li>
        The column 'Rendered Value' show the data rendered applying the component and params specified by <code>
            colDef.cellRendererSelector</code>
    </li>
</ul>

<?= example('Dynamic Rendering Component', 'dynamic-rendering-component', 'vanilla', array("enterprise" => 1, "exampleHeight" => 250)) ?>

<h2>Example: Rendering Order</h2>

<p>This example is configured with a custom cell render to make the order of cell rendering clear. Cells are numbered in
    order of rendering, and rendering function takes 10ms to execute, allowing you to see the process of incremental
    rendering more clearly. Note the cell values do not correspond to row or cell indexes.</p>

<p>
    Notice the following in the example below:
</p>

<ul>
    <li>The grid remains interactive while cells are rendering. For example, you can click
        on any row to select it while cells are still rendering.</li>
    <li>In initial rendering and when scrolling down, rows render top to bottom</li>
    <li>When scrolling up, rows render bottom to top</li>
    <li>Cells within a row render left to right regardless of scroll direction</li>
    <li>Only visible cells are rendered. The grid contains 1000 rows and 10,000 cells. If you
        take about 10 seconds to scroll from the top to the bottom, only a few hundred cells
        will actually be rendered. Any cells that are scrolled into view and then back out
        of view again before they have a chance to be rendered will be skipped.</li>
</ul>

<?= example('Rendering Order', 'rendering-order', 'generated', array("enterprise" => 1, "processVue" => true)) ?>


<?php include '../documentation-main/documentation_footer.php';?>
