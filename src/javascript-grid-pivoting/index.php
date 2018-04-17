<?php
$pageTitle = "Pivot Tables: Enterprise Grade Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Pivoting. Make columns out of values by Pivoting on the data, similar to Pivot Tables in Excel. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid JavaScritp Grid Pivot";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Pivoting</h1>

    <p>
        Pivoting allows you to take a columns values and turn them into columns. For example you can pivot on Country
        to make columns for Ireland, United Kingdom, USA etc.
    </p>

    <p>
        Pivoting only makes sense when mixed with aggregation. If you turn a column into a pivot column, you must have
        at least one aggregation (value) active for the configuration to make sense. For example, if pivoting by country, you
        must provide something you are measuring such as 'gold medals per country'.
    </p>

    <h2>Pivot Mode</h2>

    <p>Pivot mode is required to be turned on for pivoting to work. When the grid is in pivot mode, the following
    will happen:</p>
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

    <h2>Example - Simple Pivot</h2>

    <p>
        The example below shows a simple pivot on the year column using the Gold, Silver and Bronze columns
        for values.
    </p>

    <p>
        Columns Date and Sport, although defined as columns, are not displayed in the grid as they have no group,
        pivot or value associated with them.
    </p>

    <?= example('Simple Example', 'simple', 'generated', array("enterprise" => 1)) ?>

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

    <?= example('Pivot Mode Vs Pivot Active', 'pivot-mode', 'generated', array("enterprise" => 1)) ?>

    <p>
        Note that a pivot can only be active if pivot mode is on. If pivot mode is off, all pivot
        columns are ignored.
    </p>

    <h2 id="pivot-mode">Pivot Mode & Visible Columns</h2>

    <p>
        When not in pivot mode, only columns that are visible are shown in the grid. To remove a column
        from the grid, use columnApi.setVisible(). Checking a column in the toolPanel will set the visibility
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

    <h2 id="secondary-columns">Primary vs Secondary Columns</h2>

    <p>
        When pivot mode is off, the columns in the grid correspond to the column definitions provided in the
        grid configuration. When pivot mode is on and pivot is active, the columns in the grid are composed
        by a matrix of the pivot columns and the aggregated value columns.
    </p>

    <p>For example, consider the columns from the examples {Year and Gold}. If a pivot is placed on Year
        and an aggregation of <code>sum</code> is placed on gold, then the secondary columns that actually get displayed
        in the grid will be {2002 sum(Gold), 2004 sum(Gold), 2006 sum(Gold), 2008 sum(Gold), 2010 sum(Gold),
        2012 sum(Gold)}.
    </p>

    <p>
        The primary and secondary columns behave in different ways in the following scenarios:
    </p>
    <p>
        <b>Tool Panel</b><br>
        The toolPanel always displays primary columns.
    </p>
    <p>
        <b>Filtering</b><br>
        Filters are always set on primary columns.
    </p>
    <p>
        <b>Sorting</b><br>
        Sorting can be on primary or secondary columns, depending on what is displayed inside the grid.
    </p>
    <p>
        <b>Column State</b><br>
        Storing and restoring column state view the <code>columnApi.getColumnState()</code> and
        <code>columnApi.setColumnState()</code> methods work solely on primary columns.
    </p>
    
    <h2>Looking up Secondary Columns</h2>

    <p>
        As mentioned above, the secondary columns in the grid are created by the grid by cross referencing
        pivot columns with value columns. The result of which are new columns that have column ID's generated by
        the grid. If you want to use the column API to manage the generated columns (eg to set their width,
        apply a sort etc) you need to look up the column. The grid provides a utility function to look up
        such columns called <code>getSecondaryPivotColumn(pivotCols, valueCol)</code>
    </p>

    <snippet>
// look up the column that pivots on country Ireland and aggregates gold
var irelandGoldColumn = columnApi.getSecondaryPivotColumn(['Ireland'],'gold');
columnApi.setColumnWidth(irelandGoldColumn, newWidth);

