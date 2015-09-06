<?php
$key = "Grid Options";
$pageTitle = "Angular Grid Options";
$pageDescription = "Angular Grid Options";
$pageKeyboards = "Angular Grid Options";
include '../documentation_header.php';
?>

<div>

    <h2>Grid Options</h2>

    <p>
        Each grid needs to be provided with a set of grid options. All the possible
        parameters for the grid options are listed below with a brief description.
        Full details of the options can be found in the relevant sections.
    </p>

    <p>
        Where the value is a boolean (true or false), then false (or leave blank) is the default value.
        For this reason, on / off items are presented in such was as the most common usage is
        false, eg suppressCellSelection is worded as such as most people will want cell selection
        to be turned on.
    </p>

    <table class="table">
        <tr>
            <th>Attribute</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>columnDefs</th>
            <td>Array of Column Definitions..</td>
        </tr>
        <tr>
            <th>groupHeaders</th>
            <td>Whether to group the headers.</td>
        </tr>
        <tr>
            <th>headerHeight</th>
            <td>Height, in pixels, of the header row. If not grouping headers, default is 25. If grouping headers, default is 50.</td>
        </tr>
        <tr>
            <th>rowData</th>
            <td>Data to be displayed as rows in the table</td>
        </tr>
        <tr>
            <th>floatingTopRowData</th>
            <td>Data to be displayed as floating top rows in the table</td>
        </tr>
        <tr>
            <th>floatingBottomRowData</th>
            <td>Data to be displayed as floating bottom rows in the table</td>
        </tr>
        <tr>
            <th>rowSelection</th>
            <td>Type of row selection, set to either 'single' or 'multiple' to enable selection.</td>
        </tr>
        <tr>
            <th>rowDeselection</th>
            <td>Set to true or false. If true, then rows will be deselected if you
            hold down ctrl + click the row.</td>
        </tr>
        <tr>
            <th>pinnedColumnCount</th>
            <td>Number of columns to pin. Default is 0.</td>
        </tr>
        <tr>
            <th>rowHeight</th>
            <td>Height of rows, in pixels. Default is 25 pixels.</td>
        </tr>
        <tr>
            <th>enableColResize</th>
            <td>Set to true or false.</td>
        </tr>
        <tr>
            <th>enableSorting, enableServerSideSorting</th>
            <td>Set one of these to true to enable sorting. <i>enableSorting</i> will allow header clicks and show
                sort icons and sort within the grid. <i>enableServerSideSorting</i> will allow header clicks
                and show sort icons, but the sorting will be deferred to your datasource.</td>
        </tr>
        <tr>
            <th>enableCellExpressions</th>
            <td>Set to true to allow cells to contain expressions.</td>
        </tr>
        <tr>
            <th>unSortIcon</th>
            <td>Set to true to show the 'no sort' icon.</td>
        </tr>
        <tr>
            <th>suppressMultiSort</th>
            <td>Set to true or false. If true, shift-clicking column header doesn't multi sort.</td>
        </tr>
        <tr>
            <th>enableFilter, enableServerSideFilter</th>
            <td>Set one of these to true to enable filtering. <i>enableFilter</i> will present filters
                and do the filtering within the grid. <i>enableServerSideFilter</i> will present filters
                but defer the filtering to your datasource.</td>
        </tr>
        <tr>
            <th>quickFilterText</th>
            <td>Rows are filtered using this text as a 'quick filter'.</td>
        </tr>
        <tr>
            <th>isExternalFilterPresent()</th>
            <td>Grid calls this method to know if external filter is present.</td>
        </tr>
        <tr>
            <th>doesExternalFilterPass(node)</th>
            <td>Return true if external filter passes, otherwise false.</td>
        </tr>
        <tr>
            <th>rowClass</th>
            <td>Class to use for the row. Can be string, array of strings, or function.</td>
        </tr>
        <tr>
            <th>rowStyle</th>
            <td>An object of CSS values. Or a function returning an object of css values.</td>
        </tr>
        <tr>
            <th>angularCompileRows</th>
            <td>Whether to compile the rows for Angular. Default is false (for performance).
                Turn on if you want to use AngularJS in your custom cell renderers.</td>
        </tr>
        <tr>
            <th>angularCompileFilters</th>
            <td>Whether to compile provided custom filters. Default is false (for performance).
                Turn on if you want to use AngularJS in your custom filters.</td>
        </tr>
        <tr>
            <th>angularCompileHeaders</th>
            <td>Whether to compile the customer headers for AngularJS. Default is false (for performance).
                Turn on if you want to user AngularJS in your custom column headers.</td>
        </tr>
        <tr>
            <th>headerCellRenderer</th>
            <td>Provide a function for custom header rendering.</td>
        </tr>
        <tr>
            <th>groupKeys<br/> groupUseEntireRow<br/> groupRowInnerRenderer<br/>
                groupDefaultExpanded<br/> groupAggFields <br/> groupAggFunction<br/>
                groupSelectsChildren<br/> groupSuppressAutoColumn <br/> groupHidePivotColumns <br/> groupSuppressBlankHeader</th>
            <td>Parameters for grouping. See the section on grouping for details explanation.</td>
        </tr>
        <tr>
            <th>dontUseScrolls</th>
            <td>Set to true or false. When true, scrollbars are not used.</td>
        </tr>
        <tr>
            <th>rowSelected</th>
            <td>Function callback, gets called when a row is selected.</td>
        </tr>
        <tr>
            <th>rowClicked</th>
            <td>Function callback, gets called when a row is clicked.</td>
        </tr>
        <tr>
            <th>cellClicked</th>
            <td>Function callback, gets called when a cell is clicked.</td>
        </tr>
        <tr>
            <th>cellDoubleClicked</th>
            <td>Function callback, gets called when a cell is double clicked.</td>
        </tr>
        <tr>
            <th>cellFocused</th>
            <td>Function callback, gets called when a cell is focused.</td>
        </tr>
        <tr>
            <th>modelUpdated</th>
            <td>Function callback, gets called when displayed rows have changed. Happens following sort, filter or tree expand / collapse events.</td>
        </tr>
        <tr>
            <th>beforeSortChanged()<br/>afterSortChanged()</th>
            <td>Callbacks that get called when the sorting changes. 'before' method gets called before the grid executes the sort. 'after' method
                gets called after the grid executes the sort.</td>
        </tr>
        <tr>
            <th>filterModified()<br/>beforeFilterChanged()<br/>afterFilterChanged()</th>
            <td>Callbacks that get called when the filtering changes. 'before' method gets called before the grid executes the filter. 'after' method
                gets called after the grid executes the filter. filterModified is useful when using the Apply button.</td>
        </tr>
        <tr>
            <th>ready</th>
            <td>Function callback, gets called after Angular Grid has initialised. The name 'ready'
                was influenced by the authors time programming the Commodore 64. Use this function if,
                for example, you need to use the grid's API to fix the columns to size.</td>
        </tr>
        <tr>
            <th>suppressRowClickSelection</th>
            <td>If true, rows won't be selected when clicked. Use when you want checkbox selection exclusively.</td>
        </tr>
        <tr>
            <th>suppressCellSelection</th>
            <td>If true, cells won't be selectable. This means cells will not get keyboard focus when you
                click on them.</td>
        </tr>
        <tr>
            <th>selectionChanged()</th>
            <td>Function callback, gets called when a selection is changed.</td>
        </tr>
        <tr>
            <th>cellValueChanged()</th>
            <td>Function callback, gets called when a value has changed after editing.</td>
        </tr>
        <tr>
            <th>getRowClass()</th>
            <td>Function callback, to allow adding a css class to a row.</td>
        </tr>
        <tr>
            <th>colWidth</th>
            <td>The default width for each col. Widths specified in column definitions get preference over this.</td>
        </tr>
        <tr>
            <th>rowsAlreadyGrouped</th>
            <td>Set to true if data provided to the grid is already in node structure (this is for passing
                already aggregated data to the grid).</td>
        </tr>
        <tr>
            <th>rowsBuffer</th>
            <td>The number of rows rendered outside the scrollable viewable area the grid renders. Defaults to 20.
                Having a buffer means the grid will have rows ready to show as the user slowly scrolls vertically.</td>
        </tr>
        <tr>
            <th>showToolPanel</th>
            <td>Set to true to show the tool panel by default.</td>
        </tr>
        <tr>
            <th>toolPanelSuppressPivot</th>
            <td>Set to true to not show the values or the pivots in the tool panel. It does not make sense
                to show the values if no pivot functionality is allowed.</td>
        </tr>
        <tr>
            <th>toolPanelSuppressValues</th>
            <td>Set to true to not show the values in the tool panel. The pivot may optionally still
                be shown. This is useful when you are providing your own aggregate function.</td>
        </tr>
        <tr>
            <th>suppressScrollLag</br>isScrollLag</th>
            <td>By default, scrolling lag is enabled for Safari and Internet Explorer (to solve scrolling performance
                issues in these browsers). To override when to use scroll lag either a) set suppressScrollLag to
                true to turn off scroll lag feature alltogether, or b) return true of false from the function
                isScrollLag. This is a function, as it's expected your code will check the environment to decide
                whether to use scroll lag or not.</td>
        </tr>
        <tr>
            <th>suppressMenuHide</th>
            <td>Set to true to always show the column menu button, rather than only showing when the mouse is
                over the column header.</td>
        </tr>
        <tr>
            <th>suppressHorizontalScroll</th>
            <td>Set to true to never show the horizontal scroll. This is useful if the grid is a slave grid,
                and will scroll with a master grid.</td>
        </tr>
        <tr>
            <th>slaveGrids</th>
            <td>A list of grids to treat as slaves. If a grid is a slave, it's columns and horizontal scrolling
            will try to mirror the columns of the master.</td>
        </tr>
    </table>

</div>

<?php include '../documentation_footer.php';?>
