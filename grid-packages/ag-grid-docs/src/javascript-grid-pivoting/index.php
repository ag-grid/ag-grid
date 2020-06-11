<?php
$pageTitle = "Pivot Tables: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Pivoting: Make columns out of values by Pivoting on the data, similar to Pivot Tables in Excel. Pivoting allows you to take a columns values and turn them into columns. Enterprise feature of ag-Grid supporting Angular, React, Javascript and many more.";
$pageKeywords = "ag-Grid JavaScript Grid Pivot";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Pivoting - Overview</h1>

    <p class="lead">
        Pivoting allows you to take a columns values and turn them into columns. For example you can pivot on Country
        to make columns for Ireland, United Kingdom, USA etc.
    </p>

    <p>
        Pivoting only makes sense when mixed with aggregation. If you turn a column into a pivot column, you must have
        at least one aggregation (value) active for the configuration to make sense. For example, if pivoting by country, you
        must provide something you are measuring such as 'gold medals per country'.
    </p>

    <h2>Pivot Mode</h2>

    <p>
        Pivot mode is required to be turned on for pivoting to work. When the grid is in pivot mode, the following will
        happen:
    </p>

    <ul class="content">
        <li>Only columns with Group, Pivot or Value active will be included in the grid.</li>
        <li>Only aggregated rows will be shown, the lowest level rowData will not be displayed.</li>
    </ul>

    <p>
        If pivot mode is off, then adding or removing pivot columns will have no effect.
    </p>

    <note>
        To allow a column to be used as pivot column via the <a href="../javascript-grid-tool-panel/">Tool Panel</a>,
        set <code>enablePivot=true</code> on the required columns. Otherwise you won't be able to drag
        and drop the columns to the pivot drop zone from the Tool Panel.
    </note>

    <h2>Specifying Pivot Columns</h2>

    <p>
        To pivot rows by a particular column, mark the column you want to group with <code>pivot=true</code>.
        There is no limit on the number of columns that the grid can pivot by.
        For example, the following will pivot the rows in the grid by country and then sport:
    </p>

    <snippet>
gridOptions.columnDefs = [
    {headerName: "Country", field: "country", pivot: true},
    {headerName: "Sport", field: "sport", pivot: true}
];</snippet>
    </p>

    <h2>Example: Simple Pivot</h2>

    <p>
        The example below shows a simple pivot on the year column using the Gold, Silver and Bronze columns
        for values.
    </p>

    <p>
        Columns Date and Sport, although defined as columns, are not displayed in the grid as they have no group,
        pivot or value associated with them.
    </p>

    <?= grid_example('Simple Example', 'simple', 'generated', ['enterprise' => true, 'exampleHeight' => 630, 'modules' => ['clientside', 'rowgrouping', 'menu', 'columnpanel']]) ?>

    <h2>Pivot Mode vs Pivot Active</h2>

    <p>
        It is possible to have pivot mode turned on even though there is no pivot active on the grid.
        In this scenario, the grid will display the data as normal but will strip out columns that
        have no grouping or value active.
    </p>

    <p>
        The example below demonstrates the difference between pivot mode and having a column with pivot active.
        The example has three modes of operation that can be switched between using the top buttons. The
        modes are as follows:
    </p>
        <ul class="content">
        <li>
            <b>1 - Grouping Active:</b> This is normal grouping. The grid groups with aggregations
            over Gold, Silver and Bronze. The user can drill down to the lowest level row data and columns
            without aggregation or group (eg Country, Year, Date and Sport) are shown.
        </li>
        <li>
            <b>2 - Grouping Active with Pivot Mode:</b> This is grouping with pivotMode=true, but without
            any pivot active. The data shown is identical to the first option except the grid removes
            access to the lowest level row data and columns without aggregation or group
            are not shown.
        </li>
        <li>
            <b>3 - Grouping Active with Pivot Mode and Pivot Active:</b> This is grouping with pivotMode=true
            and pivot active. Although it appears similar to the second option, there is no pivot active
            in the second option.
        </li>
    </ul>

    <?= grid_example('Pivot Mode Vs Pivot Active', 'pivot-mode', 'generated', ['enterprise' => true, 'exampleHeight' => 630, 'modules' => ['clientside', 'rowgrouping', 'menu', 'columnpanel']]) ?>

    <p>
        Note that a pivot can only be active if pivot mode is on. If pivot mode is off, all pivot
        columns are ignored.
    </p>


<?php include '../documentation-main/documentation_footer.php';?>
