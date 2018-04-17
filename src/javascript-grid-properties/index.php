<?php
$pageTitle = "ag-Grid Reference: Grid Properties";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This reference guide covers the properties that are available in the GridOptions.";
$pageKeyboards = "javascript data grid ag-Grid properties";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>
    <h1>Grid Properties</h1>

    <p class="lead">
        All of these grid properties are available through the <code>GridOptions</code> interface.
    </p>
    <h2>Columns</h2>
    <table class="table content reference">
        <tr>
            <th>columnDefs</th>
            <td>Array of <a href="../javascript-grid-column-definitions/">Column Definitions</a>.</td>
        </tr>
        <tr>
            <th>defaultColDef</th>
            <td>A <a href="../javascript-grid-column-definitions/#default-column-definitions">default column</a>
                definition.</td>
        </tr>
        <tr>
            <th>defaultColGroupDef</th>
            <td>A <a href="../javascript-grid-column-definitions/#default-column-definitions">default column group</a>
                definition. All column group definitions will use these properties. Items defined in the
                actual column group definition get precedence.</td>
        </tr>
        <tr>
            <th>enableColResize</th>
            <td>Set to true to allow <a href="../javascript-grid-resizing/">column resizing</a> by dragging the mouse
                at a columns headers edge.</td>
        </tr>
        <tr>
            <th>suppressAutoSize</th>
            <td>Suppresses <a href="../javascript-grid-resizing/#auto-size-columns">auto-sizing columns</a> for columns.
                In other words, double clicking a columns headers edge will not auto-size.</td>
        </tr>
        <tr>
            <th>autoSizePadding</th>
            <td>How many pixels to add to a column width after the <a href="../javascript-grid-resizing/#auto-size-columns">
                auto-sizing</a> calculation. The default is 4 pixels. Set this if you want to add extra room to accommodate
                (for example) sort icons, or some other dynamic nature of the header.</td>
        </tr>
        <tr>
            <th>suppressColumnMoveAnimation</th>
            <td>If true, the <code>ag-column-moving</code> class is not added to the grid while columns are moving.
                In the default <a href="../javascript-grid-styling/">themes</a>, this transpires to no animation for
                moving columns.</td>
        </tr>
        <tr>
            <th>suppressMovableColumns</th>
            <td>
                Set to true to suppress column moving. In other words, set to true to make the columns fixed position.
            </td>
        </tr>
        <tr>
            <th>suppressFieldDotNotation</th>
            <td>If true, then dots (eg <code>address.firstline</code>) in field names are not treated as deep references.
                Allows you to use dots in your field name if you prefer.</td>
        </tr>
        <tr>
            <th>unSortIcon</th>
            <td>
                Set to true to show the 'no sort' icon. See
                <a href="../javascript-grid-sorting/#example-custom-sorting">Example Custom Sorting</a>.
            </td>
        </tr>
        <tr>
            <th>suppressMultiSort</th>
            <td>Set to true to suppress multi-sort when the user shift-clicks a column header.</td>
        </tr>
        <tr>
            <th>suppressMenuHide</th>
            <td>Set to true to always show the column menu button, rather than only showing when the mouse is
                over the column header.</td>
        </tr>
        <tr>
            <th>autoGroupColumnDef</th>
            <td>Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column def is included as the first column definition in the grid. If not grouping,
                this column is not included.</td>
        </tr>
    </table>
    <h2>Sort & Filter</h2>
    <table class="table content reference">

        <tr>
            <th>enableSorting</th>
            <td>Set to true when using <a href="../javascript-grid-in-memory/">In Memory</a> Row Model to enable
                <a href="../javascript-grid-sorting/">Row Sorting</a>. Clicking a column header will cause the grid
                to sort the data.</td>
        </tr>
        <tr>
            <th>enableServerSideSorting</th>
            <td>Set to true when using <a href="../javascript-grid-in-memory/">Infinite</a>,
                <a href="../javascript-grid-in-memory/">Enterprise</a> or
                <a href="../javascript-grid-viewport/">Viewport</a> Row Models to enable
                <a href="../javascript-grid-sorting/">Row Sorting</a>. Clicking a column header will
                result in your datasource getting asked for the data again with the new sort order.</td>
        </tr>
        <tr>
            <th>enableFilter</th>
            <td>Set to true when using <a href="../javascript-grid-in-memory/">In Memory</a> Row Model to enable
                <a href="../javascript-grid-filtering/">Row Filtering</a>.</td>
        </tr>
        <tr>
            <th>enableServerSideFilter</th>
            <td>Set to true when using <a href="../javascript-grid-in-memory/">Infinite</a>,
                <a href="../javascript-grid-in-memory/">Enterprise</a> or
                <a href="../javascript-grid-viewport/">Viewport</a> Row Models to enable
                <a href="../javascript-grid-filtering/">Row Filtering</a>.
                A change in filter will result in your datasource getting asked for the
                data again with the new filter.</td>
        </tr>
        <tr>
            <th>quickFilterText</th>
            <td>Rows are filtered using this text as a <a href="../javascript-grid-filter-quick/">quick filter</a>.</td>
        </tr>
        <tr>
            <th>cacheQuickFilter</th>
            <td>Set to true to turn on the <a href="../javascript-grid-filter-quick/#quick-filter-cache">
                    quick filter cache</a>, used for a performance gain when using the quick filter.</td>
        </tr>
        <tr>
            <th>sortingOrder</th>
            <td>
                Array defining the order in which sorting occurs (if sorting is enabled). Values can be <code>asc</code>,
                <code>desc</code> or <code>null</code>. For example: <code>sortingOrder: ['asc', 'desc']</code>.
                See <a href="../javascript-grid-sorting/#example-sorting-order-and-animation">Example
                Sorting Order and Animation</a>.
            </td>
        </tr>
        <tr>
            <th>accentedSort</th>
            <td>
                Set to true to specify that the sort should take into account accented characters, if this feature is
                turned on the sort will perform slower. See
                <a href="../javascript-grid-sorting/#accentedSort">Accented Sort</a>
            </td>
        </tr>
        <tr>
            <th>multiSortKey</th>
            <td>
                Set to 'ctrl' to have multi sorting work using the Control or Command (for Apple) keys. See
                <a href="../javascript-grid-sorting/#multi-column-sorting">Multi Column Sorting</a>
            </td>
        </tr>
        <tr>
            <th>enableOldSetFilterModel</th>
            <td>Set to true to return the old set filter model format. This is intended as a temporary measure to
                facilitate migration.
                <a href="../javascript-grid-filtering/">Row Filtering</a>.</td>
        </tr>
        </table>
    <h2>Selection</h2>

    <table class="table content reference">
        <tr>
            <th>rowSelection</th>
            <td>
                Type of <a href="../javascript-grid-selection/">Row Selection</a>, set to either 'single' or 'multiple'.
            </td>
        </tr>
        <tr>
            <th>rowMultiSelectWithClick</th>
            <td>
                Set to true to allow multiple rows to be selected using single click.
                See <a href="../javascript-grid-selection/#multi-select-single-click">Multi Select Single Click</a>.
            </td>
        </tr>
        <tr>
            <th>rowDeselection</th>
            <td>If true then rows will be deselected if you hold down ctrl + click the row.</td>
        </tr>
        <tr>
            <th>suppressRowClickSelection</th>
            <td>
                If true, <a href="../javascript-grid-selection/">row selection</a>
                won't happen when rows are clicked. Use when you want checkbox selection exclusively.
            </td>
        </tr>
        <tr>
            <th>suppressCellSelection</th>
            <td>If true, cells won't be selectable. This means cells will not get keyboard focus when you
                click on them.</td>
        </tr>
        <tr>
            <th>enableRangeSelection</th>
            <td>Set to true to enable <a href="../javascript-grid-range-selection/">Range Selection</a>.</td>
        </tr>

        </table>
