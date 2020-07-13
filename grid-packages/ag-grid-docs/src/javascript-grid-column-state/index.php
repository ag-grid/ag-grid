<?php
$pageTitle = "Updating Columns";
$pageDescription = "Columns can be change by the grid, eg column width. This stateful parts of the column can be modified.";
$pageKeywords = "Javascript Grid Column State";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Updating Columns</h1>

<p class="lead">
    This page will have Niall's fabulous Column State work. It's not finished!!!
    Intro...
</p>

<h2 id="adding-removing-columns">Adding & Removing Columns</h2>

<p>
    It is possible to add and remove columns by updating the list of Column Definitions provided to the grid.
</p>

<p>
    When new columns are set, the grid will compare with current columns and work
    out which columns are old (to be removed), new (new columns created) or kept.
</p>

<p>
    The example below demonstrates adding and removing columns from a grid. Note the following:
</p>

<ul>
    <li>
        Selecting the buttons to toggle between including or excluding the medal columns.
    </li>
</ul>

<?= grid_example('Add & Remove Columns', 'add-remove-columns', 'generated') ?>

<p>
    In the example above, note that any state applied to any column (eg sort, filter, width, column position) will
    be kept if the column still exists after the new definitions are applied. For example try the following:
</p>
<ul>
    <li>Resize Country column. Note changing columns doesn't impact it's width.</li>
    <li>Move Country column. Note changing columns doesn't impact it's position.</li>
    <li>Sort Country column. Note changing columns doesn't impact it's sort.</li>
</ul>

<h2 id="applying-column-order">Applying Column Order</h2>

<p>
    When Column Definitions are provided for existing Columns, the order of the Columns inside the grid
    is not changed to match the order of the newly provided Column Definitions. This is by design so
    that any reordering of the columns a user does to the grid is not lost when the Column Definitions
    get updated.
</p>

<p>
    If the desired behaviour is that Columns should be ordered to match the new set of Column Definitions,
    then set the grid property <code>applyColumnDefOrder=true</code>.
</p>

<p>
    The example below demonstrates applying the Column Definitions order to the grid Columns after
    new Column Definitions are set. Both buttons Medals First and Medals Last set the same Columns but
    in a different order.
</p>

<?= grid_example('Column Definition Order', 'col-def-order', 'generated') ?>

<h2 id="changing-column-definition">Changing Column Definition</h2>

<h2 id="changing-column-state">Changing Column State</h2>

<h2 id="matching-columns">Matching Columns</h2>

<p>
    The grid typically uses the <code>field</code> attribute in the column definition to know which
    of the new column definitions matches the old column definition. However using <code>field</code>
    is not dependable as it's possible to have two columns with the same field, or the field could
    be missing (e.g. a <code>valueGetter</code> is used instead).
</p>

<p>
    Given the <code>field</code> is not a unique identifier, the grid uses the following rules
    to match columns:
</p>
<ol>
    <li>Try match based on object equality (e.g. is it the same Column Definition instance).</li>
    <li>If no match found based on object equality then:
        <ul>
            <li>If <code>colId</code> provided, match using <code>colId</code></li>
            <li>If no <code>colId</code> provided, match using <code>field</code></li>
        </ul>
    </li>
</ol>

<p>
    In other words, to have the grid correctly match columns you should provide a <code>colId</code>
    for the column if a) there is no <code>field</code> attribute, or b) the <code>field</code> attribute
    is not unique.
</p>

<p>
    The example below demonstrates the different matching strategies. Note the following:
</p>

<ul>
    <li>
        All columns, with the exception of Country, are matched correctly. This means
        any column width, sort, position etc will be kept between changes to the columns.
        Country will have it's state reset, as it will be treated as a new column each time.
    </li>
    <li>
        Athlete column is matched by object equality as the same column definition instance
        is provided to the grid each time.
    </li>
    <li>
        Age column is matched by <code>colId</code>. The <code>colId</code> is needed as the
        column has no <code>field</code> attribute.
    </li>
    <li>
        All other columns except Country are matched using the <code>field</code> attribute.
    </li>
    <li>
        Country column is not matched as it's a different object instance and has not <code>colId</code>
        or <code>field</code> attributes.
    </li>
</ul>

<?= grid_example('Matching Columns', 'matching-columns', 'generated') ?>



<p>
    Comparison of column definitions is done on 1) object reference comparison and 2)
    column ID eg <code>colDef.colId</code>. If either the object reference matches, or
    the column ID matches, then the grid treats the columns as the same column. For example
    if the grid has a column with ID <code>'country'</code> and the user sets new columns, one of which
    also has ID of <code>'country'</code>, then the old country column is kept in place of the new one
    keeping its internal state such as width, position, sort and filter.
</p>

<note>
    If you are updating the columns (not replacing the entire set) then you must either
    provide column IDs or reuse the column definition object instances. Otherwise the grid will
    not know that the columns are in fact the same columns.
</note>

<p>
    The example below demonstrates changing columns. Select the checkboxes for
    the columns to display and hit Apply. Note the following:
