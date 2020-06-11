<?php
$pageTitle = "Pivot Tables: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Pivoting: Make columns out of values by Pivoting on the data, similar to Pivot Tables in Excel. Pivoting allows you to take a columns values and turn them into columns. Enterprise feature of ag-Grid supporting Angular, React, Javascript and many more.";
$pageKeywords = "ag-Grid JavaScript Grid Pivot";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>
    <h1 class="heading-enterprise">Pivoting</h1>

    <p class="lead">
        Pivoting allows you to take a columns values and turn them into columns. For example you can pivot on Country
        to make columns for Ireland, United Kingdom, USA etc.
    </p>

    <h2>Pivot Mode & Visible Columns</h2>

    <p>
        When not in pivot mode, only columns that are visible are shown in the grid. To remove a column
        from the grid, use <code>columnApi.setColumnVisible(colKey, visible)</code>. Checking a column in the toolPanel will set the visibility
        on the column.
    </p>

    <p>
        When in pivot mode and not pivoting, only columns that have row group or aggregation active are included
        in the grid. To add a column to the grid you either add it as a row group column or a value column.
        Setting visibility on a column has no impact when in pivot mode. Checking a column in the toolPanel will
        either add the column as a row group (if the column is configured as a dimension) or as an aggregated value
        (if the columns is configured as a value).
    </p>

    <p>
        When in pivot mode and pivoting, then the columns displayed in the grid are secondary columns (explained
        below) and not the primary columns. The secondary columns are composed of the pivot and value columns.
        To have a column included in the calculation of the secondary columns, it should be added as either a
        pivot or a value column. As with 'pivot mode and not pivoting', checking a column in the toolPanel
        while in pivot mode will add the column as a row group or an aggregated value. You must drag the column to a pivot
        drop zone in order to add it as a pivot column. As before, setting visibility on the column will have no
        effect when in pivot mode.
    </p>



    <h2>Saving & Restoring Column State with Pivot</h2>

    <p>
        Saving and restoring column state works exclusively on primary columns. This makes sense as secondary
        columns are produced from primary columns and row data. So assuming the row data and primary column
        state is the same, the same secondary columns will result.
    </p>

    <p>
        Below shows some examples of saving and restoring state with pivot in mind. Note that <code>pivotMode</code>
        is not stored as part of the column state. If <code>pivotMode</code> is important to your columns state, it
        needs to be stored separately.
    </p>

    <?= grid_example('Saving & Restoring Column State', 'state', 'generated', ['enterprise' => true, 'exampleHeight' => 630, 'modules' => ['clientside', 'rowgrouping', 'menu', 'setfilter', 'columnpanel', 'filterpanel']]) ?>


<?php include '../documentation-main/documentation_footer.php';?>