<h2>Row Dragging</h2>
    <table class="table content reference">
        <tr>
            <th>rowDragManaged</th>
            <td>
                Set to true to enable <a href="../javascript-grid-row-dragging/#managed-dragging">Managed Row Dragging</a>.
            </td>
        </tr>
        <tr>
            <th>suppressRowDrag</th>
            <td>
                Set to true to suppress <a href="../javascript-grid-row-dragging/">Row Dragging</a>.
            </td>
        </tr>

        </table>
<h2>Editing</h2>
    <table class="table content reference">
        <tr>
            <th>singleClickEdit</th>
            <td>Set to true to enable <a href="../javascript-grid-cell-editing/#singleClickEditing">Single
                Click Editing</a> for cells, to start editing with a single click.</td>
        </tr>
        <tr>
            <th>suppressClickEdit</th>
            <td>
                Set to true so that neither single or double click starts editing.
                See <a href="../javascript-grid-cell-editing/#singleClickEditing">Single Click, Double Click,
                    No Click Editing</a>
            </td>
        </tr>
        <tr>
            <th>enableGroupEdit</th>
            <td>
                Set to true to enable <a href="../javascript-grid-cell-editing/#groupEditing">Group Editing</a>,
                otherwise by default, row groups cannot be edited.
            </td>
        </tr>
        <tr>
            <th>editType</th>
            <td>
                Set to 'fullRow' to enable <a href="../javascript-grid-cell-editing/#fullRowEdit">Full Row Editing</a>.
                Otherwise leave blank to edit one cell at a time.
            </td>
        </tr>
        <tr>
            <th>enableCellChangeFlash</th>
            <td>Set to true to have cells flash after data changes.
                See <a href="../javascript-grid-data-update/#flashing">Flashing Data Changes</a>.</td>
        </tr>
        <tr>
            <th>stopEditingWhenGridLosesFocus</th>
            <td>
                Set this to true to <a href="../javascript-grid-cell-editing/#losingFocusStopsEditing">
                stop cell editing when grid loses focus</a>. The default is the grid stays editing
                until focus goes onto another cell. For inline (non-popup) editors only.
            </td>
        </tr>
        <tr>
            <th>enterMovesDown<br/>enterMovesDownAfterEdit</th>
            <td>
                Set both properties to true to have Excel style behaviour for the Enter key,
                i.e. <a href="../javascript-grid-cell-editing/#enter-key-down">enter key moves down</a>.
            </td>
        </tr>

        </table>
