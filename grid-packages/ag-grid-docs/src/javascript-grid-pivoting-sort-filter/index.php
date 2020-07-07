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

    <h2>Filtering with Pivot</h2>

    <p>
        Filtering is always on primary columns. It is not possible, nor would it make sense, to set a filter on a secondary column.
    </p>

    <p>
        If pivoting and a filter changes then the set of secondary columns is recalculated
        based on the newly available columns and aggregation is recalculated.
    </p>

    <p>
        You can change the filter on primary columns using the API at all times, regardless of what columns
        (primary or secondary) are displayed in the grid.
    </p>

    <p>
        Below demonstrates the impact of changing filter on pivoting. The pivot is executed on rowData after the
        filter is complete. Notice that the last option, 'USA and Canada Equestrian' has no 'Canada' in the result
        as there is no records for Canada and Equestrian.
    </p>

    <p>
        Filters always belong to primary columns. When in pivot mode, filters are not accessible through the
        column menu (as secondary columns are used), however filters can always be accessed through the filters
        tool panel.
    </p>

    <?= grid_example('Filtering With Pivot', 'filter', 'generated', ['enterprise' => true, 'exampleHeight' => 610, 'modules' => ['clientside', 'rowgrouping', 'columnpanel', 'filterpanel', 'setfilter', 'menu']]) ?>

    <h2>Sorting with Pivot</h2>

    <p>
        Sorting with pivot works as you would expect, either click the column header or use the API to sort.
    </p>

    <p>
        The example below demonstrates sorting with pivot. Each sort button looks up the colId in different
        ways. The first uses the provided API, the second does it manually. There is no benefit to doing it
        manually, the code below is only given to the curious who want to understand the column structure
        underneath the hood.
    </p>

    <?= grid_example('Sorting With Pivot', 'sorting', 'generated', ['enterprise' => true, 'exampleHeight' => 630, 'modules' => ['clientside', 'rowgrouping', 'menu', 'columnpanel', 'filterpanel']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
