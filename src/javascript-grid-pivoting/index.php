<?php
$key = "Pivoting";
$pageTitle = "ag-Grid Pivoting";
$pageDescription = "One of the most powerful features of ag-Grid is it's ability to pivot data. Learn how to pivot using ag-Grid";
$pageKeyboards = "ag-Grid JavaScritp Grid Pivot";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Pivoting</h2>

    <p>
        <?php include '../enterprise.php';?>
        &nbsp;
        Pivoting rows is available in ag-Grid Enterprise.
    </p>

    <p>
        Pivoting allows you to take a columns values and turn them into columns. For example you can pivot on Country
        to make columns for Ireland, United Kingdom, USA etc.
    </p>

    <p>
        Pivoting only makes sense when mixed with measures. If you turn a column into a pivot column, you must have
        at least one measure active for the configuration to make sense.
    </p>

    <p>
        The discussion below uses the following terms:
        <ul>
            <li>Pivot Mode: Global boolean setting for the grid. Pivot mode is either on or off.</li>
            <li>Row Group Active: At least one column is added a row group column.</li>
            <li>Measure Active: At least one column is added as a measure column.</li>
            <li>Pivot Active: At least one column is added as a pivot column.</li>
        </ul>
    </p>

    <h2>Pivot Mode</h2>

    <p>Pivot mode is required to be turned on for pivoting to work. When the grid is in pivot mode, the following
    will happen:</p>
    <ul>
        <li>Only columns with Group, Pivot or Measure active will be included in the grid.</li>
        <li>Only aggregated rows will be shown, the lowest level rowData will not be displayed.</li>
    </ul>

    <h2>Example - Simple Pivot</h2>

    <p>
        The example below shows a simple pivot on the year column using the Gold, Silver and Bronze columns
        for values.
    </p>

    <p>
        Columns Date and Sport, although defined as columns, are not displayed in the grid as they have no group,
        pivot or measure associated with them.
    </p>

    <show-example example="examplePivot"></show-example>

    <h2>Pivot Mode vs Pivot Active</h2>

    <p>
        It is possible to have pivot mode turned on even though there is no pivot active on the grid.
        In this scenario, the grid will display the data as normal but will strip out columns that
        have no grouping or measure active.
    </p>

    <p>
        The example below demonstrates the difference between pivot mode and having a column with pivot active.
        The example has three modes of operation that can be switched between using the top buttons. The
        modes are as follows:
        <ul>
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
    </p>

    <show-example example="examplePivotMode"></show-example>

    <p>
        Note that a pivot can only be active if pivot mode is on. If pivot mode is off, all pivot
        columns are ignored.
    </p>

    <h2>Pivot Mode & Visible Columns</h2>

    <p>
        When not in pivot mode, only columns that are visible are shown in the grid. To remove a column
        from the grid, use columnApi.setVisible(). Checking a column in the toolPanel will set the visibility
        on the column.
    </p>

    <p>
        When in pivot mode and not pivoting, only columns that have row group or measure active are included
        in the grid. To add a column to the grid you either add it as a row group column or a measure column.
        Setting visibility on a column has no impact when in pivot mode. Checking a column in the toolPanel will
        either add the column as a row group (if the column is configured as a dimension) or as a measure
        (if the columns is configured as a measure).
    </p>

    <p>
        When in pivot mode and pivoting, then the columns displayed in the grid are secondary columns (explained
        below) and not the primary columns. The secondary columns are composed of the pivot and measure columns.
        To have a column included in the calculation of the secondary columns, it should be added as either a
        pivot pivot or a measure column. As with pivot mode and not pivoting, checking a column in the toolPanel
        while in pivot mode will add the column as a row group or a measure. You must drag the column to a pivot
        drop zone in order to add it as a pivot column. As before, setting visibility on the column will have no
        effect when in pivot mode.
    </p>

    <h2>Primary vs Secondary Columns</h2>

    <p>
        When pivot mode is off, the columns in the grid correspond to the column definitions provided in the
        grid configuration. When pivot mode is on and pivot is active, the columns in the grid are composed
        by a matrix of the pivot columns and the measure columns.
    </p>

    <p>For example, consider the columns from the examples {Year and Gold}. If a pivot is placed on Year
        and an aggregation of <i>sum</i> is placed on gold, then the secondary columns that actually get displayed
        in the grid will be {2002 sum(Gold), 2004 sum(Gold), 2006 sum(Gold), 2008 sum(Gold), 2010 sum(Gold),
        2012 sum(Gold)}.
    </p>

    <p>
        The primary and secondary columns behave in different ways in the following scenarios:
    </p>
    <p>
        <b>Tool Panel</b><br>
        The toolPanel will only ever display primary columns.
    </p>
    <p>
        <b>Filtering</b><br>
        Filters can only be set on primary columns.
    </p>
    <p>
        <b>Sorting</b><br>
        what is the story with sorting?
    </p>
    <p>
        <b>Get / Set State</b><br>
        what is the story with state?
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>