<h2>Headers</h2>
    <table class="table content reference">
        <?php include '../javascript-grid-column-header/headerHeightProperties.php' ?>
        <?php printPropertiesRowsWithHelp($headerHeightProperties) ?>

        </table>
    <h2>Row Grouping & Pivoting</h2>
    <table class="table content reference">
        <?php include '../javascript-grid-grouping/rowGroupingProperties.php' ?>
        <?php printPropertiesRowsWithHelp($rowGroupingProperties) ?>
        <tr>
            <th>pivotMode</th>
            <td>Set to true to enable pivot mode. See <a href="../javascript-grid-pivoting/">Pivoting</a>.</td>
        </tr>
        <tr>
            <th>pivotPanelShow</th>
            <td>When to show the 'pivot panel' (where you drag rows to pivot) at the top. Default
                is never. Set to either 'always' or 'onlyWhenPivoting'. Note that the pivot panel
                will never show if pivotMode is off.</td>
        </tr>
        <tr>
            <th>rememberGroupStateWhenNewData</th>
            <td>When true, if you set new data into the grid and have groups open, the grid will keep
                groups open if they exist in the new dataset.
                See <a href="../javascript-grid-grouping/#keeping-group-state">Keeping Group State</a>.</td>
        </tr>
        <tr>
            <th>suppressAggFuncInHeader</th>
            <td>When true, column headers won't include the aggFunc, eg 'sum(Bank Balance)' will
                just be 'Bank Balance'.</td>
        </tr>
        <tr>
            <th>suppressAggAtRootLevel</th>
            <td>When true, the aggregations won't be computed for root node of the grid.</td>
        </tr>
        <tr>
            <th>aggregateOnlyChangedColumns</th>
            <td>When using <a href="../javascript-grid-change-detection/#tree-path-selection">change detection</a>,
                only the updated column with get re-aggregated.</td>
        </tr>
        <tr>
            <th>functionsReadOnly</th>
            <td>If true, then row group, pivot and value aggregation will be read only from the gui. The grid will display
                what values are used for each, but will not allow the use to change the selection. See
            <a href="../javascript-grid-tool-panel/#read-only-functions">Read Only Functions</a>.</td>
        </tr>
        <tr>
            <th>aggFuncs</th>
            <td>A map of 'function name' to 'function' for custom aggregation functions.
                See example <a href="../javascript-grid-aggregation/#custom-aggregation-functions">Custom Aggregation Functions</a>.
            </td>
        </tr>
        <tr>
            <th>suppressMakeVisibleAfterUnGroup</th>
            <td>
                By default when a column is un-grouped, it is made visible. Eg on main demo: 1) group by country by dragging
                (action of moving column out of grid means column is made visible=false); then 2) un-group by clicking 'x' on
                the country column in the column drop zone, the column is then made visible=true. This property stops the
                column becoming visible again when un-grouping.
            </td>
        </tr>


        </table>
