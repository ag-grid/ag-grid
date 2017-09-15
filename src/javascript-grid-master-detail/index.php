<?php
$key = "Master Detail";
$pageTitle = "ag-Grid JavaScript Master Detail DataGrid";
$pageDescription = "ag-Grid allows to use one component to span the entire width of the grid. This can be used to achieve a master detail datagrid, or grids inside grids.";
$pageKeyboards = "ag-Grid full width master detail javascript datagrid";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h3 id="example-master-detail-grids">Master Detail Grids</h3>

    <p>
        A common requirement is to have a master / detail relationship between two grids where you have the
        rows expand into more details by displaying another grid with different columns when you expand the rows
        of the top level grid.
    </p>

    <p>
        ag-Grid supports master detail grids using the grids
        <a href="../javascript-grid-full-width-rows/">fullWidth</a> feature.
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

    <?= example('Master Detail', 'master-detail') ?>

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

</div>

<?php include '../documentation-main/documentation_footer.php';?>
