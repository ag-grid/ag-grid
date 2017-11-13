<?php
$key = "Master Detail";
$pageTitle = "ag-Grid JavaScript Master Detail DataGrid";
$pageDescription = "ag-Grid allows to use one component to span the entire width of the grid. This can be used to achieve a master detail datagrid, or grids inside grids.";
$pageKeyboards = "ag-Grid full width master detail javascript datagrid";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="first-h1">Master Detail</h1>

<p>
    Master detail allows you to nest grids inside grids. The top level grid is referred to as the 'master grid'.
    The nested grid is referred to as the 'detail grid'. Typically the detail grid gives more information
    about the row in the master grid that was expanded to reveal the detail grid.
</p>

<p>
    To enable master detail, you should set the following grid options:
    <ul>
        <li>
            <b>masterDetail:</b> Set to true to inform the grid you want to allow
            expanding of rows to reveal detail grids.
        </li>
        <li>
            <b>detailGridOptions:</b> The grid options to set for the detail grid.
            The detail grid is a fully featured instance of ag-Grid, so any configuration
            can be set on the detail grid that you would set any other grid.
        </li>
        <li>
            <b>getDetailRowData:</b> A function you implement to provide the grid
            with rows for display in the detail grids.
        </li>
    </ul>
</p>

<h2>Example - Simple Master Detail</h2>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
    <ul>
        <li></li>
    </ul>
</p>

<?= example('Simple Example', 'simple', 'generated') ?>

<h2>Example - Using String Template</h2>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
<ul>
    <li></li>
</ul>
</p>

<?= example('String Template', 'string-template', 'generated', array("enterprise" => 1)) ?>

<h2>Example - Using Template Callback with Inner Grid</h2>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
<ul>
    <li></li>
</ul>
</p>

<?= example('Template Callback with Inner Grid', 'template-callback-inner-grid', 'generated', array("enterprise" => 1)) ?>

<h2>Example - Using Template Callback with Form</h2>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
<ul>
    <li></li>
</ul>
</p>

<?= example('Template Callback with Form', 'template-callback-form', 'generated', array("enterprise" => 1)) ?>

<h2>Example - Custom Detail Component</h2>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
<ul>
    <li></li>
</ul>
</p>

<?= example('Custom Detail Component', 'custom-detail-component', 'generated', array("enterprise" => 1)) ?>


<h2>Example - Editing Cells</h2>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
<ul>
    <li></li>
</ul>
</p>

<?= example('Cell Editing', 'cell-editing', 'generated', array("enterprise" => 1)) ?>

<h2>Example - Dynamic Master Nodes</h2>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
<ul>
    <li></li>
</ul>
</p>

<?= example('Dynamic Master Nodes', 'dynamic-master-nodes', 'generated', array("enterprise" => 1)) ?>

<h2>Example - Filtering with Sort</h2>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
<ul>
    <li></li>
</ul>
</p>

<?= example('Filtering with Sort', 'filtering-with-sort', 'generated', array("enterprise" => 1)) ?>

<h2>Example - Lazy Load Rows</h2>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
<ul>
    <li></li>
</ul>
</p>

<?= example('Lazy Load Rows', 'lazy-load-rows', 'generated', array("enterprise" => 1)) ?>

<h2>Example - Multiple Levels of Master Detail</h2>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
<ul>
    <li></li>
</ul>
</p>

<?= example('Multiple Levels of Master Detail', 'multiple-levels', 'generated', array("enterprise" => 1)) ?>

<h2>Example - Detail Row Height</h2>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
<ul>
    <li></li>
</ul>
</p>

<?= example('Detail Row Height', 'detail-row-height', 'generated', array("enterprise" => 1)) ?>

<h2>Example - Dynamic Height</h2>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
<ul>
    <li></li>
</ul>
</p>

<?= example('Dynamic Height', 'dynamic-row-height', 'generated', array("enterprise" => 1)) ?>


<h2>Supported Modes</h2>

<p>
    The master / detail feature organises the grid in a way which overlaps with other features.
    For example, master / detail expands rows, which is also the case with row grouping or enterprise
    row model. For this reason, master / detail does not work with certain grid configurations.
    These configurations are listed below.
</p>

<h3>Row Models</h3>

<p>
    The master grid (i.e. the top level grid) in master / detail can only be using the
    <a href="../javascript-grid-in-memory/">In Memory</a> row model.
    It is not supported with <a href="../javascript-grid-enterprise-model/">Enterprise</a>,
    <a href="../javascript-grid-viewport">Viewport</a> or
    <a href="../javascript-grid-infinite-scrolling">Infinite</a> row models. This is because
    all of these row models have their own unique way of loading data which would clash with
    the workings on master detail.
</p>