<h2>Tool Panel</h2>
    <table class="table content reference">
        <tr>
            <th>toolPanelSuppressRowGroups, toolPanelSuppressValues, toolPanelSuppressPivots, toolPanelSuppressPivotMode</th>
            <td>Set to true to hide the relevant sections in the <a href="../javascript-grid-tool-panel">Tool Panel</a>.
            See example <a href="../javascript-grid-tool-panel/#suppressExample">Suppress Panels</a></td>
        </tr>
        <tr>
            <th>showToolPanel</th>
            <td>Set to true to show the <a href="../javascript-grid-tool-panel">Tool Panel</a> by default.</td>
        </tr>
        <tr>
            <th>toolPanelSuppressSideButtons</th>
            <td>
                Set to true to hide the <a href="../javascript-grid-tool-panel">Tool Panel</a> side buttons for
                opening / closing the tool panel.
            </td>
        </tr>
        <tr>
            <th>contractColumnSelection</th>
            <td>Set to true to have column list contracted by default - only used if column groups exist.</td>
        </tr>
        <tr>
            <th>toolPanelSuppressColumnFilter</th>
            <td>Set to true to not show the 'column filter' component.</td>
        </tr>
        <tr>
            <th>toolPanelSuppressColumnSelectAll</th>
            <td>Set to true to not sure the column 'select all' component.</td>
        </tr>
        <tr>
            <th>toolPanelSuppressColumnExpandAll</th>
            <td>Set to true to not show the column 'expand all' component.</td>
        </tr>
    </table>


    <h2>Data & Row Models</h2>
    <table class="table content reference">
        <tr>
            <th>rowModelType</th>
            <td>Sets the <a href="../javascript-grid-row-models/">Row Model</a> type.
                Defaults to 'inMemory'. Valid options are [inMemory,infinite,viewport,enterprise].</td>
        </tr>
        <tr>
            <th>rowData</th>
            <td><a href="../javascript-grid-in-memory/">In Memory</a> row model only - set the data to be displayed as rows in the grid.</td>
        </tr>
        <tr>
            <th>deltaRowDataMode</th>
            <td><a href="../javascript-grid-in-memory/">In Memory</a> row model only - enables <a href="../javascript-grid-data-update/#delta-row-data">delta row data mode</a>, for compatibility with immutable stores.</td>
        </tr>
        <tr>
            <th>pinnedTopRowData</th>
            <td>Data to be displayed as <a href="../javascript-grid-row-pinning/">Pinned Top Rows</a> in the grid.</td>
        </tr>
        <tr>
            <th>pinnedBottomRowData</th>
            <td>Data to be displayed as <a href="../javascript-grid-row-pinning/">Pinned Bottom Rows</a> in the grid.</td>
        </tr>
    </table>


    <h2>Scrolling</h2>
    <table class="table content reference">
        <tr>
            <th>suppressHorizontalScroll</th>
            <td>
                Set to true to never show the horizontal scroll. This is useful if the grid is aligned with
                another grid and will scroll when the other grid scrolls. See example
                <a href="../javascript-grid-aligned-grids/#aligned-grid-as-footer">Aligned Grid as Footer</a>.
                This property does not work in Edge.
            </td>
        </tr>
        <tr>
            <th>suppressColumnVirtualisation</th>
            <td>Set to true so that the grid doesn't virtualise the columns. So if you have 100 columns, but
                only 10 visible due to scrolling, all 100 will always be rendered.</td>
        </tr>
        <tr>
            <th style="text-decoration: line-through">suppressRowVirtualisation</th>
            <td>There is no property suppressRowVirtualisation - if you want to do this, then set the rowBuffer
            property to be very large, eg 9999. But be careful, lots of rendered ros will mean a very large amount
            of rendering in the DOM which will slow things down.</td>
        </tr>
        <tr>
            <th>suppressScrollOnNewData</th>
            <td>When true, the grid will not scroll to the top when new row data is provided. Use this
            if you don't want the default behaviour of scrolling to the top every time you load new data.</td>
        </tr>
        <tr>
            <th>suppressAnimationFrame</th>
            <td>When true, the grid will not use animation frames when drawing rows while scrolling. Use this
            if the grid is working fast enough that you don't need animations frame and you don't want
            the grid to flicker.</td>
        </tr>

        </table>
