<?php
$key = "Properties";
$pageTitle = "ag-Grid Properties";
$pageDescription = "Learn how each property impacts ag-Grid.";
$pageKeyboards = "javascript data grid ag-Grid properties";
$pageGroup = "interfacing";
include '../documentation-main/documentation_header.php';
?>

    <div>
        <h2 id="properties">Properties</h2>

        <p>
            Below are listed all the properties of the grid you can add.
        <p>

        <?php if (isFrameworkJavaScript()) { ?>
            <div>
                <h4>
                    <img src="/images/javascript.png" height="20"/>
                    Javascript
                </h4>
                <p>
                Add properties to the gridOptions object.
                </p>
            </div>
        <?php } ?>

        <?php if (isFrameworkAngularJS()) { ?>
            <div>
                <h4>
                    <img src="/images/angularjs.png" height="20px"/>
                    AngularJS 1.x</span>
                </h4>
                <p>
                Add properties to the gridOptions object.
                </p>
            </div>
        <?php } ?>

        <?php if (isFrameworkReact()) { ?>
            <div>
                <h4>
                    <img src="/images/react.png" height="20px"/>
                    React
                </h4>
                <p>
                    Add properties to the gridOptions object, <b>or</b> you can also add as React props inside your JSX markup.
                </p>
            </div>
        <?php } ?>

        <?php if (isFrameworkAngular()) { ?>
            <div>
                <h4>
                    <img src="/images/angular2.png" height="20px"/>
                    Angular
                </h4>
                <p>
                    Add properties to the gridOptions object, <b>or</b> you can also add as HTML attributes or Angular bound
                    properties.
                </p>
            </div>
        <?php } ?>

        <?php if (isFrameworkVue()) { ?>
            <div>
                <h4>
                    <img src="/images/vue_large.png" height="20px"/>
                    VueJS
                </h4>
                <p>
                    Add properties to the gridOptions object, <b>or</b> you can also add as HTML attributes or VueJS bound
                    properties.
                </p>
            </div>
        <?php } ?>

        <?php if (isFrameworkWebComponents()) { ?>
            <div>
                <h4>
                    <img src="../images/webComponents.png" height="20px"/>
                    Web Components
                </h4>
                <p>
                    Add properties to the gridOptions object, <b>or</b> you can also add as HTML attributes or set directly onto the
                    DOM element.
                </p>
            </div>
        <?php } ?>

        <?php if (isFrameworkAurelia()) { ?>
            <div>
                <h4>
                    <img src="/images/aurelia.png" height="20px"/>
                    Aurelia Components
                </h4>
                <p>
                    Add properties to the gridOptions object, <b>or</b> you can also add as HTML attributes or set directly onto the
                    DOM element.
                </p>
            </div>
        <?php } ?>

    <table id="list-of-properties" class="table">
        <!-- Columns -->
        <tr>
            <th colspan="2"><h2>Columns</h2></th>
        </tr>
        <tr>
            <th>columnDefs</th>
            <td>Array of <a href="../javascript-grid-column-definitions/">Column Definitions</a>.</td>
        </tr>
        <tr>
            <th>defaultColDef</th>
            <td>A <a href="../javascript-grid-column-definitions/#defaultProperties">default column</a> definition.
                All column definitions will use these properties. Items defined in the
                actual column definition get precedence.</td>
        </tr>
        <tr>
            <th>defaultColGroupDef</th>
            <td>A <a href="../javascript-grid-column-definitions/#defaultProperties">default column group</a> definition.
                All column group definitions will use these properties. Items defined in the
                actual column group definition get precedence.</td>
        </tr>
        <tr>
            <th>enableColResize</th>
            <td>Set to true or false.</td>
        </tr>
        <tr>
            <th>suppressAutoSize</th>
            <td>If enableColResize=true suppressAutoSize and suppressAutoSize=false, then double clicking the resize
                bar in the header will not auto-size the column.</td>
        </tr>
        <tr>
            <th>autoSizePadding</th>
            <td>How many pixels to add to the column width after the autosize calculation. Default is 4px. Set this
                if you want to add extra room to accommodate (for example) sort icons, or some other dynamic nature
                of the header.</td>
        </tr>
        <tr>
            <th>suppressColumnMoveAnimation</th>
            <td>If true, the <i>ag-column-moving</i> class is not added to the grid while columns are moving.
                In the default themes, this transpires to no animation for moving columns.</td>
        </tr>
        <tr>
            <th>suppressMovableColumns</th>
            <td>If true, you cannot drag the columns to move them.</td>
        </tr>
        <tr>
            <th>suppressFieldDotNotation</th>
            <td>If true, then dots (eg address.firstline) in field names are not treated as deep references.
                Allows you to use dots in your field name if you prefer.</td>
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
            <th>colWidth</th>
            <td>The default width for each col. Widths specified in column definitions get preference over this.</td>
        </tr>
        <tr>
            <th>minColWidth</th>
            <td>The default min width for each col. Min widths specified in column definitions get preference, otherwise 20px is the default.</td>
        </tr>
        <tr>
            <th>maxColWidth</th>
            <td>The default max width for each col. Max widths specified in column definitions get preference, otherwise no max is set.</td>
        </tr>
        <tr>
            <th>suppressMenuHide</th>
            <td>Set to true to always show the column menu button, rather than only showing when the mouse is
                over the column header.</td>
        </tr>
        <tr>
            <th>suppressMenuHide</th>
            <td>Set to true to always show the column menu button, rather than only showing when the mouse is
                over the column header.</td>
        </tr>
        <tr>
            <th>groupColumnDef</th>
            <td>Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column def is included as the first column definition in the grid. If not grouping,
                this column is not included.</td>
        </tr>

        <!------------------->
        <!-- Sort & Filter -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Sort & Filter</h2></th>
        </tr>

        <tr>
            <th>enableSorting, enableServerSideSorting</th>
            <td>Set one of these to true to enable sorting. <i>enableSorting</i> will allow header clicks and show
                sort icons and sort within the grid. <i>enableServerSideSorting</i> will allow header clicks
                and show sort icons, but the sorting will be deferred to your datasource.</td>
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
            <th>sortingOrder</th>
            <td>SPL TODO</td>
        </tr>


        <!------------------->
        <!-- Selection     -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Selection</h2></th>
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
            <th>enableRangeSelection</th>
            <td>Set to true to enable range selection.</td>
        </tr>

        <!------------------->
        <!-- Editing       -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Editing</h2></th>
        </tr>
        <tr>
            <th>singleClickEdit</th>
            <td>Set to true to allow editable cells to start editing with a single click.</td>
        </tr>
        <tr>
            <th>enableGroupEdit</th>
            <td>Set to true to allow editing of the group rows.</td>
        </tr>
        <tr>
            <th>editType</th>
            <td>Set to 'fullRow' to enable full row editing. Otherwise leave blank to edit one
                cell at a time.</td>
        </tr>
        <tr>
            <th>enableCellChangeFlash</th>
            <td>Set to true to have cells flash after data changes.</td>
        </tr>
        <tr>
            <th>suppressClickEdit</th>
            <td>Se this to true so that neither single or double click starts editing. This is useful when you want to
                start the editing in another way, such as including a button in your cellRenderer.</td>
        </tr>
        <!------------------->
        <!-- Headers       -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Headers</h2></th>
        </tr>
        <tr>
            <th>headerHeight</th>
            <td>Height, in pixels, of the header row. The default is 25px. If grouping, each group row will be this height.</td>
        </tr>
        <!------------------->
        <!-- Row Grouping & Pivoting       -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Row Grouping & Pivoting</h2></th>
        </tr>
        <tr>
            <th>groupUseEntireRow<br/> groupDefaultExpanded<br/>
                groupSelectsChildren<br/> groupSelectsFiltered<br/>
                groupSuppressAutoColumn <br/> groupSuppressBlankHeader <br/>
                groupRemoveSingleChildren <br/> groupRemoveSingleChildren <br/>
                groupMultiAutoColumn
            </th>
            <td>Parameters for grouping. See the section on grouping for details explanation.</td>
        </tr>
        <tr>
            <th>groupIncludeFooter</th>
            <td>If grouping, whether to show a group footer when the group is expanded. If true, then by default, the footer
                will contain aggregate data (if any) when shown and the header will be black. When closed, the header will
                contain the aggregate data regardless of this setting (as footer is hidden anyway). This is handy for
                'total' rows, that are displayed below the data when the group is open, and alongside the group when
                it is closed.</td>
        </tr>
        <tr>
            <th>groupSuppressRow</th>
            <td>If true, the group row won't be displayed and the groups will be expanded by default
                with no ability to expand / contract the groups. Useful when you want to just 'group'
                the rows, but not add parent group row to each group.</td>
        </tr>
        <tr>
            <th>suppressUseColIdForGroups</th>
            <td>When true, the col id's are not used for values in the groups. To be used in conjunction
                with groupRowAggNodes() callback.</td>
        </tr>
        <tr>
            <th>rowGroupPanelShow</th>
            <td>When to show the 'row group panel' (where you drag rows to group)  at the top. Default
                is never. Set to either 'always' or 'onlyWhenGrouping'.</td>
        </tr>
        <tr>
            <th>pivotMode</th>
            <td>Set to true to enable pivot mode. See <a href="../javascript-grid-pivoting/">Pivoting</a> for more information.</td>
        </tr>
        <tr>
            <th>pivotPanelShow</th>
            <td>When to show the 'pivot panel' (where you drag rows to pivot) at the top. Default
                is never. Set to either 'always' or 'onlyWhenPivoting'. Note that the pivot panel
                will never show if pivotMode is off.</td>
        </tr>
        <tr>
            <th>suppressMenuColumnPanel<br/>suppressMenuFilterPanel<br/>suppressMenuMainPanel</th>
            <td>By default the enterprise menu has three panels. Set these properties to true
                to suppress one or more of these panels.</td>
        </tr>
        <tr>
            <th>rememberGroupStateWhenNewData</th>
            <td>When true, if you set new data into the grid and have groups open, the grid will keep
                groups open if they exist in the new dataset.</td>
        </tr>
        <tr>
            <th>suppressAggFuncInHeader</th>
            <td>When true, column headers won't include the aggFunc, eg 'sum(Bank Balance)' will just be 'Bank Balance'.</td>
        </tr>
        <tr>
            <th>functionsReadOnly</th>
            <td>If true, then row group, pivot and value aggregation will be read only from the gui. The grid will display
                what values are used for each, but will not allow the use to change the selection.</td>
        </tr>
        <tr>
            <th>aggFuncs</th>
            <td>Adding and clearing of aggregation functions.</td>
        </tr>
        <!------------------->
        <!-- Tool Panel -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Tool Panel</h2></th>
        </tr>
        <tr>
            <th>toolPanelSuppressRowGroups, toolPanelSuppressValues, toolPanelSuppressPivots, toolPanelSuppressPivotMode</th>
            <td>Set to true to hide the relevant sections in the tool panel.</td>
        </tr>
        <tr>
            <th>showToolPanel</th>
            <td>Set to true to show the tool panel by default.</td>
        </tr>
        <!------------------->
        <!-- Data & Row Models -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Data & Row Models</h2></th>
        </tr>

        <tr>
            <th>rowModelType</th>
            <td>Sets the row model type - enabled Virtual Scrolling, Pagination and ViewPort functionality. Defaults to 'normal'. Valid options are [pagination,virtual,viewport,normal]</td>
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
        <!------------------->
        <!-- Selection -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Selection</h2></th>
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
        <!------------------->
        <!-- Scrolling -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Scrolling</h2></th>
        </tr>
        <tr>
            <th>suppressHorizontalScroll</th>
            <td>Set to true to never show the horizontal scroll. This is useful if the grid is a slave grid,
                and will scroll with a master grid.</td>
        </tr>
        <tr>
            <th>suppressColumnVirtualisation</th>
            <td>Set to true so that the grid doesn't virtualise the columns. So if you have 100 columns, but
                only 10 visible due to scrolling, all 100 will always be rendered.</td>
        </tr>
        <tr>
            <th>suppressRowVirtualisation</th>
            <td>This is no property suppressRowVirtualisation - if you want to do this, then set the rowBuffer
            property to be very large, eg 9999.</td>
        </tr>
        <tr>
            <th>suppressScrollLag</th>
            <td>By default, scrolling lag is enabled for Safari and Internet Explorer (to solve scrolling performance
                issues in these browsers). To override when to use scroll lag either a) set suppressScrollLag to
                true to turn off scroll lag feature or b) return true of false from the function
                isScrollLag. This is a function, as it's expected your code will check the environment to decide
                whether to use scroll lag or not.</td>
        </tr>
        <!------------------->
        <!-- Row Model: Pagination -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Row Model: Pagination</h2></th>
        </tr>
        <tr>
            <th>paginationPageSize</th>
            <td>For normal paging, how many rows to show to a user at one time (ie page size).
                In virtual pagination dictates the size of the pages in the data cache. For both paging
                and virtual pagination, defines the block size the datasource is asked for data.</td>
        </tr>
        <tr>
            <th>paginationFirstPage</th>
            <td>
                The first page to use for pagination. So if you want to start on page 6, set this number
                to 5 (pages are zero indexed).
            </td>
        </tr>
        <tr>
            <th>datasource</th>
            <td>A datasource is used when using row models a) pagination and b) virtual paging. This section explains the datasource used in each fo these row models.
                See <a href="../javascript-grid-datasource/">Datasource</a> for more information.
            </td>
        </tr>
        <tr>
            <th>suppressPaginationPanel</th>
            <td>
                Set to true if you want to use pagination but NOT want to display the grids
                pagination panel. Use this if you want to provide your own GUI for pagination
                outside of the grid.
            </td>
        </tr>

        <!------------------->
        <!-- Row Model: Infinite Scrolling -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Row Model: Infinite Scrolling</h2></th>
        </tr>
        <tr>
            <th>maxConcurrentDatasourceRequests</th>
            <td>How many concurrent data requests are allowed.</td>
        </tr>
        <tr>
            <th>maxPagesInCache</th>
            <td>How many pages to hold in the cache.</td>
        </tr>
        <tr>
            <th>paginationOverflowSize</th>
            <td>How many rows to seek ahead when unknown data size.</td>
        </tr>
        <tr>
            <th>paginationInitialRowCount</th>
            <td>How many rows to initially allow scrolling to in the grid.</td>
        </tr>


        <!------------------->
        <!-- Row Model: Viewport -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Row Model: Viewport</h2></th>
        </tr>
        <tr>
            <th>viewportRowModelPageSize</th>
            <td>When using viewport row model, sets the pages size for the viewport.</td>
        </tr>
        <tr>
            <th>viewportRowModelBufferSize</th>
            <td>When using viewport row model, sets the buffer size for the viewport.</td>
        </tr>
        <tr>
            <th>viewportDatasource</th>
            <td>To use the viewportRowModel you provide the grid with a viewportDatasource. See <a href="../javascript-grid-viewport/">Viewport</a> for more information.</td>
        </tr>


        <!------------------->
        <!-- Rendering & Styling -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Rendering & Styling</h2></th>
        </tr>
        <tr>
            <th>groupRowInnerRenderer<br/> groupRowInnerRendererFramework<br/> groupRowRenderer <br/>groupRowRendererFramework <br/>groupRowRendererParams</th>
            <td>Sets grouping row cell renderer. See the section on <a href="../javascript-grid-grouping/#groupingCallbacks">row grouping</a> for detailed explanation.</td>
        </tr>
        <tr>
            <th>fullWidthCellRenderer, fullWidthCellRendererFramework, fullWidthCellRendererParams</th>
            <td>For rendering <a href="../javascript-grid-master-detail/">fullWidth</a> rows.</td>
        </tr>
        <tr>
            <th>icons</th>
            <td>ag-Grid comes with default icons that are created using SVG. You can provide your own icons for the grid to use.
                See <a href="../javascript-grid-icons/">Icons</a> for more information.</td>
        </tr>
        <tr>
            <th>rowHeight</th>
            <td>Height of rows, in pixels. Default is 25 pixels.</td>
        </tr>
        <tr>
            <th>animateRows</th>
            <td>Enable row animations by setting this to true.</td>
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
            <th>suppressRowHoverClass</th>
            <td>
                Normally the grid adds CSS class <i>ag-row-hover</i> when mouse is hovering over a row. This requires
                the grid to add hover listeners to each row which is expensive (only to be considered expensive if you
                are having performance issues, such as running on old machine with IE). Set this property to true to
                drop this feature in favour of a slight performance gain.
            </td>
        </tr>
        <tr>
            <th>excelStyles</th>
            <td>The list of Excel styles to be used when <a href="/javascript-grid-excel/">exporting to Excel</a></td>
        </tr>
        <tr>
            <th>scrollbarWidth</th>
            <td>
                To tell grid how wide the scrollbar is which gets used in calculations on grid width calculations. Set
                only if using non-standard browser provided scrollbars, so the grid can use the non-standard size in
                it's calculations.
            </td>
        </tr>
        <!------------------->
        <!-- Localisation -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Localisation</h2></th>
        </tr>
        <tr>
            <th>localeText, localeTextFunc</th>
            <td>You can change the text in the paging panels and the default filters by providing a <i>localeText</i> or
                a <i>localeTextFunc</i> (see below). See <a href="../javascript-grid-internationalisation/">Internationalisation</a> for more information. </td>
        </tr>
        <!------------------->
        <!-- Miscellaneous -->
        <!------------------->
        <tr>
            <th colspan="2"><h2>Miscellaneous</h2></th>
        </tr>
        <tr>
            <th>suppressMiddleClickScrolls</th>
            <td>If true, then middle clicks will result in 'click' events for cell and row. Otherwise the browser
                will use middle click to scroll the grid.</td>
        </tr>
        <tr>
            <th>suppressPreventDefaultOnMouseWheel</th>
            <td>If true, mouse wheel events will be passed to the browser - useful if your grid has no vertical scrolls 
                and you want the mouse to scroll the browser page.</td>
        </tr>
        <tr>
            <th>enableCellExpressions</th>
            <td>Set to true to allow cells to contain expressions.</td>
        </tr>
        <tr>
            <th>forPrint</th>
            <td>Set to true or false. When true, scrollbars are not used. Intention is to print the grid. Do not do this
                if you have many (more than 500??) rows as the browser will probably die.</td>
        </tr>

        <tr>
            <th>rowBuffer</th>
            <td>The number of rows rendered outside the scrollable viewable area the grid renders. Defaults to 20.
                Having a buffer means the grid will have rows ready to show as the user slowly scrolls vertically.</td>
        </tr>
        <tr>
            <th>suppressMovingInCss</th>
            <td>Does not apply 'ag-column-moving' class into grid when dragging columns. For the provided themes,
                this stops the animation while moving columns via dragging their headers.</td>
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
        <tr>
            <th>suppressParentsInRowNodes</th>
            <td>If true, rowNodes don't get their parents set. The grid doesn't use the parent reference,
                it's included to help the client code navigate the node tree if it wants by providing bi-direction
                navigation up and down the tree. If this is a problem (eg if you need to convert the tree to JSON,
                which requires no cyclic dependencies) then set this to true.</td>
        </tr>
        <tr>
            <th>suppressDragLeaveHidesColumns</th>
            <td>If true, when you drag a column out of the grid (eg to the group zone) the column is not
                hidden.</td>
        </tr>
        <tr>
            <th>suppressCopyRowsToClipboard</th>
            <td>Set to true to only have range selection, and not row selection, copied to clipboard.</td>
        </tr>
        <tr>
            <th>suppressFocusAfterRefresh</th>
            <td>Set to true to not set focus back on the grid after a refresh. This can avoid issues where you
                want to keep the focus on another part of the browser.</td>
        </tr>

        <tr>
            <th>layoutInterval</th>
            <td>The grid will check it's size 500ms and lay itself out again if the size changes - such as your browser
                changes size, or your application changes the size of the div the grid live inside. If you want something
                other than 500ms, set this to a number of milliseconds. To stop the periodic layout, set it to -1.</td>
        </tr>
        <tr>
            <th>suppressTabbing</th>
            <td>Set to true to remove the grid tabbing functionality. Use this if you want to manage tabbing
                differently to what the grid provides..</td>
        </tr>
        <tr>
            <th>enableRtl</th>
            <td>Set to true to operate grid in RTL (Right to Left) mode.</td>
        </tr>
        <tr>
            <th>debug</th>
            <td>Set this to true to enable debug information from ag-grid and related components. Will result in
                additional logging being output, but very useful when investigating problems.</td>
        </tr>

        <tr>
            <th>context</th>
            <td>Provides a context which can be used when rendering, setting row height, filtering and so on.</td>
        </tr>
        <tr>
            <th>suppressContextMenu</th>
            <td>Set to true to not show context menu. Use if you don't want to use the default 'right click' context menu.</td>
        </tr>
        <tr>
            <th>suppressEnterprise</th>
            <td>Turn off enterprise features. This is used by ag-Grid testers, mentioned
                here in case someone is looking at the code and wondering.</td>
        </tr>
        <tr>
            <th>enableStatusBar</th>
            <td>When true, the status bar will be displayed at the bottom of the grid.</td>
        </tr>
        <tr>
            <th>suppressTouch</th>
            <td>Disables touch support (but does not remove the browsers efforts to simulate mouse events on touch).</td>
        </tr>
    </table>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