<p>
    The detail grid (i.e. the child grid) can use any of the row models. Thus as long as the
    master grid uses <a href="../javascript-grid-in-memory/">In Memory</a>, then the detail
    grid can use any of the other row models.
</p>

<p>
    The reason for this is that the row expand and collapse is either not support (viewport and
    infinite row models) or has a different meaning (enterprise row model loads more rows when
    you expand).
</p>

<h3>Tree Data</h3>

<p>
    Master detail is not supported with <a href="../javascript-grid-tree-data">Tree Data</a>.
    This is because the concept of tree data conflicts with master / detail, in that in tree
    data, any row can expand to show child rows, which would result in a clash when a row
    has child rows in addition to having master / detail at the same row.
</p>

<h3>Layouts</h3>

<p>
    It is not possible to mix <a href="../javascript-grid-width-and-height/#dom-layout">DOM layout</a>
    for master detail. This is because the layout is a CSS setting that would be inherited by all
    grids contained with the master grid. So if your master grid was 'for-print', then all child grids
    would pick up the 'for-print' layout.
</p>

<p>
    When using master detail and <a href="../javascript-grid-for-print/">for-print</a>,
    then all detail grids need to use for-print.
</p>

<p>
    When using master / detail and <a href="../javascript-grid-width-and-height/#autoHeight">auto-height</a>,
    then all detail grids need to use auto-height.
</p>

<div style="border-left: 4px solid lightcoral; padding-left: 4px;">

    <h3 id="example-master-detail-grids">Deprecated: Old Master Detail</h3>

    <p>
        Before v14.1 of ag-Grid, master detail was not a directly supported feature of ag-Grid.
        Instead users of ag-Grid had to use the <a href="../javascript-grid-full-width-rows/">fullWidth</a>
        and depreacted tree data feature
        to achieve master detail. Below shows this depreated way, which still works, but
        we advise against it.
    </p>

    <p>
        The example below shows using fullWidth to provide a master / detail grid setup. The fullWidth concept
        is used as normal, that fact that another grid instance is used in the fullWidth cellRenderer is
        independent to the configuration of the fullWidth feature.
    </p>

    <p>
        The example uses <i>getNodeChildDetails(dataItem)</i> callback (explained in section
        <a href="../javascript-grid-tree/">Tree Data</a>). There is no advantage in this example to using the
        <a href="../javascript-grid-full-width-rows/#flowerNodes">flower technique</a>, however it is presented to demonstrate an alternative.
    </p>

    <p>
        The following should be noted from the example:
        <ul>
        <li>Two grid types are used, one instance of the master grid and many detail grids. There are as many
        detail grids shown as required to render all the currently displayed detail rows.</li>
        <li>The grid types share no configuration.</li>
        <li>As the user scrolls up and down, the detail grids are continuously destroyed and recreated
        in correspondence to ag-Grids row virtualisation.</li>
        <li>The nested grids are fully featured ag-Grid's, with full support of all features. The example
        demonstrates filtering and sorting in the detail grid.</li>
        <li>The grids work independently of each other, for example selection in one grid does not impact
        selection in any other grid.</li>
        <li>In order to allow for filtering by name and account, we add to all the lear rows their parent
            name and parent account values.</li>
    </ul>
    </p>

    <?= example('Master Detail', 'master-detail', 'vanilla', array("enterprise" => 1)) ?>

    <note>
        The example is using parent / child relationships and has exactly one child to each parent.
        This is why the list of phone calls is returned in <i>getNodeChildDetails()</i> and that full
        list is the data provided to the fullWidth cellRenderer. The master grid thinks each row has
        one child row (the fullWidth row), it is not concerned with the fact that each child row
        in fact displays a list of child records.
    </note>

    <note>
        ag-Grid has the concept of <a href="../javascript-grid-master-slave/">Master / Slave</a> grids which
        is a technique for syncing column between two grids. This is not related to Master / Detail grids explained
        here. They just have similar names.
    </note>

    <h3 id="server-requests-for-additional-data">Server Requests for Additional Data</h3>

    <p>
        The examples on this page do not contact the server for more data to display in the fullWidth components.
        This is to keep the examples simple. On your application, there is nothing stopping you from hitting there
        server again to get more data to display. How to do this is outside of the context of ag-Grid, however
        maybe you would consider showing a loading spinner icon while you fetch the data in the fullWidth component.
    </p>

    <h3 id="using-fullwidth-with-pagination">Using fullWidth with Pagination, Virtual Pagination and Viewport</h3>

    <p>
        It is possible to use fullWidth with any of the row models. However grouping (and / or parent child)
        relationships that are required to make fullWidth useful in your circumstance may not be available.
        In other words, fullWidth works everywhere but parent / child may not. See the sections on the individual
        row model for details.
    </p>

    <?= example('Simple', 'simple', 'vanilla', array("enterprise" => 1)) ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
