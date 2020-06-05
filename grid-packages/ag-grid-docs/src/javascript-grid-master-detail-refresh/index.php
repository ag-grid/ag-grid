<?php
$pageTitle = "Master Detail: Detail Refresh";
$pageDescription = "How to refresh Details Data within the Detail Grid";
$pageKeywords = "ag-grid javascript grid table master detail refresh";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<style>
    .example-title {
        font-size: 20px;
        padding-top: 20px;
    }
</style>

<h1 class="heading-enterprise">Master / Detail - Detail Refresh</h1>

<p class="lead">
    It is desirable for the Detail Grid to refresh when fresh data is available for it. The grid will attempt
    to refresh the data in the Detail Grid when the parent Master Grid row is updated.
</p>

<p>
    The update actions that cause the Detail Rows to refresh are as follows:
</p>

<ul>
    <li>
        A <a href="../javascript-grid-data-update-transactions/">Transaction Update</a> updates the parent row.
    </li>
    <li>
        The grid is in <a href="../javascript-grid-immutable-data/">Immutable Data</a> mode and new row data is
        set which updates the Master Grid row.
    </li>
    <li>
        The method <code>rowNode.setRowData()</code> is called on the parent row's
        <a href="../javascript-grid-row-node/">Row Node</a>.
    </li>
</ul>

<p>
    How the refresh occurs depends on the Refresh Strategy set on the Detail Cell Renderer.
    There are three Refresh Strategies which are as follows:
</p>

<ol>
    <li>
        <b>Refresh Rows</b>
        - The detail panel calls <code>getDetailRowData()</code> again and sets the
        row data in the Detail Grid by using it's <code>setRowData</code> grid API.
        This will keep the Detail Grid instance thus any changes in the Detail
        Grid (scrolling, column positions etc) will be kept. If the Detail Grid is configured to use
        <a href="../javascript-grid-immutable-data/">Immutable Data</a> then more grid context will be
        kept such as row selection etc (see the documentation on
        <a href="../javascript-grid-immutable-data/">Immutable Data</a> for how this impacts keeping grid context).
    </li>
    <li>
        <b>Refresh Everything</b>
        - The Detail Panel will get destroyed and a fresh Detail Panel will be redrawn.
        This will result in <code>getDetailRowData()</code> getting called again. The Detail Grid
        will be a new instance and any changes in the Detail Grid (scrolling, column position, row selection etc)
        will be lost. If the Detail Panel is using a custom template, then the template will be re-created.
        Use this option if you want to update the template or you want a fresh detail grid instance.
    </li>
    <li>
        <b>Do Nothing</b>
        - The Detail Panel will do nothing. The method <code>getDetailRowData()</code> will not be called.
        If any refresh is required within the detail grid, this will need to be handled independently by
        the application. Use this if your refresh requirements are not catered for by the other two options.
    </li>
</ol>

<p>
    The strategy is set via the <code>refreshStrategy</code> parameter of the Detail Cell Renderer params.
    Valid values are <code>rows</code> for Refresh Rows, <code>everything</code> for Refresh Everything
    and <code>nothing</code> for Refresh Nothing. The default strategy is Refresh Rows.
</p>

<p>
    Below are different examples to demonstrate each of the refresh strategies. Each example is identical with the
    exception of the refresh strategy used. Note the following about each example:
</p>

<ul>
    <li>
        Each Detail Grid has a title with the record's name and call count eg 'Nora Thomas 24 calls'.
        This is set by providing a custom Detail Cell Renderer template. Only the detail strategy Refresh Everything
        will get this updated.
    </li>
    <li>
        The grid refreshes the first master row every two seconds as follows:
        <ul>
            <li>The call count is incremented.</li>
            <li>Half of the call records (displayed in the detail grid) have their durations updated.</li>
        </ul>
        All refresh strategies will have the Master Grid updated (as the strategy applies to the Detail Grid only),
        however each strategy will have the Detail Grid updated differently.
    </li>
</ul>

<h2 id="refresh-rows">Refresh Rows</h2>

<p>
    This example shows the Refresh Rows strategy. Note the following:
</p>

<ul class="constant">
    <li>
        The Detail Cell Renderer params has <code>refreshStrategy='rows'</code>.
    </li>
    <li>
        The Detail Grid is <b>not</b> recreated.
        The callback <code>getDetailRowData()</code> is called.
        The row data in the Detail Grid is updated to reflect the new values.
        The grid's context (column position, vertical scroll) is kept. Try interacting with the Detail Grid
        for the first row (move columns, vertical scroll) and observe the grid is kept intact.
    </li>
    <li>
        Because the Detail Grid is configured with <a href="../javascript-grid-immutable-data/">Immutable Data</a>
        the data rows are updated rather than replaced. This allows context such maintaining Row Selection and
        flashing cells on data changes.
    </li>
    <li>
        The Detail Grid title 'Nora Thomas 24 calls' doesn't change as the template is only set once for the detail panel.
    </li>
</ul>

<?= grid_example('Refresh Rows', 'refresh-rows', 'generated', ['enterprise' => true, 'exampleHeight' => 550, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2 id="refresh-everything">Refresh Everything</h2>

<p>
    This example shows the Refresh Everything strategy. Note the following:
</p>

<ul class="constant">
    <li>
        The Detail Cell Renderer params has <code>refreshStrategy='everything'</code>.
    </li>
    <li>
        The callback <code>getDetailRowData()</code> is called.
        The Detail Grid is recreated and contains the most recent data.
        The grid's context (column position, vertical scroll) is kept. Try interacting with the detail grid
        for the first row (move columns, vertical scroll) and observe the grid is kept intact.
    </li>
    <li>
        The Detail Grid setting <a href="../javascript-grid-immutable-data/">Immutable Data</a>
        is irrelevant as the Detail Grid is recreated.
    </li>
    <li>
        The detail grid title 'Nora Thomas 24 calls' updates with the new call count, as the refresh results in the
        template getting reset.
    </li>
</ul>

<?= grid_example('Refresh Everything', 'refresh-everything', 'generated', ['enterprise' => true, 'exampleHeight' => 550, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2 id="refresh-nothing">Refresh Nothing</h2>

<p>
    This example shows the Refresh Nothing strategy. Note the following:
</p>

<ul class="constant">
    <li>
        The Detail Cell Renderer params has <code>refreshStrategy='nothing'</code>.
    </li>
    <li>
        No refresh is attempted.
    </li>
    <li>
        The callback <code>getDetailRowData()</code> is <b>not</b> called.
    </li>
    <li>
        The Detail Grid shows old data and the Detail Grid's title remains unchanged.
    </li>
</ul>

<?= grid_example('Refresh Nothing', 'refresh-nothing', 'generated', ['enterprise' => true, 'exampleHeight' => 550, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
