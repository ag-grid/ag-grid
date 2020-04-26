<?php
$pageTitle = "Set Filter: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Set Filter. Set Filter works like Excel, providing checkboxes to select values from a set. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Set Filter - Data Updates</h1>

<p class="lead">
    This section describes how updating data through Cell Editing, Transactions Updates and Setting New Data, affects
    Set Filter values.
</p>

<h2>Cell Editing</h2>

<p>
    Filter values will be refreshed when data is updated through <a href="../javascript-grid-cell-editing">Cell Editing</a>.
</p>

<p>
    Here are the rules that determine how filter values are selected:
</p>

<ul class="content">
    <li><b>No Active Filters</b>: all filter values, including new values, will be selected.</li>
    <li><b>Active Filters</b>: previous selections will remain intact but new values will not be selected.</li>
</ul>

<p>
    Cell Editing does not re-execute filtering by default, so the row will not be filtered out even though the value in
    the cell is not selected in the filter. This default behaviour mimics how Excel works.
</p>

<p>
    To execute filtering on cell edits, listen to <code>CellValueChanged</code> events and trigger filtering as shown below:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    onCellValueChanged: function(params) {
        // trigger filtering on cell edits
        params.api.onFilterChanged();
    }
    // other options
}
SNIPPET
    , 'ts') ?>

<p>
    The following example demonstrates cell editing with the Set Filter. Try the following:
</p>

<p><b>Without selecting any filter values:</b></p>
<ul class="content">
    <li>
        Change (Cell Edit) a <code>'B'</code> cell value to <code>'X'</code> and note it gets added to the filter list and is
        <b>selected</b>.
    </li>
</ul>

<p><b>Click 'Reset' and deselect 'C' in the Filter List:</b></p>
<ul class="content">
    <li>
        Change (Cell Edit) a <code>'B'</code> cell value to <code>'X'</code> and notice it gets added to the filter list
        but it is <b>not selected</b>.
    </li>
    <li>
        Note that although <code>'X'</code> is not selected in the filter the row still appears in the grid. This is
        because grid filtering is not triggered for cell edits.
    </li>
</ul>


<?= grid_example('Cell Editing Updates', 'cell-editing-updates', 'generated', ['enterprise' => true, 'exampleHeight' => 480, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel', 'filterpanel']]) ?>


<h2>Transaction Updates</h2>

<p>
    Filter values are refreshed when data is updated using <a href="../javascript-grid-data-update-transactions/">Transaction Updates</a>.
</p>

<note>
    This section also applies to <a href="../javascript-grid-immutable-data/">Immutable Data</a> as it uses Transaction Updates under the hood.
</note>

<p>
    Here are the rules that determine how filter values are selected:
</p>

<ul class="content">
    <li><b>No Active Filters</b>: all filter values, including new values, will be selected.</li>
    <li><b>Active Filters</b>: previous selections will remain intact but new values will not be selected.</li>
</ul>

<p>
    Unlike <a href="../javascript-grid-filter-set/#cell-editing">Cell Editing</a>, transaction updates will execute filtering in the grid.
</p>

<p>
    The following example demonstrates these rules. Try the following:
</p>

<p><b>Without selecting any filter values:</b></p>
<ul class="content">
    <li>
        Click <b>Update First Displayed Row</b>: this calls <code>api.updateRowData()</code> and updates the value in the
        first row. Note <code>'AX'</code> now appears in the filter list and is <b>selected</b>.
    </li>
    <li>
        Click <b>Add New 'D' Row</b>: this calls <code>api.updateRowData()</code> and adds a new row to the grid. Note
        <code>'D'</code> has been added to the filter list and is <b>selected</b>.
    </li>
</ul>

<p><b>Click 'Reset' and deselect 'C' in the Filter List:</b></p>
<ul class="content">
    <li>
        Click <b>Update First Displayed Row</b>: this calls <code>api.updateRowData()</code> and updates the value in the
        first row. Note <code>'AX'</code> now appears in the filter list and is <b>not selected</b>.
    </li>
    <li>
        Note that as <code>'AX'</code> is unselected in the filter list it has also been filtered out of the grid. This is
        because transaction updates also triggers grid filtering.
    </li>
    <li>
        Click <b>Add New 'D' Row</b>: this calls <code>api.updateRowData()</code> and adds a new row to the grid. Note
        <code>'D'</code> has been added to the filter list and is <b>not selected</b>.
    </li>
</ul>

<?= grid_example('Transaction Updates', 'transaction-updates', 'generated', ['enterprise' => true, 'exampleHeight' => 480, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel', 'filterpanel']]) ?>

<h2>Setting New Data</h2>

<p>
    By default, when <code>api.setRowData()</code> is called, all set filter selections will be lost.
</p>
<p>
    It is recommended that <code>newRowsAction='keep'</code> set on the filter params to keep existing filter selections
    when new rows are added, as shown below:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'col1',
    filter: 'agSetColumnFilter',
    filterParams: {        
        newRowsAction: 'keep'
    }
}
SNIPPET
    , 'ts') ?>

<note>
    <code>newRowsAction</code> is deprecated, <code>newRowsAction='keep'</code> will become the default behaviour in v24.
</note>

<p>
    However it is still possible to clear filter selections using: <code>api.setFilterModel([])</code>.
</p>

<p>
    The following example demonstrates how <code>api.setRowData()</code> affects filter selections. Try the following:
</p>

<ul class="content">
    <li>
        Deselect value 'B' from the set filter list and click the <b>Set New Data</b> button which in turn calls
        <code>api.setRowData(newData)</code> which add new data with extra rows to the grid.
    </li>
    <li>
        Notice 'B' remains deselected after new data is supplied to the grid as the Set Filter has set
        <code>newRowsAction='keep'</code> in the filter params.
    </li>
    <li>
        Clicking <b>Reset</b> invokes <code>api.setRowData(origData)</code> to restore the original data but also clears
        any selections using <code>api.setFilterModel([])</code>.
    </li>
</ul>

<?= grid_example('Setting New Data', 'setting-new-data', 'generated', ['enterprise' => true, 'exampleHeight' => 500, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel', 'filterpanel']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
