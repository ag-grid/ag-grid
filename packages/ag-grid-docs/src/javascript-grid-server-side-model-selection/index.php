<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeyboards = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Row Selection </h1>

<p class="lead">
    Learn how to implementing Row Selection with the Server-side Row Model.
</p>

<h2>Selection with Server-side Row Model</h2>

<p>
    Selecting rows and groups in the Server-side Row Model is supported.
    Just set the property <code>rowSelection</code> to either <code>single</code>
    or <code>multiple</code> as with any other row model.
</p>

<h3>Selecting Group Nodes</h3>

<p>
    When you select a group, the children of that group may or may not be loaded
    into the grid. For this reason the setting <code>groupSelectsChildren=true</code> (which
    selects all the children of the group when you select a group) does not make
    sense. When you select a group, the group row only will be marked as selected.
</p>

<h2>Example - Click Selection</h2>

<p>
    The example below shows both simple 'click' selection as well as multiple 'shift-click' selections. Selecting groups
    is not allowed as clicking on groups is reserved for opening and closing the groups.
</p>

<ul class="content">
    <li><b>Single 'Click' Selection</b> - when you click on a leaf level row, the row is selected.</li>
    <li><b>Multiple 'Shift-Click' Selections</b> - select a leaf row (single click) and then 'shift-click' another leaf
        row within the same group to select all rows between that range.</li>
</ul>


<?= example('Click Selection', 'click-selection', 'generated', array("enterprise" => 1)) ?>

<note>
    Performing multiple row selections using 'shift-click' has the following restrictions:
    <ul class="content">
        <li>Only works across rows that share the same parent.</li>
        <li>Only works for rows that are loaded (eg a large range selection may span rows that are not loaded).</li>
    </ul>
</note>

<h2>Example - Checkbox Selection</h2>

<p>
    Below shows another example using checkbox selection. The example shows:
    The example shows checkboxes on the groups and a regular column. This is for comparison in the example
    only. Normal applications generally have the checkbox on one column or the groups.
</p>

    <ul class="content">
        <li>
            Checkbox selection on the group column allowing selection of any row.
        </li>
        <li>
            Checkbox selection on the group sport column. Selection is restricted to leaf level rows only
            via <code>gridOptions.isRowSelectable(rowNode)</code> callback.

        </li>
    </ul>
<?= example('Checkbox Example', 'checkbox', 'generated', array("enterprise" => 1)) ?>


<h2>Providing Node ID's</h2>

<p>
    Providing node ID's is optional. If you provide your own node id's
    (using the <code>getRowNodeId()</code> callback)
    then you must make sure that the rows have unique ID's across your entire data
    set. This means all the groups and all leaf level nodes must have unique
    id's, even if the leafs are not part of the same group. This is because
    the grid uses node id's internally and requires them to be unique.
</p>

<p>
    If you do not provide node id's, the grid will provide the id's for you,
    and will make sure they are unique.
</p>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about setting <a href="../javascript-grid-server-side-model-row-height/">Row Heights</a>
    using the Server-side Row Model.
</p>

<?php include '../documentation-main/documentation_footer.php';?>