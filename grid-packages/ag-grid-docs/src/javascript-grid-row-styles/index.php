<?php
$pageTitle = "ag-Grid Styling & Appearance: Row Styles";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. You can change the CSS row style in ag-Grid. This is done by providing style and class callbacks in the column definition.";
$pageKeywords = "ag-Grid Row Styles";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Row Styles</h1>

<p>Row customisation can be achieved in the following ways:</p>

<ul class="content">
    <li><b>Row Style:</b> Providing a CSS style for the rows.</li>
    <li><b>Row Class:</b> Providing a CSS class for the rows.</li>
    <li><b>Row Class Rules:</b> Providing rules for applying CSS classes.</li>
</ul>

<p>
    Each of these approaches are presented in the following sections.
</p>

<h2 id="row-style">Row Style</h2>

<p>
    You can add CSS styles to each row in the following ways:
</p>

<ul class="content">
    <li><code>rowStyle</code>: Property to set style for all rows. Set to an object of key (style names) and values (style values).</li>
    <li><code>getRowStyle</code>: Callback to set style for each row individually.</li>
</ul>

<?= createSnippet(<<<SNIPPET
// set background colour on every row
// this is probably bad, should be using CSS classes
gridOptions.rowStyle = { background: 'black' };

// set background colour on even rows
// again, this looks bad, should be using CSS classes
gridOptions.getRowStyle = function(params) {
    if (params.node.rowIndex % 2 === 0) {
        return { background: 'red' };
    }
}
SNIPPET
) ?>

<h2 id="row-class">Row Class</h2>

<p>You can add CSS classes to each row in the following ways:</p>

<ul class="content">
    <li><code>rowClass</code>: Property to set CSS class for all rows. Provide either a string (class name) or array of strings (array
        of class names).</li>
    <li><code>getRowClass</code>: Callback to set class for each row individually.</li>
</ul>

<?= createSnippet(<<<SNIPPET
// all rows assigned CSS class 'my-green-class'
gridOptions.rowClass = 'my-green-class';

// all even rows assigned 'my-shaded-effect'
gridOptions.getRowClass = function(params) {
    if (params.node.rowIndex % 2 === 0) {
        return 'my-shaded-effect';
    }
}
SNIPPET
) ?>

<h2>Row Class Rules</h2>

<p>
    You can define rules which can be applied to include certain CSS classes via <code>gridOptions.rowClassRules</code>.
    These rules are provided as a JavaScript map where the keys are class names and the values are expressions
    that if evaluated to <code>true</code>, the class gets used. The expression can either be a JavaScript function,
    or a string which is treated as a shorthand for a function by the grid.
</p>

<p>
    The following snippet shows <code>rowClassRules</code> that use functions and the value from the year column:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions.rowClassRules: {
  // apply green to 2008
  'rag-green-outer': function(params) { return params.data.year === 2008; },

  // apply amber 2004
  'rag-amber-outer': function(params) { return params.data.year === 2004; },

  // apply red to 2000
  'rag-red-outer': function(params) { return params.data.year === 2000; }
}
SNIPPET
) ?>

<p>
    When a function is provided the <code>params</code> object has the attributes: <code>data, node, rowIndex, api</code> and <code>context</code>.
</p>

<p>
    As an alternative, you can also provide shorthands of the functions using an expression.
    An expression is evaluated by the grid
    by executing the string as if it were a Javascript expression. The expression
    has the following attributes available to it (mapping the the attributes of the equivalent
    params object):

</p>
    <ul class="content">
        <li><b>ctx</b>: maps context</li>
        <li><b>node</b>: maps node</li>
        <li><b>data</b>: maps data</li>
        <li><b>rowIndex</b>: maps rowIndex</li>
        <li><b>api</b>: maps api</li>
    </ul>

<p>
    The following snippet shows <code>gridOptions.rowClassRules</code> applying classes to rows using expressions on an age column value:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions.rowClassRules: {
    'rag-green': 'data.age < 20',
    'rag-amber': 'data.age >= 20 && data.age < 25',
    'rag-red': 'data.age >= 25'
}
SNIPPET
) ?>

<h2>Refresh of Styles</h2>

<p>
    If you refresh a row, or a cell is updated due to editing, the <code>rowStyle</code>, <code>rowClass</code> and <code>rowClassRules</code> are all
    applied again. This has the following effect:
</p>

<ul class="content">
    <li><b>rowStyle</b>: All new styles are applied. If a new style is the
        same as an old style, the new style overwrites the old style.</li>
    <li><b>rowClass</b>: All new classes are applied. Old classes are not
        removed so be aware that classes will accumulate. If you want to remove
        old classes, then use rowClassRules.</li>
    <li><b>rowClassRules</b>: Rules that return true will have the class
        applied the second time. Rules tha return false will have the class removed
        second time.</li>
</ul>

<h2>Example Row Class Rules</h2>

<p>
    The example below demonstrates <code>rowClassRules</code>:
</p>

<ul class="content">
    <li><code>rowClassRules</code> are used to apply the class <code>sick-days-warning</code> when the number of sick days > 5 and <= 7,
        and the class <code>sick-days-breach</code> is applied when the number of sick days >= 8.</li>
    <li>The grid re-evaluates the rowClassRules when the data is changed. The example
    shows changing the data in the three different ways: <code>rowNode.setDataValue</code>, <code>rowNode.setData</code>
        and <code>api.applyTransaction</code>. See <a href="../javascript-grid-data-update">Updating Data</a> for details on these update functions.</li>
</ul>

<?= grid_example('Row Class Rules', 'row-class-rules', 'generated') ?>

<h2 id="highlighting-rows-and-columns">Highlighting Rows and Columns</h2>

<p>
    The class <code>ag-row-hover</code> and <code>ag-column-hover</code> are added
    to cells as the mouse is dragged over the cells row or column.
</p>

<p>
    The example below demonstrates the following:
</p>

<ul>
    <li>
        CSS class <code>ag-row-hover</code> has background colour added to it,
        so when you hover over a cell, the row will be highlighted.
    </li>
    <li>
        CSS class <code>ag-column-hover</code> has background colour added to it,
        so when you hover over a cell or a header, the column will be highlighted.
    </li>
    <li>
        If you hover over a header group, all columns in the group will be highlighted.
    </li>
</ul>

<?= grid_example('Highlight Rows And Columns', 'highlight-rows-and-columns', 'generated') ?>

<?php include '../documentation-main/documentation_footer.php';?>