<h2>Pagination</h2>
    <table class="table content reference">
        <?php include '../javascript-grid-pagination/paginationProperties.php'?>
        <?php printPropertiesRowsWithHelp($paginationProperties) ?>


        </table>
<h2>Row Block Loading: Infinite & Enterprise Row Models</h2>
    <table class="table content reference">
        <tr>
            <th>maxConcurrentDatasourceRequests</th>
            <td>How many concurrent data requests are allowed. Default is 2, so server is
            only ever hit with 2 concurrent requests.</td>
        </tr>
        <tr>
            <th>maxBlocksInCache</th>
            <td>How many pages to hold in the cache.</td>
        </tr>
        <tr>
            <th>cacheOverflowSize</th>
            <td>How many rows to seek ahead when unknown data size.</td>
        </tr>
        <tr>
            <th>infiniteInitialRowCount</th>
            <td>How many rows to initially allow scrolling to in the grid.</td>
        </tr>


        </table>
<h2>Row Model: Viewport</h2>
    <table class="table content reference">
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


        </table>
<h2>Full Width Renderers</h2>
    <table class="table content reference">
        <tr>
            <th>groupRowRenderer <br/>groupRowRendererFramework <br/>groupRowRendererParams</th>
            <td>
                Sets the <a href="../javascript-grid-cell-rendering-components">Cell Renderer</a> to use when
                <code>groupUseEntireRow=true</code>. See
                <a href="../javascript-grid-grouping/#groupingCallbacks">row grouping</a>.
            </td>
        </tr>
        <tr>
            <th>groupRowInnerRenderer<br/> groupRowInnerRendererFramework</th>
            <td>
                Sets the inner <a href="../javascript-grid-cell-rendering-components">Cell Renderer</a> to use when
                <code>groupUseEntireRow=true</code>. See
                <a href="../javascript-grid-grouping/#groupingCallbacks">row grouping</a>.
            </td>
        </tr>
        <tr>
            <th>fullWidthCellRenderer, fullWidthCellRendererFramework, fullWidthCellRendererParams</th>
            <td>Sets the <a href="../javascript-grid-cell-rendering-components">Cell Renderer</a> to use for
                <a href="../javascript-grid-full-width-rows/">Full Width Rows</a>.</td>
        </tr>

        </table>
<h2>Master Detail</h2>
    <table class="table content reference">
        <tr>
            <th>masterDetail</th>
            <td>Set to true to enable the Master Detail. See <a href="../javascript-grid-master-detail">Master Detail</a>
                for more details.
            </td>
        </tr>
        <tr>
            <th>detailCellRendererParams</th>
            <td>Specifies the params to be used by the default detail <a href="../javascript-grid-cell-rendering-components">Cell Renderer</a>.
                See <a href="../javascript-grid-master-detail">Master Detail</a> for more details.
            </td>
        </tr>

        </table>
<h2>Rendering & Styling</h2>
    <table class="table content reference">
        <tr>
            <th>icons</th>
            <td>
                <a href="../javascript-grid-icons/">Icons</a> to use inside the grid instead of the grid's default icons.
            </td>
        </tr>
        <tr>
            <th>rowHeight</th>
            <td>Default <a href="../javascript-grid-row-height/">Row Height</a> in pixels. Default is 25 pixels.</td>
        </tr>
        <tr>
            <th>animateRows</th>
            <td>Set to true to enable <a href="../javascript-grid-animation/#row-animations">Row Animation</a>.</td>
        </tr>
        <tr>
            <th>rowStyle</th>
            <td>The style to give a particular row. See <a href="../javascript-grid-row-styles/#row-style">Row Style</a>.</td>
        </tr>
        <tr>
            <th>rowClass</th>
            <td>The class to give a particular row. See <a href="../javascript-grid-row-styles/#row-class">Row Class</a>.</td>
        </tr>
        <tr>
            <th>rowClassRules</th>
            <td>Rules which can be applied to include certain CSS classes. See <a href="../javascript-grid-row-styles/#row-class-rules">Row Class Rules</a>.</td>
        </tr>

        <tr>
            <th>excelStyles</th>
            <td>The list of Excel styles to be used when <a href="../javascript-grid-excel/">exporting to Excel</a></td>
        </tr>
        <tr>
            <th>scrollbarWidth</th>
            <td>
                To tell grid how wide the scrollbar is which gets used in calculations on grid width calculations. Set
                only if using non-standard browser provided scrollbars, so the grid can use the non-standard size in
                its calculations.
            </td>
        </tr>
        </table>