// look up the column that pivots on country SausageKingdom and year 2002 and aggregates silver
var sausageKingdomColumn = columnApi.getSecondaryPivotColumn(['SausageKingdom','2002'],'gold');
console.log('found column with id ' + sausageKingdomColumn.getId());</snippet>

    <h2>Filtering with Pivot</h2>

    <p>Filtering is always on primary columns. It is not possible, nor would it make sense, to set a filter on a secondary column.</p>

    <p>If pivoting and a filter changes then the set of secondary columns is recalculated
    based on the newly available columns and aggregation is recalculated.</p>

    <p>
        You can change the filter on primary columns using the API at all times, regardless of what columns
        (primary or secondary) are displayed in the grid.
    </p>

    <p>
        Below demonstrates the impact of changing filter on pivoting. The pivot is executed on rowData after the
        filter is complete. Notice that the last option, 'USA and Canada Equestrian' has no 'Canada' in the result
        as there is no records for Canada and Equestrian.
    </p>

    <?= example('Filtering With Pivot', 'filter', 'generated', array("enterprise" => 1)) ?>

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

    <?= example('Sorting With Pivot', 'sorting', 'generated', array("enterprise" => 1)) ?>


    <h2 id="totalPivotColumns">Total Pivot Columns</h2>
    <p>
        When in pivot mode you can also include automatically calculated total pivot columns. These total columns will use the provided
        aggregation function on the value columns to 'roll-up' each group level.
    </p>
    <p>
        Pivot column groups that contain more than one child will have a total column included. Expanding this group will reveal
        the columns that make up this total value.
    </p>

    <p>
        To turn total columns on for pivoting, set property <code>gridOption.pivotTotals=true</code>.
    </p>

    <note>
        All value columns must use the same aggregation function for the total column to make sense, otherwise the
        total column will not be included.
    </note>

    <p>
       The example below demonstrates pivot totals as follows:
    </p>
       <ul class="content">
           <li>Pivot totals added on ['sport', 'year'] columns.</li>
           <li>Expanding pivot groups reveals columns that make up totals.</li>
       </ul>

    <?= example('Total Pivot Columns', 'totals', 'generated', array("enterprise" => 1)) ?>

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

    <?= example('Saving & Restoring Column State', 'state', 'generated', array("enterprise" => 1)) ?>

    <h2>Pivot API</h2>
    
    <p>
        Below shows examples of using the pivot API directly. Use this is you want to build out your own toolPanel.
    </p>

    <p>
        The example also demonstrates exporting to CSV while using Pivot. Basically what you see inside the grid
        is what will be exported.
    </p>

    <?= example('Pivot API', 'api', 'generated', array("enterprise" => 1)) ?>

    <h2 id="orderingPivotColumns">Ordering Pivot Columns</h2>

    <p>
        The user is free to drag columns to reorder them and you are able to reorder columns via the columnApi
        in the normal way. However you may want to change the default order of the pivot columns.
    </p>

    <p>
        <b>Order of Pivot Value Column Groups</b><br/>
        Pivot value columns are the column groups created by the pivot values - eg if 'Country' is a pivot
        column, thn the Pivot Value Column Groups are 'Ireland', 'UK', etc. These columns are ordered alphabetically
        by default. To override this, provide <code>pivotComparator(a,b)</code> function in the column definition.
        See the example below for a demonstration.
    </p>

    <p>
        <b>Order of Pivot Value Columns</b><br/>
        Pivot value columns are the lowest level column and correspond to the values selected in your pivot.
        For example, if value columns are the months of the year, then the values will be 'Jan', 'Feb', 'Mar'
        etc, one for each value column added. The order of these will either be a) the order the value columns
        appear in the original column definitions if you provide 'aggFunc' as part of the columns or
        b) the order you add the columns as value columns.
    </p>

    <h2 id="manipulatingSecondaryColumns">Manipulating Secondary Columns</h2>

    <p>
        If you are not happy with the secondary columns provided by the grid, you have the opportunity to change
        any detail inside them. This is done by providing callbacks <code>processSecondaryColDef</code> and
        <code>processSecondaryColGroupDef</code>. The example below shows using these callbacks to modify the labels
        for the headers. You are free to change any of the items you can define on a column except <code>field</code>
        as the field attribute is needed by the grid to pull out the value.
    </p>

    <?= example('Secondary Columns', 'secondary-columns', 'generated', array("enterprise" => 1)) ?>

    <h2 id="hideOpenParents">Hide Open Parents</h2>

    <p>
        The example below shows mixing in different options for the row group column. For more info on these properties,
        see <a href="../javascript-grid-grouping/">Grouping Rows</a>.
    </p>
        <ul class="content">
        <li><code>groupHideOpenParents=true: </code> So that when the row group is expanded, the parent row is not
        shown.</li>
        <li><code>groupMultiAutoColumn=true: </code> So that one group column is created for each
        row group column (country and athlete)</li>
        <li><code>groupDefaultExpanded=2: </code> So that all the groups are opened by default</li>
        </ul>

    <?= example('Hide Open Parents', 'hide-open-parents', 'generated', array("enterprise" => 1)) ?>

    <h2 id="change-detection">Change Detection and Pivot</h2>

    <p>
        While pivoting, you can do delta changes to your data and have the grid reflect this
        delta changes with animations.
    </p>

    <p>
        This is demonstrated in the section on
        <a href="../javascript-grid-change-detection/#pivot-example">Pivoting with Change Detection</a>,
        so rather that repeat, check out the example there.
    </p>


<?php include '../documentation-main/documentation_footer.php';?>