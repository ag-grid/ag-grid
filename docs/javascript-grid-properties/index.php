<?php
$key = "Properties";
$pageTitle = "ag-Grid Properties";
$pageDescription = "Learn how each property impacts ag-Grid.";
$pageKeyboards = "javascript data grid ag-Grid properties";
include '../documentation_header.php';
?>

<div>

    <h2>Properties</h2>

    <p>
        Below are listed all the properties of the grid. Remember you can add these properties
        as follows:
    <p>

    <h4>
        <img src="/images/javascript.png" height="20"/>
        <img src="/images/angularjs.png" height="20px"/>
        Javascript and AngularJS 1.x
    </h4>
    <p>
        Add properties to the gridOptions object.
    </p>

    <h4>
        <img src="/images/angular2.png" height="20px"/>
        AngularJS 2
    </h4>
    <p>
        Add properties to the gridOptions object, or you can also add as HTML attributes or AngularJS 2 bound properties.
    </p>

    <h4>
        <img src="/images/webComponents.png" height="20px"/>
        Web Components
    </h4>
    <p>
        Add properties to the gridOptions object, or you can also add as HTML attributes or set directly onto the DOM element.
    </p>

    <h2>List of Properties</h2>
    <table class="table">
        <tr>
            <th>Property</th>
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
            <th>groupKeys<br/> groupUseEntireRow<br/>
                groupDefaultExpanded<br/> groupAggFields <br/>
                groupSelectsChildren<br/> groupSuppressAutoColumn <br/> groupHidePivotColumns <br/> groupSuppressBlankHeader</th>
            <td>Parameters for grouping. See the section on grouping for details explanation.</td>
        </tr>
        <tr>
            <th>forPrint</th>
            <td>Set to true or false. When true, scrollbars are not used. Intention is to print the grid. Do not do this
                if you have many (more than 500??) rows as the browser will probably die.</td>
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
            <th>colWidth</th>
            <td>The default width for each col. Widths specified in column definitions get preference over this.</td>
        </tr>
        <tr>
            <th>rowClass</th>
            <td>The class to give a particular row. Provide either a string (class name) or array of string (array
                of class names). If you want a different class per row, then use the callback getRowClass(params) instead.</td>
        </tr>
        <tr>
            <th>rowStyle</th>
            <td>The style for a particular row. Provide an array of CSS key / value pairs eg {color: 'red'}.
            If you a different style per row, then use the callback getRowStyle(params) instead.</td>
        </tr>
        <tr>
            <th>rowsAlreadyGrouped</th>
            <td>Set to true if data provided to the grid is already in node structure (this is for passing
                already aggregated data to the grid).</td>
        </tr>
        <tr>
            <th>rowBuffer</th>
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
            <th>suppressScrollLag</th>
            <td>By default, scrolling lag is enabled for Safari and Internet Explorer (to solve scrolling performance
                issues in these browsers). To override when to use scroll lag either a) set suppressScrollLag to
                true to turn off scroll lag feature or b) return true of false from the function
                isScrollLag. This is a function, as it's expected your code will check the environment to decide
                whether to use scroll lag or not.</td>
        </tr>
        <tr>
            <th>suppressMenuHide</th>
            <td>Set to true to always show the column menu button, rather than only showing when the mouse is
                over the column header.</td>
        </tr>
        <tr>
            <th>suppressLoadingOverlay</th>
            <td>Disables the 'loading' overlay.</td>
        </tr>
        <tr>
            <th>suppressNoRowsOverlay</th>
            <td>Disables the 'no rows' overlay.</td>
        </tr>
        <tr>
            <th>singleClickEdit</th>
            <td>Set to true to allow editable cells to start editing with a single click.</td>
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
        <tr>
            <th>overlayLoadingTemplate</th>
            <td>Provide a template for 'loading' overlay if not happy with the provided.</td>
        </tr>
        <tr>
            <th>overlayNoRowsTemplate</th>
            <td>Provide a template for 'no rows' overlay if not happy with the provided.</td>
        </tr>

    </table>

</div>

<?php include '../documentation_footer.php';?>