<h2>Localisation</h2>
    <table class="table content reference">

        <tr>
            <th>localeText, localeTextFunc</th>
            <td>You can change the text in the paging panels and the default filters by providing a <code>localeText</code> or
                a <code>localeTextFunc</code> (see below). See <a href="../javascript-grid-internationalisation/">Internationalisation</a>.</td>
        </tr>

        </table>
    <h2>Overlays</h2>
    <table class="table content reference">
        <tr>
            <th>suppressLoadingOverlay</th>
            <td>Disables the 'loading' <a href="../javascript-grid-overlays/">overlay</a>.</td>
        </tr>
        <tr>
            <th>suppressNoRowsOverlay</th>
            <td>Disables the 'no rows' <a href="../javascript-grid-overlays/">overlay</a>.</td>
        </tr>
        <tr>
            <th>overlayLoadingTemplate</th>
            <td>
                Provide a template for 'loading' <a href="../javascript-grid-overlays/">overlay</a>
                if not happy with the provided.
            </td>
        </tr>
        <tr>
            <th>overlayNoRowsTemplate</th>
            <td>
                Provide a template for 'no rows' <a href="../javascript-grid-overlays/">overlay</a>
                if not happy with the provided.
            </td>
        </tr>

        <tr>
            <th>loadingOverlayComponent <br/>loadingOverlayComponentFramework </th>
            <td>
                Provide a custom <a href="../javascript-grid-overlay-component/#loading-overlay-interface">loading overlay component</a>.
            </td>
        </tr>

        <tr>
            <th>noRowsOverlayComponent <br/>noRowsOverlayComponentFramework </th>
            <td>
                Provide a custom <a href="../javascript-grid-overlays/#no-rows-overlay-interface">no rows overlay component</a>.
            </td>
        </tr>

        </table>
