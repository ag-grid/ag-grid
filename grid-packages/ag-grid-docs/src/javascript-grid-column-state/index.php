<?php
$pageTitle = "Updating Columns";
$pageDescription = "Columns can be change by the grid, eg column width. This stateful parts of the column can be modified.";
$pageKeywords = "Javascript Grid Column State";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Column State</h1>


<h2 id="changing-column-definition">Changing Column Definition</h2>

<h2 id="changing-column-state">Changing Column State</h2>

<h2 id="matching-columns">Matching Columns</h2>


<h2>Updating Column Definitions</h2>

<p>
    Matching columns based on id.
</p>

<p>
    Keeping column order.
</p>

<p>
    <code>width</code> vs <code>defaultWidth</code>...
</p>

<p>
    Null values vs Undefined / missing values.
</p>

<p>Examples:</p>
<ul>
    <li>Set column defs, change header names.</li>
    <li>Set column defs, change stateful items, width vs defaultWidth.</li>
    <li>Set column defs, new order.</li>
</ul>

<h2>Get / Apply State</h2>


<h2 id="saving-and-restoring-column-state">Saving and Restoring Column State</h2>

<p>
    It is possible to save and subsequently restore the column state via the
    <a href="../javascript-grid-column-api//">Column API</a>. Examples of state include column visibility, width,
    row groups and values.
</p>

<p>
    This is primarily achieved using the following methods:
</p>

<ul class="content">
    <li><code>columnApi.getColumnState()</code>: Returns the state of a particular column.</li>
    <li><code>columnApi.setColumnState(state)</code>: To set the state of a particular column.</li>
</ul>

<p>
    The column state used by the above methods is an array of objects that mimic the <code>colDefs</code> which can be
    converted to and from JSON. An example is shown below:
</p>

<?= createSnippet(<<<SNIPPET
[
  { colId: 'athlete', aggFunc: 'sum',  hide: false, rowGroupIndex: 0,    width: 150, pinned: null   },
  { colId: 'age',     aggFunc: null,   hide: true,  rowGroupIndex: null, width: 90,  pinned: 'left' }
]
SNIPPET
) ?>

<p>
    The values have the following meaning:
</p>
<ul class="content">
    <li><code>colId</code>: The ID of the column.
    </li>
    <li><code>aggFunc</code>: If this column is a value column, this field specifies the aggregation function.
        If the column is not a value column, this field is <code>null</code>.
    </li>
    <li><code>hide</code>: <code>true</code> if the column is hidden, otherwise <code>false</code>.</li>
    <li><code>rowGroupIndex</code>: The index of the row group. If the column is not grouped, this field is <code>null</code>.
        If multiple columns are used to group, this index provides the order of the grouping.
    </li>
    <li><code>width</code>: The width of the column. If the column was resized, this reflects the new value.</li>
    <li><code>pinned</code>: The pinned state of the column. Can be either <code>'left'</code> or <code>'right'</code></li>
</ul>

<note>
    To suppress events raised when invoking <code>columnApi.setColumnState(state)</code>, and also
    <code>columnApi.resetColumnState()</code>, use: <code>gridOptions.suppressSetColumnStateEvents = true</code>.
</note>

<h2 id="column-api-example">Column API Example</h2>
<p>The example below shows using the grid's <a href="../javascript-grid-column-api/">Column API</a>.
</p>

<?= grid_example('Column State Example', 'column-state', 'generated', ['enterprise' => true, 'reactFunctional' => true]) ?>

<note>
    This example also includes <a href="../javascript-grid-grouping-headers/">Column Groups</a> which are
    covered in the next section, in order to demonstrate saving and restoring the expanded state.
</note>

<p>
    Saving and restoring state.
</p>

<p>Examples:</p>
<ul>
    <li>Saving / applying everything.</li>
    <li>Saving / apply just widths.</li>
    <li>Apply just order.</li>
    <li>Events</li>
</ul>

<p>
    Applying specific state.
</p>

<p>
    Default column state.
</p>

<p>Examples:</p>

<ul>
    <li>Buttons to turn on / off different state items.</li>
</ul>

<h2>State vs ColDef Comparison</h2>

<ul>
    <li>State can modify auto cols.</li>
    <li>State better for storing, as don't have noise.</li>
    <li>State doesn't bother with column groups.</li>
    <li>Col Defs adds/removes columns, state only applies to current columns.</li>
    <li>Events</li>
</ul>

<?php include '../documentation-main/documentation_footer.php';?>