</p>
<ul>
    <li>
        <b>Column Width:</b> If you change the width of a column (e.g. Year)
        and then add or remove other columns (e.g. remove Age) then the width
        of Year remains unchanged.
    </li>
    <li>
        <b>Column Sort:</b> If you sort the data by a column (e.g. Year)
        and then add or remove other columns (e.g. remove Age) then the sort
        remains unchanged. Conversely if you remove a column with a sort
        (e.g. remove Year while also sorting by Year) then the sort
        order is removed.
    </li>
    <li>
        <b>Column Filter:</b> If you filter the data by a column (e.g. Year)
        and then add or remove other columns (e.g. remove Age) then the filter (on Year)
        remains unchanged. Conversely if you remove a column with a filter
        (e.g. remove Year while also filtering on Year) then the filter
        is removed.
    </li>
    <li>
        <b>Row Group &amp; Pivot:</b> If you row group or pivot the data by a column
        (e.g. Year) and then add or remove other columns (e.g. remove Age) then the row group
        or pivot remains unchanged. Conversely if you remove a column with a row group
        or pivot (e.g. remove Year while also row grouping or pivoting on Year) then the
        row group or pivot is removed.
    </li>
    <li>
        The <a href="../javascript-grid-tool-panel-columns/">Columns Tool Panel</a> and
        <a href="../javascript-grid-tool-panel-filters/">Filters Tool Panel</a> updates with the new columns
        (as <code>suppressSyncLayoutWithGrid=true</code>). The order of columns in both tool panels will always
        match the order of the columns supplied in the column definitions. To observe this, hit the Reverse button
        which does same as Apply but reverses the order of the columns first. This will result in the columns
        appearing in the tool panels in reverse order.
    </li>
</ul>

<!--// spl to convert to manual - this sort of dynamic column manipulation is too tricky to do automatically-->
<!--// (or rather comes up too rarely to justify trying to automate it)-->
<?= grid_example('Column Changes', 'column-changes', 'generated', ['enterprise' => true]) ?>



<h2>Column Metadata vs Column State</h2>

<p>
    <a href="../angular-grid-column-definitions/">Column Definitions</a> provide column metadata and column state
    to the grid.
</p>
<p>
    Column metadata describes the column and is not changed by the grid. Examples of metadata on the
    Column Definitions are <code>field</code>, <code>valueGetter</code>, <code>headerName</code> and
    <code>cellRenderer</code>. To change any of these values requires updating the column definition
    provided to the grid. For example to update the Header Name for a column, the application should
    update the Column Definition for that column.
</p>

<p>
    Column state is stateful information about the column and is changed by the grid. Examples of column
    state is <code>width</code>, <code>pinned</code> and <code>sort</code>. The grid can change the state
    in response to the user interacting with the grid. For example the user can change a column width,
    pin a column or sort a column by interacting with the grid UI.
</p>


<h2 id="immutable-columns">Immutable Columns</h2>

<p>
    By default when new columns are loaded into the grid, the following properties are not used:
</p>

<ul>
    <li>Column Order</li>
    <li>Aggregation Function (<code>colDef.aggFunc</code>)</li>
    <li>Width (<code>colDef.width</code>)</li>
    <li>Pivot (<code>colDef.pivot</code> or <code>colDef.pivotIndex</code>)</li>
    <li>Row Group (<code>colDef.rowGroup</code> or <code>colDef.rowGroupIndex</code>)</li>
    <li>Pinned (<code>colDef.pinned</code>)</li>
</ul>
<p>
    This is done on purpose to avoid unexpected behaviour for the application user.
</p>

<p>
    For example, suppose the application user rearranges the order of the columns. If the application then
    sets new column definitions for the purposes of adding one extra column into the grid, it would be
    a bad user experience to reset the order of all the columns.
</p>

<p>
    Likewise if the user changes an aggregation function, or the width of a column, or whether a column was
    pinned, all of these changes the user does should not be undone because the application decided
    to update the column definitions.
</p>

<p>
    To change this behaviour and have column attributes above (order, width, row group etc) take effect
    each time the application updates the grid columns, set the grid property <code>immutableColumns=true</code>.
    The responsibility is then on your application to make sure the provided column definitions are in sync
    with what is in the grid if you don't want undesired visible changes - e.g. if the user changes the width
    of a column, the application should listen to the grid event <code>columnWidthChanged</code> and update
    the application's column definition with the new width - otherwise the width will reset back to the default
    after the application updates the column definitions into the grid.
</p>

<p>
    The example below demonstrates Immutable Column mode. Note the following:
</p>
<ul>
    <li>
        Grid property <code>immutableColumns</code> is set to <code>true</code>.
    </li>
    <li>
        Each button sets a different list of columns into the grid. Because each column
        definition provides an ID, the grid knows the instance of the column is to be kept.
        This means any active sorting or filtering associated with the column will be kept
        between column changes.
    </li>
    <li>
        Each button changes the column definitions in a way that would be otherwise ignored
        if <code>immutableColumns</code> was not set. The changes are as follows:
        <ul>
            <li>
                <b>Normal</b>: Columns are set to the starting normal state. Use this to reset
                the example while observing what the other buttons do.
            </li>
            <li>
                <b>Reverse Order</b>: Columns are provided in reverse order.
            </li>
            <li>
                <b>Widths</b>: Columns are provided with different widths.
            </li>
            <li>
                <b>Visibility</b>: Columns are provided with <code>colDef.hidden=true</code>.
                The columns will still be in the grid and listed in the tool panel, however
                they will not be visible.
            </li>
            <li>
                <b>Grouping</b>: Rows will be grouped by Sport.
            </li>
            <li>
                <b>No Resize or Sort</b>: Clicking the columns will not sort and it will not be possible
                to resize the column via dragging its edge.
            </li>
            <li>
                <b>Pinned</b>: Columns will be pinned to the left and right.
            </li>
        </ul>
    </li>
</ul>


<!--// spl to convert to manual - this sort of dynamic column manipulation is too tricky to do automatically -->
<!--// (or rather comes up too rarely to justify trying to automate it) -->
<?= grid_example('Immutable Columns', 'immutable-columns', 'generated', ['enterprise' => true]) ?>






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