<h2>Miscellaneous</h2>
    <table class="table content reference">
        <tr>
            <th>popupParent</th>
            <td>DOM element to use as <a href="../javascript-grid-context-menu/#popup-parent">popup parent</a> for grid popups (context menu, column menu etc).</td>
        </tr>
        <?php include '../javascript-grid-value-cache/valueCacheProperties.php' ?>
        <?php printPropertiesRows($valueCacheProperties) ?>
        <tr>
            <th>defaultExportParams</th>
            <td>A default configuration object used to export to <a href="../javascript-grid-export/">csv</a> or
                <a href="../javascript-grid-excel/">excel</a></td>
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
            <td>Set to true to allow <a href="../javascript-grid-cell-expressions/#cell-expressions">cell expressions</a>.</td>
        </tr>
        <tr>
            <th>domLayout</th>
            <td>Set <a href="../javascript-grid-width-and-height/#dom-layout">domLayout</a> to
                <a href="../javascript-grid-width-and-height/#autoHeight">autoHeight</a> or
                <a href="../javascript-grid-for-print/">forPrint</a>.
                By default, grid will fit width and height of the provided
                div. Use
                <a href="../javascript-grid-width-and-height/#autoHeight">autoHeight</a>
                so that are is no vertical scrollbar and the grid auto-sizes to fit the rows.
                Use
                <a href="../javascript-grid-for-print/">forPrint</a>
                to remove both horizontal and vertical scrolls for a grid that is printer friendly.
            </td>
        </tr>

        <tr>
            <th>ensureDomOrder</th>
            <td>When true, the order of rows and columns in the dom are consistent with what is on screen.
            See <a href="../javascript-grid-accessibility/#dom-order">Accessibility - Row and Column Order</a>.</td>
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
            <th>alignedGrids</th>
            <td>A list of grids to treat as <a href="../javascript-grid-aligned-grids/">Aligned Grids</a>.
                If grids are aligned then the columns and horizontal scrolling
                will be kept in sync.</td>
        </tr>
                <tr>
            <th>suppressParentsInRowNodes</th>
            <td>
                If true, rowNodes don't get their parents set. The grid doesn't use the parent reference,
                it's included to help the client code navigate the node tree if it wants by providing bi-direction
                navigation up and down the tree. If this is a problem (eg if you need to convert the tree to JSON,
                which requires no cyclic dependencies) then set this to true.
            </td>
        </tr>
        <tr>
            <th>suppressDragLeaveHidesColumns</th>
            <td>
                If true, when you drag a column out of the grid (eg to the group zone) the column is not
                hidden.
            </td>
        </tr>
        <tr>
            <th>suppressCopyRowsToClipboard</th>
            <td>
                Set to true to only have range selection, and not row selection, copied to
                <a href="../javascript-grid-clipboard/">clipboard</a>.
            </td>
        </tr>
        <tr>
            <th>clipboardDeliminator</th>
            <td>To specify deliminator to use while copying to <a href="../javascript-grid-clipboard/">clipboard</a>.</td>
        </tr>
        <tr>
            <th>suppressFocusAfterRefresh</th>
            <td>
                Set to true to not set focus back on the grid after a refresh. This can avoid issues where you
                want to keep the focus on another part of the browser.
            </td>
        </tr>
        <tr>
            <th>layoutInterval</th>
            <td>
                The grid will check its size 500ms and lay itself out again if the size changes - such as your browser
                changes size, or your application changes the size of the div the grid live inside. If you want something
                other than 500ms, set this to a number of milliseconds. To stop the periodic layout, set it to -1.
            </td>
        </tr>
        <tr>
            <th>suppressTabbing</th>
            <td>
                Set to true to remove the grid tabbing functionality. Use this if you want to manage tabbing
                differently to what the grid provides.
            </td>
        </tr>
        <tr>
            <th>enableRtl</th>
            <td>Set to true to operate grid in <a href="../javascript-grid-rtl/">RTL (Right to Left)</a> mode.</td>
        </tr>
        <tr>
            <th>debug</th>
            <td>Set this to true to enable debug information from ag-grid and related components. Will result in
                additional logging being output, but very useful when investigating problems.</td>
        </tr>
        <tr>
            <th>context</th>
            <td>
                Provides a <a href="../javascript-grid-context/">context</a> object that is provided to different
                callbacks the grid uses. Used for passing additional information to the callbacks by your application.
            </td>
        </tr>
        <tr>
            <th>suppressContextMenu</th>
            <td>
                Set to true to not show <a href="../javascript-grid-context-menu">context menu</a>.
                Use if you don't want to use the default 'right click' context menu.
            </td>
        </tr>
        <tr>
            <th>allowContextMenuWithControlKey</th>
            <td>Allows <a href="../javascript-grid-context-menu">context menu</a> to show, even when ctrl key is held down.</td>
        </tr>
        <tr>
            <th>enableStatusBar</th>
            <td>
                When true, the <a href="../javascript-grid-status-bar">status bar</a> appear at the bottom of the
                grid when cells are selected.
            </td>
        </tr>
        <tr>
            <th>alwaysShowStatusBar</th>
            <td>When true, the <a href="../javascript-grid-status-bar">status bar</a> will always be displayed at
                the bottom of the grid, when 'enableStatusBar' is also enabled</td>
        </tr>
        <tr>
            <th>suppressTouch</th>
            <td>
                Disables <a href="../javascript-grid-touch">touch support</a> (but does not remove the browsers
                efforts to simulate mouse events on touch).
            </td>
        </tr>
        <tr>
            <th>suppressAsyncEvents</th>
            <td>
                Disables the async nature of the events introduced in v10, and makes them syncrhonous. This property
                is only introduced for the purpose of supporting legacy code which has a dependency to sync events
                in earlier versions (v9 or earlier) of ag-Grid. It is strongly recommended that you don't change
                this property unless you have legacy issues.
            </td>
        </tr>
        <tr>
            <th>suppressCsvExport</th>
            <td>
                Prevents the user to export any grid to CSV.
            </td>
        </tr>
        <tr>
            <th>suppressExcelExport</th>
            <td>
                Prevents the user to export any grid to Excel.
            </td>
        </tr>
        <tr>
            <th>batchUpdateWaitMillis</th>
            <td>
                How many milliseconds to wait before executing a
                <a href="../javascript-grid-data-update/#batch-transactions">batch of update transactions</a>.
            </td>
        </tr>
        <tr>
            <th>suppressPropertyNamesCheck</th>
            <td>
                Disables showing a warning message in the console if using a gridOptions or colDef property that doesn't
                exist.
            </td>
        </tr>
    </table>


<?php include '../documentation-main/documentation_footer.php';?>
