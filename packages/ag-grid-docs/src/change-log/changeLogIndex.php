<?php
$pageTitle = "ag-Grid: Change Log for Releases";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page lists all the Changes completed in recent releases.";
$pageKeyboards = "ag-Grid Change Log";
$pageGroup = "misc";
include('../includes/mediaHeader.php');
?>

<div id="content">

    <note>
        For a detailed breakdown of items please refer to the detailed pipeline <a href="../ag-grid-pipeline/">here</a>.
    </note>

    <h3>Version 16.0.0 [25-JAN-2018]</h3>
    <p>For details of this release, check our dedicated <a href="../ag-grid-blog-16-0-0/">blog post for v16.0.0</a>.</p>
    <h4>Enhancements</h4>
    <ul>
        <li>
            AG-116: Allow row drag and drop </li>
        <li>
            AG-1397: Add example on how to add a dynamic component into a cell </li>
        <li>
            AG-1435: Maintain cell focus on data updates </li>
        <li>
            AG-1419: Allow quickfilter to work with tree data </li>
        <li>
            AG-1400: Allow moving of group auto-column </li>
        <li>
            AG-1388: Support for Enter to commit changes to cell and to navigate to the next row </li>
        <li>
            AG-1338: Use Value Formatter with Tooltips </li>
        <li>
            AG-1208: Make setFilter mini search case insensitive </li>
        <li>
            AG-1382: Allow the detail grid of master detail to be defined with callback </li>
        <li>
            AG-1194: Add double click = expand/collapse column group </li>
        <li>
            AG-1390: Row drag icon needs better graphic design </li>
        <li>
            AG-1384: Create cellStyleParams interface as per https://www.ag-grid.com/javascript-grid-cell-styles </li>
        <li>
            AG-1191: Show context menu when the user right clicks on the header </li>
        <li>
            AG-1285: Allow disabling ctrl to add cells to a currently existing range </li>
        <li>
            AG-1206: Add source information in the column events so that the user knows where the event came from ie From reset columns button </li>
        <li>
            AG-1119: Add api call to hideContextMenu </li>
        <li>
            AG-818: Add better support/consistency for addIndex </li>
        <li>
            AG-514: Allow columns to be fixed so they can not be moved from their configured position </li>
        <li>
            AG-128: Add suppressHidden and suppressPinning to ColDefs </li>
    </ul>
    <h4>Bugs</h4>
    <ul>
        <li>
            AG-1186: Using font icons in a renderer in chrome causes them to not be repainted when resizing the column </li>
        <li>
            AG-1068: Ipad - Safari/Chrome Csv Export doesn't work </li>
        <li>
            AG-1439: Fix issue creating detail row in master/detail with react </li>
        <li>
            AG-1434: Fix page message when no rows are present when using pagination. Shows 1 of 0 </li>
        <li>
            AG-1431: "Ctrl & A" does not select pinned bottom rows correctly </li>
        <li>
            AG-1422: Overlay blocks mouse pointers events in IE10 </li>
        <li>
            AG-1421: new property popupParent - so popups (eg menu) don't get clipped into grid </li>
        <li>
            AG-1392: getBusinessKeyForNode should sanitise input </li>
        <li>
            AG-1374: innerRendererFramework doesn't work in the group column for the master grid in a master/detail configuration </li>
        <li>
            AG-1373: Can't nest a framework detail grid in a master detail grid. [ag-Grid: unable to find bean reference agGridReact while initialising frameworkComponentWrapper] </li>
        <li>
            AG-1368: Cell focus should not get darker when browser focus is lost </li>
        <li>
            AG-1362: columnVisibleChange triggered when column is moved independently if it is visibility changes </li>
        <li>
            AG-1361: Header Group Columns are not getting "ag-header-group-cell-moving" CSS class while being dragged&dropped </li>
        <li>
            AG-1351: New components naming not backward compatible when using floating filters (filter: 'date' or filter:'text') </li>
        <li>
            AG-1345: Number filter defaultOption: "notEqual" not working </li>
        <li>
            AG-1342: When press Tab while editing, grid checks "editable" callback of next cell before current cell applied </li>
        <li>
            AG-1339: Home/End keys not working in Windows10 </li>
        <li>
            AG-1333: getNodeId makes the row render incorrectly if returning partial HTML </li>
        <li>
            AG-1283: Cannot override default components with framework components, only with plain JS ones </li>
        <li>
            AG-1279: In range date filter breaks if the data contains null dates </li>
        <li>
            AG-1278: deprecated api.recomputeAggregates(), use api.api.refreshInMemoryRowModel('aggregate') instead </li>
        <li>
            AG-1273: Pagination + Grouping + Enterprise when expanding a group rows bubble up unexpectedly </li>
        <li>
            AG-1272: Null pointer exception when trying to save the state of the columns and the passed state is null </li>
        <li>
            AG-1258: Have consistent behaviour for indeterminate checkbox across selection and set filter </li>
        <li>
            AG-1243: IE Edge issue on colum nenu/columns clicking on the column label is good, clicking on checkbox closes the menu </li>
        <li>
            AG-1181: No rows overlay displayed when col defs are supplied after row data </li>
        <li>
            AG-1171: setFilterModel is ignored in an async Filter until the async is resolved </li>
        <li>
            AG-1166: Inconsistent timing when calling gridReady/ngAfterViewInit in Angular </li>
        <li>
            AG-1134: Remove cyclic dependency - Calling setFocusedCell from within onCellValueChanged causes an infinite loop </li>
        <li>
            AG-1120: Dragging an ungrouped column by its group shows empty hint </li>
        <li>
            AG-958: On mobile devices - Hiding/Showing columns through the column menu doesn't work </li>
        <li>
            AG-831: [enterprise row model] Quickly expanding group node doesn't resolve loading </li>
        <li>
            AG-798: [drag event] dragStopped gets called when clcking on a cell </li>
        <li>
            AG-663: [react headerComponent drag&drop] Cannot drag & drop header with a custom component into the row groups by </li>
        <li>
            AG-608: Default sort is not passed to getRows with 'infinite' rowModelType in AngularJS 1.x </li>
    </ul>

    <h2>15.x</h2>

    <h3>Version 15.0.0 [13-DEC-2017]</h3>
    <p>For details of this release, check our dedicated <a href="../ag-grid-blog-15-0-0/">blog post for v15.0.0</a>.</p>
    <h4>Enhancements</h4>
    <ul>
        <li>
            AG-1032/661: Allowing <a href="../javascript-grid-components">registering components by name</a> and renaming all componets to add ag namespace to it
        </li>
        <li>
            AG-76: Adding <a href="../javascript-grid-overlay-component">overlays as a new component</a> into the grid, so now they are fully customisable
        </li>
        <li>
            AG-46: Allowing the ability to tab from outside the grid into the grid
        </li>
    </ul>
    <h4>Bugs</h4>
    <ul>
        <li>
            AG-1161: Issue using ag-fresh and auto group column defs - No padding in the auto group col def
        </li>
        <li>
            AG-1188: Can't use detailCellRendererFramework. Metadata not provided!
        </li>
        <li>
            AG-1127: richSelect editor broken
        </li>
        <li>
            AG-1262: Formatted values ignored for leaf nodes using Tree Data
        </li>
        <li>
            AG-1223: Tree Data, delta update ON + change that causes node to go to a different PATH AND name change not
            working
        </li>
        <li>
            AG-1219: $cell-horizontal-padding not working with material Theme
        </li>
        <li>
            AG-1212: ensureNodeVisible non-backward compatible behaviour
        </li>
        <li>
            AG-1169: Key creator not working on pivot mode
        </li>
        <li>
            AG-1156: afterGuiAttached not called anymore after a filter is rendered in the screen
        </li>
        <li>
            AG-1141: Consistency of notEqual and notEquals in FilterParams.filterOptions, defaultOptions, nullComparator
        </li>
        <li>
            AG-1140: Filter, when specifying both filterOptions and defaultOption, default option is ignored and the
            first item is picked
        </li>
        <li>
            AG-1064: Set filter not rebuilt after delta upated
        </li>
        <li>
            AG-799: [enterprise row model] purgeEnterpriseCache render problem
        </li>
        <li>
            AG-660: pinned rows - startEditingCell doesn't work with pinned rows
        </li>
        <li>
            AG-596: [menu] Context menu event not firing on full width group rows
        </li>
        <li>
            AG-580: [pinned columns] Spurious ColumnPinned events raised
        </li>
        <li>
            AG-419: [tabbing] tabbing into the grid goes into the wrong cell
        </li>
        <li>
            AG-1259: Example broken - file explorer has no padding on grouping
        </li>
        <li>
            AG-1257: Column menu on non enterprise version has padding on the top in 14.2 not in 14.1
        </li>
        <li>
            AG-1250: Regression issue - Chart example doesn't work anymore
        </li>
        <li>
            AG-1248: Fix broken examples in the docs pre Christmas release
        </li>
        <li>
            AG-1233: When editing a cell in pinned row which is on the edge of the hor scroll it breaks the scrolling
        </li>
        <li>
            AG-1227: Rich Select was not allowing editorParams.cellRendererFramework
        </li>
        <li>
            AG-1209: Wrong deprecated error message when using refreshView - Points to refreshRows, should say
            refreshCelss
        </li>
        <li>
            AG-1200: iOs double click doesn't make a cell enter in edit mode, but zooms in
        </li>
        <li>
            AG-1197: Setting floatingFilterComponentParams for column cause removing styles from header
        </li>
        <li>
            AG-1164: When there are checkboxes enabled and you open the context menu. Clicking on the checkboxes don't
            close the popup
        </li>
        <li>
            AG-1162: ensureDomOrder: true seems to not work when pinning more than one column (for the column order in
            the pinning section)
        </li>
        <li>
            AG-1133: processRowPostCreate getting called to often, sometimes without the div's in place
        </li>
        <li>
            AG-1125: Context menu not working for cells in ipad (easy to repro)
        </li>
        <li>
            AG-1124: Error opening set filter in infinite scrolling
        </li>
        <li>
            AG-1081: Api.doLayout does not refresh columns after setColumnDef if following steps in Desc
        </li>
        <li>
            AG-1076: row-index not getting updated and containing dupes after group expand
        </li>
        <li>
            AG-1074: Set Filter wrong behaviour when changing values underneath it via editing and selecting deselecting
            all from filter
        </li>
        <li>
            AG-1065: Bug with groupRemoveSingleChildren = false, groupRemoveLowestSingleChildren= true AND
            groupDefaultExpanded: 1
        </li>
        <li>
            AG-1033: 'In Range' filter issue
        </li>
        <li>
            AG-955: Checkbox is unchecked after scrolling fast with infinite scrolling
        </li>
        <li>
            AG-940: When using animateCellRenderer, and the values are updated, the tooltip is not updated. Also tooltip
            for nullables seems to be broken (not displayed)
        </li>
        <li>
            AG-888: [events] Can't remove event listeners
        </li>
        <li>
            AG-819: export - CSV Creator issue in IE10
        </li>
        <li>
            AG-796: [column filter] Ignore debounce when using apply button
        </li>
        <li>
            AG-702: [auto height] scrolling does not work if 'autoHeight' and pinned columns are used together
        </li>
        <li>
            AG-692: [full row editing] Enter on a non editable cell starts editing, but it does not end it
        </li>
        <li>
            AG-637: [printable character] Missing backslash means \ is not a printable character
        </li>
        <li>
            AG-589: [range] Pressing tab while selecting a range throws an error
        </li>
        <li>
            AG-1078: Issue with formatter + getter + complex object + auto group col def
        </li>
        <li>
            AG-857: [headers] HeaderName='' doesn't work for autogroupcolumns
        </li>
        <li>
            AG-605: [edit] Ctrl-Enter resets cell editor to blank
        </li>
        <li>
            AG-330: [iPad] hamburger occasionally appears but cannot be clicked
        </li>
        <li>
            AG-1035: Issue displaying context menu in the enterprise row model
        </li>
    </ul>
    <h4>Deprecations</h4>

    <ul>
        <li>Renamed old component names to <a href="../javascript-grid-components">new namedspace components</a>
        </li>
    </ul>

    <h4>Breaking changes</h4>

    <ul>
        <li>Removed deprecated items with old way of doing header templates as new way of providing header templates was
            introduced in v14.
            Removed grid options are getHeaderCellTemplate, headerCellTemplate, headerCellRenderer.
            Removed column options are headerCellTemplate and headerCellRenderer
        </li>
    </ul>

    <h2>14.x</h2>

    <h3>Version 14.2.0 [16-NOV-2017]</h3>

    <p>For details of this release, check our dedicated <a href="../ag-grid-blog-14-2-0/">blog post for v14.2.0</a>.</p>

    <h4>Enhancements</h4>
    <ul>

        <li>AG-897: Master/Detail. New streamlined and simplifed offering, allowing for much easier <a
                    href="../javascript-grid-master-detail/">Master/Detail</a>.
        </li>
        <li>AG-530: Implement React declarative offering. Allow Grid & Column definitions to be entirely in markup.</li>
        <li>AG-891: Themes. Bring all legacy themes in line with new Material theme.</li>
    </ul>

    <h4>Bug Fixes</h4>
    <ul>
        <li>AG-1094: Fix an issue where async set filters wouldn’t work with the enterprise row model</li>
        <li>AG-1047: Keep row group after delta updates is broken when using groups</li>
        <li>AG-993: State not preserved when row grouping and data transactions</li>
        <li>AG-1098: Angular 1 Issue with filters</li>
        <li>AG-1056: Issue with enterprise row model and null categories</li>
        <li>AG-997: suppressAnimationFrame with col pinning scrolling issue when using arrow up/down</li>
        <li>AG-944: domLayout:autoHeight not working when autoGroupColumn and the group column in pinned left</li>
    </ul>

    <h3>Version 14.1.0 [07-NOV-2017]</h3>
    <h4>Enhancements</h4>
    <ul>
        <li>AG-895: Angular 5 supported. Now you can use ag-grid with the latest angular version!</li>
    </ul>

    <h4>Bug Fixes</h4>
    <ul>
        <li>AG-1010: Fix an issue where Polymer would not work in Firefox</li>
    </ul>

    <h3>Version 14.0.0 [02-NOV-2017]</h3>

    <p>For details of this release, check our dedicated <a href="../change-log/v14/index.php">blog post for v14 aka
            Halloween</a>.</p>

    <h4>Enhancements</h4>
    <ul>
        <li>AG-459: Revamped Feature: <a href="../javascript-grid-tree-data/">Tree Data</a>, we have rewritten tree data
            to make it more powerful and easy to use.
        </li>
        <li>AG-459: <a href="../javascript-grid-grouping/#example-unbalanced-groups">Unbalanced Grouping</a>. We now
            show as leaf rows that are part of a group but their grouping key is null.
        </li>
        <li>AG-875: If you are a React fan, then you will be excited to lean that ag-Grid v14 comes with full support
            for Asynchronous Components
        </li>
        <li>AG-544: You can now provide <a href="../javascript-grid-column-header/#header-template">custom HTML
                templates</a> to customise how the column headers look.
        </li>
        <li>AG-804: Set filters can now have their values specified <a
                    href="../javascript-grid-filter-set/#example-callback-async">asynchronously</a></li>
        <li>AG-816: More options for <a href="../javascript-grid-grouping/">grouping</a> with groupRemoveSingleChildren.
        </li>
        <li>AG-744: Delta updates now maintain row order.</li>
    </ul>

    <h4>Bug Fixes</h4>
    <ul>
        <li>AG-910: New component editor uses mergeDeep - causes stack overflow when certain observables are used</li>
        <li>AG-946: Improve memory usage of vue vs js</li>
        <li>AG-884: [excel] DateType were restricted to String and Number, added Boolean DateTime and Error</li>
        <li>AG-901: [regression] SetFilter not displaying (Blanks) anymore for null values</li>
        <li>AG-878: [master detail] Error raised in detail panel when using Cell Editors</li>
        <li>AG-864: Sanitise Data in tooltip and cellRenderer</li>
        <li>AG-855: Grids fail on ie11 when dealing with tree data</li>
        <li>AG-820: [column types] - numericColumn not working</li>
        <li>AG-817: [cellEditor richSelect] cellEditorParams.values nulls and blanks are not handled well</li>
        <li>AG-778: [frameworks] Aurelia - Add pinnedRowCellRenderer support</li>
        <li>AG-777: [aurelia] Add dateComponent support</li>
        <li>AG-772: Polymer CLI - PolymerFrameworkFactory is not defined</li>
        <li>AG-882: [Copy&Paste] Copying Blank Cells not working</li>
        <li>AG-924: If context menu very long, overflow entries are clipped</li>
        <li>AG-921: ensureRowIndex/Node "middle" not working</li>
        <li>AG-914: Status bar is not styled in new material theme</li>
        <li>AG-874: Declarative column def does not match properties from ag-grid</li>
        <li>AG-872: [grouping] - Group count info lost when reducing column's size</li>
        <li>AG-850: with material theme, on the tool panel, in the values section (when you drag a column to aggregate),
            the background is transparent
        </li>
        <li>AG-849: on set filter in material theme, if label is to large, we get it onto the other line</li>
        <li>AG-672: [navigation] Navigating with arrows does not skip the columns marked with "suppressNavigable"</li>
        <li>AG-433: [navigation] Keyboard Navigation Problems - home & end</li>
        <li>AG-311: [keyboard navigation] bug in wide columns</li>
        <li>AG-925: Empty cells retain old cell value tooltip</li>
        <li>AG-913: getSelectedRowNodes sometimes returns an empty array when it shouldn't</li>
        <li>AG-935: [material] checkboxes are too dense on main demo</li>
        <li>AG-934: [material] aggregation function select popup is not styled</li>
        <li>AG-770: Pinned row data was not getting bound to React correctly/li>
    </ul>

    <h2>13.3.x</h2>
    <h3>Version 13.3.1 [04-OCT-2017]</h3>
    <h4>Enhancements</h4>
    <li>AG-851: Added support for React 16</li>
    <li>AG-698: Added support for <a href="../javascript-grid-row-styles">row class rules</a></li>
    <li>AG-754: The <a href="../javascript-grid-icons">floating filter icon</a> now can be configured.</li>
    <li>AG-776: Aurelia now supports <a href="../javascript-grid-header-rendering">header components and header group
            components</a>.
    </li>
    <li>AG-815: <a href="../javascript-grid-api#scrolling">Grid Api for scrolling</a> has been improved so that
        <code>api.ensureNodeVisible</code> and <code>api.ensureIndexVisible</code> now take an optional
        second parameter to specify where the node/index should be positioned on the screen. The valid values are:
        <code>top</code>, <code>middle</code> and <code>bottom</code>. If not specified, would not scroll into the
        row if already visible in the current viewport.
    </li>
    <ul>
    </ul>

    <h4>Bug Fixes</h4>
    <li>AG-862: Double clicking a group cell was not expanding the group</li>
    <li>AG-861: Fixed issue with expandAll when using <code>hideOpenParents:true</code></li>
    <li>AG-759: Clear button does not work well when also providing filterOptions</li>
    <li>AG-547: Set filter tristate was not working</li>
    <li>AG-842: Fix issue with autosize for the columns and the new matherial theme</li>
    <li>AG-829: Fix error in CellComp.prototype.stopEditing in certain cases</li>
    <li>AG-406: Fix issue on touch devices where sub menus and custom menu items wouldn't work.</li>
    <ul>
    </ul>

    <h2>13.2.x</h2>
    <h3>Version 13.2.0 [21-SEP-2017]</h3>

    <h4>Enhancements</h4>
    <ul>
        <li>
            AG-785: Pivoting is now possible in the <a href="../javascript-grid-enterprise-model/">Enterprise Row
                Model</a>.
            If you are using the row model and do not want pivoting, then set grid properties
            <code>toolPanelSuppressPivotMode=true</code> and <code>toolPanelSuppressValues=true</code> to remove the
            pivot
            from the grid UI.
        </li>
        <li>AG-795: New callback <code>paginationNumberFormatter</code> to format numbers in pagination panel, should
            you
            no like the default formatting. See
            <a href="../javascript-grid-pagination/#customising-pagination">Example: Customising Pagination</a>.
        </li>
        <li>
            AG-693: <a href="../javascript-grid-enterprise-model/#child-count">Child Count</a> can now be set for
            Enterprise Row Model.
        </li>
        <li>
            AG-800: Put in callback <a href="../javascript-grid-cell-editor/#suppress-keyboard-event">colDef.suppressKeyboardEvent()</a>
            to allow suppressing keyboard events while editing.
        </li>
    </ul>

    <h4>Bug Fixes</h4>
    <ul>
        <li>AG-770: pinnedBottomRowData and pinnedTopRowData were not getting changes updated when bound as component
            property (eg if using React or Angular bindings to change these)
        </li>
        <li>AG-667: unnecessary console log "not supported" when using infinite row model and scrolling after cell
            selection
        </li>
        <li>AG-400: rich select - when focus goes off the component, the selection was kept</li>
        <li>AG-563: When sorting by count in pivot mode it does Alphabetical sort not numerical</li>
        <li>AG-793: Group expand / contract was not working with double click, now it opens and closes quickly</li>
        <li>AG-649: Configuring checkbox icons was not getting applied when icons set at the column def level (ie
            colDef.checkboxSelection=true and colDef.icons = {customIcons})
        </li>
        <li>AG-622: Copy Paste with Master Detail Grid was not working</li>
    </ul>

    <h2>Version 13.1.x</h2>
    <h3>Version 13.1.2 [11-SEP-2017]</h3>
    <h4>Bug Fixes</h4>
    <ul>
        <li>AG-764: fix bug introduced in 13.1 that breaks aurelia cell renderers.</li>
        <li>AG-761: make suppressExcelExport and suppressCsvExport optional properties.</li>
        <li>AG-755: innerRendererFramework does not use framework to render leaf nodes in tree data</li>
        <li>AG-755: fontName property for Excel Export was being ignored</li>
        <li>AG-755: when using 'aligned grids', removed infinite loop on horizontal scroll</li>
        <li>AG-756: column virtualisation and full row edit were not working with each other, as user scrolled, newly
            created cells were not editable.
        </li>
        <li>AG-760: tabbing to next row when, when next cell was not virtualised (due to column virtualisation) was
            failing
        </li>
    </ul>

    <h3>Version 13.1.1 [08-SEP-2017]</h3>
    <h4>Bug Fixes</h4>
    <ul>
        <li>AG-746: fixing bug where an error is thrown if a renderer returns something other than a string or a Dom
            Element
        </li>
        <li>AG-379: fixing bug where function names where not translated in the tool panel or generated columns</li>
        <li>AG-683/411: fixing bug where floating filters wouldn't get redrawn if showing/hiding columns from the tool
            panel
        </li>
        <li>AG-473: fixing bug where the context menu wouldn't appear in the pinned are if there were no rows to show
        </li>
        <li>AG-738: pinning columns by dragging mouse to edge was broke</li>
        <li>AG-739: event columnGroupOpened had reference to column rather than the original column group</li>
        <li>AG-729: ag-row-focus CSS class was getting added to every row</li>
        <li>AG-743: aligned grids was not working in Firefox</li>
    </ul>

    <h4>Enhancements</h4>
    <ul>
        <li>
            Grid callback <code>getDocument()</code> now used for adding clicks to background for closing popups,
            useful if you don't want to use the standard documents.body (for people using non-standard browsers to GWT
            embedded)
        </li>
        <li>AG-313 excel and csv export now by setting to true the properties <code>suppressCsvExport</code> <code>suppressExcelExport</code>.
        </li>
        <li>AG-669 excel export now has a property <code>sheetName</code> that allows to configure the name of the
            generated Excel sheet.
        </li>
        <li>AG-749 headerName is now optional in the columnDef, if your provide a field the name would be derived from
            the field name
        </li>
        <li>AG-737 the menu items 'expand all' and 'contract all' now only appear for InMemoryRowModel</li>
        <li>AG-651: allow saving / restoring col group 'open/closed' state</li>
    </ul>


    <h3>Version 13.1.0 [01-SEP-2017]</h3>
    <h4>Revert of Breaking Change</h4>

    <ul>
        <li>
            <p>
                In v13.0 we introduced the method <code>afterGuiAttached()</code> for the cell renderers. The purpose of
                this was to allow
                cell renderers to be created before the DOM existed which gave a marginal performance boost. This has
                caused
                issues for frameworks like React and Angular (which sometimes need the parent DOM element to exist
                before the
                component is created). For this reason we have reverted back to how things worked prior to v13.0.
            </p>
            <p>
                So in summary, v13.0 introduced <code>afterGuiAttached()</code>, v13.1 takes
                <code>afterGuiAttached()</code> back out.
            </p>
        </li>
    </ul>

    <h4>Bug Fixes</h4>

    <ul>
        <li>AG-721: When in pivot, it was possible open level groups via API or via double clicking. Bottom level groups
            in pivot should be locked closed.
        </li>
        <li>AG-597: Preserve grouped column order after dragging to new position</li>
        <li>AG-620: Retain hidden columns when group moved</li>
        <li>AG-733: resolved an issue with react+redux where the store was not injected</li>
    </ul>

    <h2>Version 13.0.x</h2>

    <h3>Version 13.0.1 [29-AUG-2017]</h3>

    <h4>Bug Fixes</h4>
    <ul>
        <li>AG-711: blank cells with no defined cell renderer were causing error</li>
        <li>AG-709: column header attribute was colId instead of col-id</li>
        <li>AG-706: rows were not rendering sometimes when cellRenderer was not returning back true 'object' or string
        </li>
        <li>AG-705: angular 1 cells were not getting compiled</li>
        <li>AG-710: Fixed an issues where drag and drop did not work as expected in ag-grid-react</li>
        <li>AG-712: Fixed an issue with headers no longer displaying ellipsis (&hellip;) when too narrow.</li>
        <li>AG-708: The themes are shipped without minifictation for easier debugging.</li>
        <li>AG-707: Fixed an issue introduced with new SVG icons - some of the icons passed through the <code>gridOptions</code>
            stopped working
        </li>
        <li>AG-714: Fixed an issue a column with a <code>cellRenderer='group'</code> and with an innerRenderer was not
            using the innerRenderer when displayed as a leaf cell
        </li>
    </ul>

    <h3>Version 13.0.0 [25-AUG-2017]</h3>

    <h4>Enhancements</h4>
    <ul>
        <li>
            New rendering engine - now the grid works blazing fast, even on IE9 and IE10! Our tests show the grid
            work 6 times faster. One better browsers (Chrome etc) you will notice the scrolling much smoother.
        </li>
        <li>
            New material design theme (go to our <a href="../example.php">Main Demo</a> and select the material
            theme). This is our first step towards modernising all our themes.
        </li>
        <li>New SVG icons for all the themes. This is in line with industry best practices.
            The previous ones are available in the <code>src/styles/legacy</code> directory - you can <a
                    href="https://www.ag-grid.com/javascript-grid-icons/">set them back through the API</a>.
        </li>
        <li>AG-664: Added support for <a href="../javascript-grid-reference-data/">Reference Data</a> to manage
            key / value pairs inside data.
        </li>
        <li>
            <code>suppressScrollLag</code> and <code>isScrollLag</code> no longer used. The new rendering engine
            doesn't need them due to how it uses animation frames.
        </li>
        <li>AG-685: Number and Date filter have an option to configure what to do when filtering <code>null</code>
            values.
            See: <a href="../javascript-grid-filtering#nullFiltering">Null filtering</a></li>
        <li>AG-579: Excel an CSV export now works in all row models. If exporting outside of the Client-side Row Model
            Only the data loaded for the currently displayed grid gets exported.
        </li>
        <li>The event 'itemsAdded' didn't make sense any more since introducing transaction updates in v11. So now the
            grid fires rowDataUpdated instead.
        </li>
        <li>AG-695: The 'type' property on a ColDef now supports an array of column type keys</li>
        <li>AG-634: <a href="../javascript-grid-filter-text">Text filter</a> has the parameter
            <code>caseSensitive</code>.
        </li>
        <li>AG-679: Improved error handling when Column Types are not correctly configured</li>
    </ul>

    <h4>Bug Fixes</h4>
    <ul>
        <li>The HTML attribute 'row' on the row div was showing the index. It was supposed to be the row. Also row-id
            was
            showing the business key. To avoid confusion, move everything to dash-case (not CamelCase), the following
            are now the attributes:
            <ul>
                <li>row-id - matches the row node id.</li>
                <li>row-index - matches the row index (0..n, or t0..tn for pinned top rows and b0..bn for pinned bottom
                    rows).
                </li>
                <li>row-business-key - matches the business key (if user implements callback getBusinessKey())</li>
            </ul>
            Similarly colId on the cell is now col-id. These fixes / breaking changes only impact your code if you were
            using these in CSS selectors outside of the grid.
        </li>
        <li>AG-697: Fixed an issue where export group headers was not working correctly when more than 2 groups of
            headers
        </li>
        <li>AG-696: Fixed issue where column groups kept expand / collapse icons even when group is no longer
            expandable
        </li>
        <li>AG-654: Fixed issue with pinning rows when pivoting</li>
        <li>AG-615: Fixed issue when moving column groups with marry children</li>
        <li>AG-380: Fixed an issue when using a framework like angular/react... cellRendererFramework in a column was
            not considered
            when grouping by that column
        </li>
        <li>AG-253: Support for innnerRendererFramework</li>
        <li>AG-50: Support for cellRendererFramework inside filterParams</li>
        <li>AG-688: Fixed compatibility issue with Internet Explorer 10</li>
    </ul>

    <h4>Breaking Change</h4>
    <ul>
        <li>In cell renderer, the eGridDiv and eParentOfValue no longer exist in init(), instead they are in
            afterGuiAttached().
            We don't like breaking changes, however this was neccessay to allow the new rendering engine.
        </li>
    </ul>

    <h2>Version 12.0.x</h2>
    <h3>Version 12.0.2 [26-JUL-2017]</h3>

    <h4>Bug Fixes</h4>
    <ul>
        <li>AG-646: Enhancement: updateRowData now <a href="../javascript-grid-data-update/#bulk-updating">returns the
                rows updated</a>.
        </li>
        <li>AG-645: Bugfix: Error creating bean CsvCreator due to minimifying issues. Still causing issues after
            12.0.1
        </li>
    </ul>

    <h3>Version 12.0.1 [25-JUL-2017]</h3>

    <h4>Bug Fixes</h4>
    <ul>
        <li>AG-645: Bugfix: Error creating bean CsvCreator due to minimifying issues.</li>
        <li>AG-636: Bugfix: Normal rowModelType was not deprecated properly.</li>
        <li>AG-639: Bugfix: Date component was still broken after previous fix AG-541/600</li>
        <li>AG-633: Bugfix: Fixed bug where "not contains" filter would not work with emtpy strings</li>
        <li>AG-641: Bugfix: When using row groups and footer rows, deprecation warning message was printed to the
            console, fixed it so it is now (internally grid was using a deprecate method).
        </li>
    </ul>

    <h3>Version 12.0.0 [21-JUL-2017]</h3>

    <h4>New Features</h4>
    <ul>
        <li>
            New feature: <a href="../best-polymer-data-grid/">Polymer Support</a>. #UseThePlatform
        </li>
        <li>
            New feature: <a href="../javascript-grid-change-detection/">Change Detection</a>. Say goodbye to
            grid refreshes.
        </li>
        <li>
            New feature: <a href="../javascript-grid-value-cache/">Value Cache</a>. Get better performance if your
            valueGetters are CPU intensive.
        </li>
        <li>
            New feature: <a href="../javascript-grid-column-spanning/">Column Spanning</a>.
        </li>
        <li>
            New feature: <a href="../javascript-grid-column-definitions/">Column Types</a>.
        </li>
        <li>
            New feature: <a href="../javascript-grid-enterprise-model/#enterprise-dynamic-row-height">Dynamic Row Height
                on Enterprise Row Model</a>.
        </li>
    </ul>
    <h4>Documentation</h4>
    <ul>
        <li>
            Rewrite of <a href="../javascript-grid-refresh/">Grid Refresh</a>. There were once a few similar confusing
            methods. There are are two clear and clean methods: cellRefresh() and redrawRows().
            See 'Changes to Refresh' below for more details.
        </li>
        <li>Update Documentation: <a href="../javascript-grid-value-getters/">Getters and Formatters.</a></li>
        <li>Update Documentation: <a href="../javascript-grid-value-setters/">Setters and Parsers.</a></li>
        <li>Renamed 'Master / Slave' to '<a href="../javascript-grid-aligned-grids/">Aligned Grids</a>' so that it's not
            confused with 'Master / Detail', which is nothing to do with 'Aligned Grids'.
        </li>
        <li>Renamed 'Pinned Rows' to '<a href="../javascript-grid-row-pinning/">Pinned Rows</a>' because it was
            confusing, now we have <a href="../javascript-grid-row-pinning/">Pinned Rows</a> and <a
                    href="../javascript-grid-pinning/">Pinned Columns</a> which are similar, but one for rows and one
            for columns.
        </li>
    </ul>
    <h4>Enhancements</h4>
    <ul>
        <li>AG-572: For accessibility, rows in the DOM are now placed in the same order you see on the screen. To turn
            on, set property ensureDomOrder=true.
        </li>
        <li>AG-469: Enhancement: new event for column 'menuVisibleChanged', gets fired when column menu is shown /
            hidden.
            Useful if doing your own headerComponent and want the header to look different when menu is shown / hidden.
        </li>
        <li>Enhancement: Now header DIV will contain class <i>ag-column-menu-visible</i> when the column menu is
            showing.
        </li>
        <li>AG-619: New option to always show status bar</li>
        <li>AG-523: Allow 'shift-click' selections on all row models</li>
        <li>AG-519: ASet filter use the checkboxes specified by the user, not the browser checkboxes</li>
    </ul>
    <h4>Bug Fixes</h4>
    <ul>
        <li>Bug fix: when using multiple group auto columns and header checkbox selection,
            the header checkbox now only appears in the first column header.
        </li>
        <li>AG-592: Bugfix: Allow empty groups if the user provides empty strings, not null or undefined</li>
        <li>AG-541/600: Bugfix: [Date component] Date component not working when specified in both filter and floating
            filter
        </li>
        <li>AG-586/584: Bugfix: Excel and CSV export are not using the default fileName when exporting</li>
        <li>AG-479: Bugfix: If you group dynamically in pivoting, the filter column shows an empty set</li>
        <li>AG-366: Bugfix: Multiple sort numbers were disappearing after horizontal scrolling</li>
        <li>AG-317: Bugfix: Agg/Pivot Display Issues With Longer Col Names</li>
        <li>AG-578: Bugfix: Exception raised when performing range selection and filtering on the enterprise row model
        </li>
        <li>AG-327: Bugfix: Cumalative sort numbers disappear when refreshHeader is called</li>
        <li>AG-375: After calling columnApi.setState() and doing multi-column sort,
            the sort numbers were not getting displayed beside the relevant column.
        </li>
        <li>AG-602: Bugfix: Enterprise Row Model success callback interface was missing 'lastRow'.</li>
        <li>AG-617: Buffix: Enterprise Row Model unable to perform full width groups</li>
        <li>AG-625: Now Enterprise Row Model works with complex objects (eg valueGetters and fields with dot
            notation).
        </li>
        <li>AG-624: 'select' editor, when you select a value, was closing 'full row edit'. Now select works fine with
            'full row edit'.
        </li>
        <li>AG-593: Added missing exports to exports.ts</li>
        <li>AG-628: Bugfix: Enterprise Data Source can now be set as a grid property (previously API had to be used).
        </li>
        <li>AG-629: Bugfix: Row order now maintained when using ag-Grid Enterprise and inserting with transaction using
            'addIndex'.
        </li>
        <li>AG-631: The internationalisation text 'drag here to aggregate' was incorrectly showing the 'drag here to
            pivot' message.
        </li>
    </ul>


    <h4>Breaking changes</h4>
    <p>
        <b>Changes to Refresh</b>
    </p>
    <p>
        The multiple refresh methods in the grid were confusing. We reviewed all the methods and replaced them with
        two simple equivalents:
        <a href="../javascript-grid-refresh/">api.refreshCells(params)</a> and
        <a href="../javascript-grid-refresh/">api.redrawRows(params)</a>. For 99% of the time, you will call
        api.refreshCells(params). However - given the grid now has change detection, you may find that you don't
        need to call refresh ever again.
    </p>
    <ul>
        <li>
            refreshView() -> use api.refreshCells(params) instead
        </li>
        <li>
            softRefreshView() -> use api.refreshCells(params) instead and include (the volatile) columns in params
        </li>
        <li>
            refreshRows(rowNodes) -> use api.refreshCells(params) instead and include rows in params
        </li>
        <li>
            refreshCells(rowNodes, colIds) -> use api.refreshCells(params) instead and include rows and columns in
            params
        </li>
        <li>
            refreshGroupRows() -> use api.refreshCells(params) instead and include rows and columns in params
        </li>
    </ul>

    <p>
        <b>Other API And Property Changes</b>
    </p>
    <p>
        The following API and property changes were done around the renaming of pinned rows and aligned grids.
        All this is done to make the grid API easier to understand and interface with.
    <ul>
        <li>colDef.floatingCellRenderer -> colDef.pinnedRowCellRenderer</li>
        <li>colDef.floatingCellRendererFramework -> colDef.pinnedRowCellRendererFramework</li>
        <li>colDef.floatingCellRendererParams -> colDef.pinnedRowCellRendererParams</li>
        <li>colDef.floatingValueFormatter -> colDef.pinnedRowValueFormatter</li>
        <li>gridApi.setFloatingTopRowData-> api.setPinnedTopRowData</li>
        <li>gridApi.setFloatingBottomRowData-> api.setPinnedBottomRowData</li>
        <li>gridApi.getFloatingTopRowCount-> api.getPinnedTopRowCount</li>
        <li>gridApi.getFloatingBottomRowCount-> api.getPinnedBottomRowCount</li>
        <li>gridApi.getFloatingTopRow-> api.getPinnedTopRow</li>
        <li>gridApi.getFloatingBottomRow-> api.getPinnedBottomRow</li>
        <li>gridApi.getFirstRenderedRow-> api.getFirstDisplayedRow</li>
        <li>gridApi.getLastRenderedRow-> api.getLastDisplayedRow</li>
        <li>gridOptions.floatingTopRowData -> gridOptions.pinnedTopRowData</li>
        <li>gridOptions.floatingBottomRowData -> gridOptions.pinnedBottomRowData</li>
        <li>gridOptions.slaveGrids -> gridOptions.alignedGrids</li>
        <li>rowNode.floating -> rowNode.rowPinned</li>
    </ul>
    </p>

    <p>
        <b>AG-591: Breaking Change to Cell Renderer - To Support TypeScript 2.4</b>
    </p>

    <p>
        cellRenderer.refresh() is now a mandatory method and returns boolean (previously it
        was optional and returned void). This is to
        support TypeScript 2.4 that mandated a breaking change (TypeScript 2.4 doesn't allow
        interface with just optional methods). Check the
        <a href="../javascript-grid-cell-rendering-components/#cell-renderer-component">cellRenderer Refresh</a>
        documentation for details on how to now implement this method. In summary, if you implemented
        this method before, just make sure you return true. If you did not implement this method before,
        then implement an empty version of it that returns false.
    </p>
    <p>
        <b>Breaking Changes</b>
    </p>
    <ul>
        <li>cellRenderer.params.valueGetter() is now called cellRenderer.params.getValue()</li>
        <li>Grid property slaveGrids is now called alignedGrids.</li>
        <li>Grid property paginationStartPage is gone, use api.paginationGoToPage(x) instead.</li>
    </ul>

    <h2>Version 11.0.x</h2>
    <h3>Version 11.0.0 [26-JUN-2017]</h3>

    <h4>Documentation</h4>
    <ul>
        <li><a href="../javascript-grid-grouping">Row Grouping </a> docs rewritten, favours new <i>rowGroup</i> property
            (instead of <i>rowGroupIndex</i>) and also favours auto group columns (instead of configurating column
            explicitly).
        </li>
        <li>New documentation page to <a href="../javascript-grid-testing">test with Jasmine or Karma</a>.</li>
        <li>New documentation page to <a href="../javascript-grid-rxjs">integrate RxJs</a>.</li>
        <li>New documentation page for <a href="../javascript-grid-cell-rendering/">grid provided cellRenders</a>.</li>
        <li>New documentation page for <a href="../javascript-grid-accessibility/">accessibility</a>.</li>
        <li>New documentation section for <a href="../javascript-grid-refresh/#flashing">cell flashing</a>.</li>
        <li>New documentation pages <a href="../javascript-grid-value-getters/">Values and Expressions</a>
            and <a href="../javascript-grid-cell-expressions/">Cell Expressions</a>.
        </li>
        </li>
    </ul>

    <h4>Enhancements</h4>
    <ul>
        <li>AG-513 - Improved <a href="../javascript-grid-grouping">row grouping</a>. The preferred way to do row
            grouping now
            is using auto group columns. All the examples in the docs have been updated to use when possible auto group
            columns.
            The new row grouping makes group sorting work out of the box and fixes some bugs related with sorting and
            row grouping
        </li>
        <li>AG-529 - Improved the way grid property changes are handled in React.</li>
        <li>AG-401 - New property <a href="../javascript-grid-column-menu/">menuTabs</a> to specify which column menu
            tabs to show and in which order.
        </li>
        <li>AG-38 - New <a href="../javascript-grid-accessibility/">accessibility</a> features and documentation.</li>
        <li>AG-517 - Review of valueGetters and valueFormatters and introduced valueSetters and valueParsers.
            See new documentation pages <a href="../javascript-grid-value-getters/">Values and Expressions</a>
            and <a href="../javascript-grid-cell-expressions/">Cell Expressions</a> for details.
        </li>
        <li>AG-551 - Added <a href="../javascript-grid-pivoting/#totalPivotColumns">Pivot Total Columns</a> - allows
            expanding / collapsing of pivot columns into totals
        </li>
        <li>AG-515 - New property <a href="../javascript-grid-sorting/#accentedSort">gridOptions.accentedSort</a>. Set
            to true to specify that the sort
            should take into account accented characters, if this feature is turned on the sort will perform slower.
        </li>
        <li>AG-182 - New property <a href="../javascript-grid-clipboard/#deliminator">clipboardDeliminator</a> to
            specify deliminator to use while copying to clipboard.
        </li>
        <li>AG-398 / AG-371 - New property <a
                    href="../javascript-grid-clipboard/#suppressPaste">colDef.suppressPaste</a> to suppress pasting from
            clipboard for certain cells.
        </li>
        <li>AG-73 - Now when editing or updating data, if value is not different, data is not updated, cell is not
            refreshed and no 'valueChangedEvent' fired. This was important when tabbing through cells while editing,
            previously events were first as you navigate cells even though the value was not changed.
        </li>
    </ul>

    <h4>Bug fixes</h4>
    <ul>
        <li>AG-557 - Fixed issue where rowGroupPanelShow would not work if using any framework. ie Angular, React...
        </li>
        <li>AG-539 - Fixed issues in the react examples</li>
        <li>AG-347 - Fixed issue where in some cases groupSuppressAutoColumn : true Makes copy not work on the group
            column
        </li>
        <li>AG-481 - Fixed issue where multi column sort wouldn't work when sorting many columns once, including row
            group columns
        </li>
        <li>AG-348 - Callbacks processCellForClipboard() and processCellFromClipboard() now get invoked with doing Ctrl
            + D (copy range down)
        </li>
        <li>AG-199 - <a href="../javascript-grid-resizing/">sizeColumnsToFit</a> now fires an event with parameter
            'finished=true'.
        </li>
        <li>AG-199 - <a href="../javascript-grid-resizing/">autoSizeColumns</a> now fires just one event, previously it
            was firing two events unnecessarily.
        </li>
        <li>AG-82 - <a href="../javascript-grid-resizing/#resizing-groups">Resizing groups</a> now respects any children
            columns that are not resizable.
        </li>
        <li>AG-207 - MarryChildren was not working when columns were hidden, now works.</li>
        <li>AG-154 - Typing non-latin letters on focused cell now starts cell editing.</li>
        <li>AG-543 - Bugfix - Regression/Breaking Change - rows are inserted in reverse order</li>
    </ul>


    <h4>Breaking Changes</h4>
    <ul>
        <li>Aggregation data and group data are no longer stored in rowNode.data, instead they are stored in
            rowNode.groupData and rowNode.aggData. If you are
            accessing rowNode.data for aggreation or group data, this will now not work.
        </li>
        <li>Removed property suppressUseColIdForGroups, because of new way of storing grouped data in the rowNode, it is
            not needed.
        </li>
        <li>
            If you are providing your own group display columns (ie columns to show the groups, not columns
            to group by) then you have to specify <i>colDef.showRowGroup=true</i> to get the grid to return
            the right values for the chosen group. This is explained in
            <a href="../javascript-grid-grouping/#showRowGroup">Show Row Group</a>.
        </li>
        <li>
            gridOptions.groupColumnDef has been renamed to autoGroupColumnDef.
        </li>
        <li>
            gridOptions.enableFilter now needs to be specifically switched on to get the filter menu in the columns.
        </li>
        <li>
            Deprecated cellRendererParams properties: restrictToOneGroup. See row grouping docs on new way to restrict
            to one group.
        </li>
        <li>
            Deprecated cellRendererParams properties: keyMap. The 'keymap' solution was before you could group using
            valueGetters. If you want the group to have a different value, use either a valueGetter, or use a
            cellFormatter
            to format the value.
        </li>
        <li>
            Deprecated gridOptions properties: suppressMenuFilterPanel suppressMenuMainPanel and
            suppressMenuColumnPanel,
            use colDef.menuTabs instead. Instead use colDef.menuTabs property to set what tabs you want.
        </li>
    </ul>

    <h2>Version 10.1.x</h2>

    <h3>Version 10.1.0 [08-JUN-2017]</h3>
    <h4>Documentation:</h4>
    <ul>
        <li>
            New documentation page <a href="../javascript-grid-accessing-data/">Accessing Data</a>.
        </li>
        <li>
            New documentation page <a href="../javascript-grid-refresh/">Data Refresh</a>.
        </li>
        <li>
            New documentation page <a href="../javascript-grid-data-update/">Data Update</a>.
        </li>
    </ul>

    <h4>Enhancements:</h4>
    <ul>
        <LI>AG-483: <a href="../javascript-grid-data-update/">Delta updates</a> - now you can add / update / remove
            rows without having to call 'setRowData(rowData)' with new data each time. Means you can keep the grids
        <li>AG-420: Support for <a href="../example-react-redux/">Redux Style Immutable Stores</a>,
            to work better with React applications.
        </li>
        state (seelction, grouping etc) while new rows are set.</li>
        <LI>AG-114: <a href="../javascript-grid-width-and-height/#autoHeight">Auto height grid</a>: Allow the grid to
            resize it's height to the number of rows so that there is no vertical scrolls.
        </li>
        <LI>AG-392: Number floating filters now can be any number, previously it was only possible to filter by
            positive non decimal numbers. This can be seen in our <a href="../example.php">main demo page</a></li>
        <LI>AG-453: Added optional debounce configuration to the keyboard input in the filter box and the column filter.
            This is configured by the property <i>debounceMs</i> and applies to the
            <a href="../javascript-grid-filter-text">text</a>, <a href="../javascript-grid-filter-number">number</a> and
            <a href="../javascript-grid-filter-set">set</a> filter.
        </li>
        <LI>AG-506: Added an API call <code>api.refreshInMemoryRowModel(step)</code> to easily
            <a href="../javascript-grid-data-update/index.php#refreshInMemoryRowModel">request the grid to be
                filtered, sorted, grouped …</a></li>
        <LI>AG-505: Added new API methods to <a href="../javascript-grid-data-update/">get nodes based on the displayed
                index</a> or the node id <code>getRowNode(id)</code></li>
        <LI>AG-512: Improved the performance of the tree data.</li>
        <LI>AG-501: Allow <a href="../javascript-grid-context-menu/">tooltips</a> in the context menu</li>
        <LI>AG-451: Allow the user to dynamically <a href="../javascript-grid-filter-set/#setFilterApi">change the
                values of the set filter on the fly</a>.
        </li>
    </ul>

    <h4>Bug fixes</h4>
    <ul>
        <LI>AG-508: Fixing bug where it would be not possible to filter by 0 in a number floating filter</li>
        <LI>AG-493: Fixing a bug where if using auto group columns and restoring their state to be sorted would not sort
            the auto-group column
        </li>
        <LI>AG-468: New callback to allow modifying any popup shown by ag-grid just before they are about to be
            displayed
        </li>
        <LI>AG-323: Fixed bug where floating filters wouldn't work in the frameworks</li>
        <LI>AG-442: Fixing bug where suppressing a filter would not prevent the filter from initialising, hence
            potentially causing a performance problem
        </li>
        <LI>AG-428: Fixing bug where more than two levels of grouped headers don’t get exported.</li>
        <LI>AG-488: Fixing bug where set filters with newRowsAction='keep' wouldn’t work if one of the values selected
            in the mini filter is blank
        </li>
        <LI>AG-495: Fixing a bug where navigation keys would cause the cell editing to stop (ie, Home, End, Page Up,
            Page Down)
        </li>
    </ul>

    <h4>Breaking Changes</h4>
    <ul>
        <li>
            Deprecated Methods: insertItemsAtIndex(), removeItems(), addItems(), use updateRowData() instead.
        </li>
        <li>Property 'forPrint' replaced with 'domLayout', if using forPrint, then set domLayout="forPrint" instead.
        </li>
    </ul>

    <h2>Version 10.0.x</h2>

    <h3>Version 10.0.1 [24-MAY-2017]</h3>
    <ul>
        <li>
            AG-475: There were missing exports causing compilation problems in typescript
        </li>
    </ul>

    <h3>Version 10.0.0 [22-MAY-2017]</h3>

    <h4>Enhancements:</h4>
    <ul>
        <li>
            New row model type <a href="../javascript-grid-enterprise-model/">Enterprise Row Model</a>.
        </li>
        <li>AG-471: All the <a href="../javascript-grid-events/">events</a> are now asynchronous. afterFilterChanged
            event dropped.
        </li>
        <li>AG-461: By default, <a href="../javascript-grid-filter-quick">quick filter</a> no longer caches the values.
            This means quick filters work a bit
            slower, but are more dependable (cache does not go out of date). The cache can still be turned
            on using the property <i>cacheQuickFilter=true</i> if worried about performance.
        </li>
        <LI>AG-104: The headers height now is dynamic and can be configured to support
            <a href="/javascript-grid-column-header/"">vertical text orientation</a>.
        </li>
        <LI>AG-462: Allow custom CSS classes in <a href="../javascript-grid-context-menu">context menu items</a> through
            the property <i>cssClasses</i></li>
        <LI>AG-388: New <a href="../javascript-grid-properties">grid property</a> <i>suppressAggAtRootLevel</i> to allow
            the suppression of aggregation at the root Node level
        </li>
    </ul>

    <h4>Bug Fixes:</h4>
    <ul>
        <LI>AG-449: Merging styles in Excel export would fail if mixing two partial styles in one cell</li>
        <LI>AG-444: Removed the necessity to add a <i>defaultGroupComparator</i> to have groups sorting by default</li>
        <LI>AG-444: Removing sort on a column will restore the sort to the sort provided from the user in all the
            cases.
        </li>
        <LI>AG-372: <a href="../javascript-grid-cell-editing">Popup editors</a> when
            <i>stopEditingWhenGridLosesFocus</i>: true would disappear when the user will click on them
        </li>
        <LI>AG-403: Fixing edge cases when <i>openGroupByDefault</i> and <i>removeParents</i> would case the grid to
            show the wrong <a href="../javascript-grid-grouping">row aggregations</a></li>
        <LI>AG-384: Fixing a bug when unpinning a column will cause empty rows shown on the main body area of the grid
        </li>
        <LI>AG-377: Property <i>restrictToOneGroup</i> didn't work when field was missing in colDef (ie value getter
            used instead).
        </li>
        <LI>AG-452: Using <i>groupColumnDef</i> would cause CSV/Excel export to fail</li>
        <LI>AG-450: Fix bug when the only option specified for a filter is in range <i>filterOptions:['inRange']</i>
        </li>
        <LI>AG-445: Cell editors <i>destroy</i> method is not mandatory anymore</li>
        <LI>AG-259: <i>sizeColsToFit</i> not working in frameworks when immediately invoked</li>
        <LI>AG-335: <i>floatingFilterWrapperComponent</i> prints readable error messages when the custom implementations
            are missing mandatory methods
        </li>
        <LI>AG-457: Angular components prints readable error message when the method <i>agInit</i> is missing</li>
        <LI>AG-464: The grid API is passed as parameter to all the components in the <i>init</i> method</li>
        <LI>AG-328: Fixed <i>suppressSorting</i> for <a href="../javascript-grid-set-filtering">Set Filters</a>, it
            wasn't working properly
        </li>
    </ul>

    <h4>Breaking Changes:</h4>
    <ul>
        <li>
            The cache in 'infinite row model' now deals with <b>blocks</b> of rows,
            not <b>pages</b> of rows. To avoid terminology confusion (with pagination feature)
            the following name changes were made:
            <ul>
                <li>
                    Property <i>maxPagesInCache</i> renamed to <i>maxBlocksInCache</i>
                </li>
                <li>
                    Property <i>infiniteBlockSize</i> renamed to <i>cacheBlockSize</i>
                </li>
                <li>
                    Property <i>paginationOverflowSize</i> renamed to <i>cacheOverflowSize</i>
                </li>
                <li>
                    API <i>refreshInfinitePageCache</i> renamed to <i>refreshInfiniteCache</i>
                </li>
                <li>
                    API <i>purgeInfinitePageCache</i> renamed to <i>purgeInfiniteCache</i>
                </li>
                <li>
                    API <i>getInfinitePageState</i> renamed to <i>getBlockCacheState</i>
                </li>
            </ul>
        </li>
    </ul>

    <h2>Version 9.0.x</h2>

    <h3>Version 9.1.0</h3>

    <h4>Enhancements:</h4>
    <ul>
        <li>
            Enhancement (AG-346): Floating Filters/Performance: Floating filters won't slow down vertical scrolling
            anymore
            as they lazily interact with the filters now.
        </li>
        <li>
            Enhancement (AG-399): Excel export: Allow additional excel style property <i>dataType</i> to force custom
            data type for a column
        </li>
        <li>
            Enhancement (AG-390): Excel export: Allow <i>customHeader()</i> and <i>customFooter()</i> callbacks to add
            custom rows either at the header or the footer of the exported excel file
        </li>
        <li>
            Enhancement (AG-387): Text filter: Allow <i>textCustomComparator()</i>
        </li>
        <li>
            Enhancement (AG-378): Filter: Added filterParam <i>filterOptions</i> which takes a string array of valid
            filter
            types that the user can select from the filter UI in the filter menu
        </li>
        <li>
            Enhancement (AG-368): added <i>columnApi</i> and grid api <i>api</i> to header comp params.
        </li>
    </ul>

    <h4>Bugfix:</h4>
    <ul>
        <li>Bugfix (AG-391): Number Filter: Fixed bug where filtering by 0 will filter everything out</li>
        <li>Bugfix (AG-382/359): Date Filter: Fixed bug where using the cross to clear the date filter will throw an
            error
        </li>
        <li>Bugfix (AG-373): WebComponents: initialiseAgGridWithWebComponents no longer was working</li>
        <li>Bugfix (AG-370): Keyboard navigation: Keyboard navigation should skip full with rows</li>
    </ul>

    <h3>Version 9.0.3</h3>

    <h4>Enhancements:</h4>
    <ul>
        <li>
            New property <i>suppressScrollOnNewData</i>. When true, the grid will not scroll to the top
            when new row data is provided. Use this if you don't want the default behaviour of scrolling
            to the top every time you load new data..
        </li>
    </ul>

    <h4>Bugfix:</h4>
    <ul>
        <li>
            Property <i>groupDefaultExpanded</i> was not working for expanding all groups in pivot mode.
        </li>
        <li>
            Fixed typescript type of the property <i>paginationAutoPageSize</i> from number, to the correct type
            boolean.
        </li>
    </ul>

    <h3>Version 9.0.2</h3>

    <b>Bug Fix</b>: Fixed Web Components issue, error "Cannot redefine property: infiniteBlockSize" solved.

    <h3>Version 9.0.1</h3>

    <b>Bug Fix: </b> License key was broken.

    <h3>Version 9.0.0</h3>

    <b>Big Feature: Client Side Pagination (AG-91)</b>

    <p>
        ag-Grid 9.0.x introduces <a href="../javascript-grid-pagination/">Client-side Pagination</a>. This replaces the
        old 'pagination row model' which forced
        you to bring back pagination pages one page at a time from the server. The client side pagination works
        with all row models and paginates on the client side. This means you have pagination work with the default
        Client-side Row Model (and do filtering, sorting, grouping, pivoting etc on the data on the client side),
        or you can also put pagination in front of the viewport row model or Infinite Scrolling Row Model.
    </p>

    <b>Big Feature: Improved Column Groups (AG-315)</b>

    <p>
        ag-Grid 9.0.x also introduces
        <a href="../javascript-grid-grouping/#manyGroupColumns">multiple columns for groups</a>
        and
        <a href="../javascript-grid-grouping/#replacingChildren">multi columns while grouping</a>.
    </p>

    <b>Enhancements</b>
    <ul>
        <li>Enhancement: New <a href="../javascript-grid-pagination/">Client-side pagination</a> that works with all row
            models.
        </li>
        <li>Enhancement: New event <i>bodyHeightChanged</i>, gets called when the body height changes,
            thus the number rows rendered may change. This is used by the grid for setting the page
            size when <i>paginationAutoPageSize=true</i>.
        </li>
        <li>Enhancement: First pass of <a href="../javascript-grid-enterprise-model/">Server-side Row Model</a>,
            to allow ag-Grid users to see work in progress for our server side filtering, sorting, grouping and
            aggregation.
        </li>
        <li>Enhancement (AG-349): Filter: Provided 'in range' filters now have parameter <i>inRangeInclusive</i> to
            include the start and end range values.
        </li>
        <li>Enhancement (AG-334): New event <i>componentStateChanged</i>: When frameworks (eg Angular 2, React, VueJS,
            Aurelia, Web Components) change a grid property, this event gets fired AFTER the grid has actioned the
            change.
        </li>
        <li>Enhancement (AG-318): New property <i>allowContextMenuWithControlKey</i>, removes suppression of the context
            menu when ctrl is held down.
        </li>
        <li>Enhancement (AG-307): New property <a href="../javascript-grid-cell-editing/#manyGroupColumns"><i>stopEditingWhenGridLosesFocus</i></a>,
            for cell editing, so that taking focus off the grid stops the editing and saves values.
        </li>
    </ul>


    <b>Bug Fixes:</b>

    <ul>
        <li>Bugfix (AG-355): Set Filter: setModel(null) was failing when selectMiniFilter = true.</li>
        <li>Bugfix (AG-351): For Print: sorting and filtering was broken in forPrint.</li>
        <li>Bugfix (AG-320): For Print was not working when using api.setRowData()</li>
        <li>Bugfix (AG-314): (Angular 1.x) $scope got dropped form cellClass callback, is now back in.</li>
        <li>Bugfix (AG-274): Column grouping and pinned columns were giving wrong header widths.</li>
    </ul>

    <b>Refactoring:</b>
    <ul>
        Refactor: Virtual Row Model is now called Infinite Row Model. All properties and APIs related to this
        are now call 'Infinite' eg <i>setVirtualRowCount()</i> is now <i>setInfiniteRowCount()</i>. Grid will
        log to console and help you when you are using the old method and property names.
    </ul>


    <h2>Version 8.2.x</h2>

    <b>Enhancements:</b>
    <ul>
        <li>Enhancement: <a href="../javascript-grid-filtering/#floatingFilter">Floating Filters</a>.</li>
        <li>Enhancement: <a href="../javascript-grid-pagination/#pagination-api">Pagination API</a>.</li>
        <li>Enhancement: Pagination now scrolls to top when you load new page.</li>
        <li>Enhancement: Provided filters now have 'Clear Filter' button.</li>
        <li>Enhancement: Sorting now shows order of sort when sorting by multiple columns.</li>
    </ul>

    <b>Bug Fixes:</b>
    <ul>
        <li>Bugfix: exportDataAsExcel no longer throws error when called with no arguments.</li>
        <li>Bugfix: Excel Export wasn't working with Open Office, now working.</li>
        <li>Bugfix: Excel Export was sometimes missing number values, now fixed.</li>
        <li>Bugfix: 'Select All' checkbox now works with pagination.</li>
        <li>Bugfix: Cell refresh now gets cellClassRules reapplied.</li>
        <li>Bugfix: Horizontal DragService now uses gridOptions.getDocument().</li>

    </ul>

    <h2>Version 8.1.x</h2>

    <b>Small Breaking Change:</b>

    <p>For Angular 2+ users only: ag-grid-ng2 repository renamed tp ag-grid-angular. So in your
        dependencies (package.json), reference ag-grid-angular, not ag-grid-ng2.</p>

    <b>Enhancements:</b>
    <ul>
        <li>Enhancement: Angular repository renamed (used to be ag-grid-ng2, is now ag-grid-angular). This is because
            Google want to call Angular 2 just Angular now.
        </li>
        <li>Enhancement: CSS class 'ag-column-hover' now added to headers when mouse over column.</li>
        <li>Enhancement: Text Filter now has 'not contains' option.</li>
        <li>Enhancement: Text Filter no longer applies lower case to model.</li>
        <li>Enhancement: Set Filter has option to hide the mini search.</li>
        <li>Enhancement: Number Filter now has range.</li>
        <li>Enhancement: Added suppress quotes option for copySelectedRowsToClipboard.</li>
    </ul>

    <b>Bug Fixes:</b>

    <ul>
        <li>Bugfix: Angular 2 - angular directive was causing too many dirty checks</li>
        <li>Bugfix: AMD - Removed circular dependency in context.js which impacted AMD.</li>
        <li>Bugfix: api.getDataAsCsv() parameters are now optional.</li>
        <li>Bugfix: Mouse can now drag(ie movable) custom header groups.</li>
        <li>Bugfix: Context sub-menu no longer gets clipped when to large.</li>
        <li>Bugfix: suppressSorting now works on mobile (ie touch).</li>
        <li>Bugfix: Now when you ungroup, the sort state will be removed if you are sorting by the group column.</li>
        <li>Bugfix: processCellFromClipboard was not getting called.</li>
        <li>Bugfix: Excel Export was not working for Open Office.</li>
        <li>Bugfix: Checkbox was in wrong position when pinning the column.</li>
    </ul>

    <h2>Version 8.0.x</h2>

    <h3>ag-Grid 8.1.1, ag-Grid-Enterprise 8.1.1</h3>

    <li>Bugfix: Fixed bug where the export to Excel will not export numerical cells</li>


    <h3>ag-Grid 8.1.0, ag-Grid-Enterprise 8.1.0</h3>

    <b>Enhancements:</b>
    <ul>
        <li>Enhancement: <a href="../best-vuejs-data-grid/">VueJS</a> Framework Support! Big welcome to the VueJS
            community.
        </li>
        <li>Enhancement: <a href="../javascript-grid-header-rendering/#headerComponent">Header Component</a> and <a
                    href="../javascript-grid-header-rendering/#headerGroupComponent">Header Group Component</a>.
            Allowing full customisation of the headers.
        </li>
        <li>Enhancement: <a href="../javascript-grid-excel/">Excel Export</a> now includes full support for all Excel
            XML properties.
        </li>
        <li>Enhancement: New feature <a href="../javascript-grid-selection/#headerCheckboxSelection">Header Checkbox
                Selection</a>.
        </li>
        <li>Enhancement: New CSS class <i>ag-column-hover</i> to allow highlighting of hovered column.</li>
        <li>Enhancement: If one cell in clipboard, you can now select a range of cells to copy that one value into
            entire range.
        </li>
        <li>Enhancement: Navigation support for Page Up, Page Down, Home, End, Ctrl+left, Ctrl+right.</li>
        <li>Enhancement: New APIs <i>api.selectAllFiltered()</i> and <i>api.deselectAllFiltered()</i></li>
        <li>Enhancement: Added <i>skipRefresh</i> to the add/remove row APIs, so if you want to add / remove
            lots of rows, you only refresh on the last update.
        </li>
        <li>Enhancement: Property <i>groupDefaultExpanded</i> now works with flower nodes</li>
        <li>Enhancement: New property <i>suppressTabbing</i> to disabled grids tabbing functionality.</li>
    </ul>

    <b>Small Breaking Changes:</b>
    <ul>
        <li>Breaking Change: TypeScript Users Only: Interfaces names changed for components.
            Check the documentation for the names of the interfaces. Eg <i>ICellRenderer</i> is replaced
            with <i>ICellRendererComp</i>. This is to position ag-Grid for supporting components from
            other frameworks ('Comp' means an ag-Grid component, to differentiate from a cellRenderer
            built in eg Angular or React).
        </li>
        <li>Breaking Change: TypeScript Users Only: Interface names used in Angular 2 are also changed slightly. Again
            check the documentation for the new names.
        </li>
        <li>gridOptions.checkboxSelection is now gone, use defaultColDef.checkboxSelection instead</li>
    </ul>

    <b>Bug Fixes:</b>
    <ul>
        <li>Bug Fix: Editing works for off-screen cells - so if editing full rows, off screen cells don't get reset.
        </li>
        <li>Bug Fix: ctrl+c now works, even if focus cell is scrolled out of view.</li>
        <li>Bug Fix: Set Filter now supports null values when getting and setting the model.</li>
    </ul>

    <h2>Version 7.2.x</h2>

    <li>Enhancement: <a href="../javascript-grid-excel">Excel Export</a>.</li>
    <li>Enhancement: <a href="../javascript-grid-filtering/#dateFilter">Date Filter</a>.</li>
    <li>Enhancement: richSelect cell editor now works with empty strings.</li>
    <li>Enhancement: new property <a href="../javascript-grid-cell-editing/#groupEditing"><i>enableGroupEdit</i></a>,
        Set to true to allow editing of the group rows.
    </li>
    <li>Enhancement: RTL verified to work with For Print.</li>
    <li>Enhancement: New API <i>getDocument()</i> for overriding what document is used. Currently used by Drag and Drop
        (may extend to other places
        in the future). Use this when you want the grid to use a different document than the one available
        on the global scope. This can happen if docking out components (something which Electron supports).
    </li>
    <li>Enhancement: Context menu now has CSV Export and Excel Export.</li>
    <li>Enhancement: New <i>api.onSortChanged()</i>, call it if you update a cell with a new value and you want to apply
        the sort order again.
    </li>
    <li>Enhancement: New property <a href="../javascript-grid-grouping/#fullWidthRows"><i>embedFullWidthRows</i></a>.
    </li>
    <li>Breaking Change: IAfterFilterGuiAttachedParams now called IAfterGuiAttachedParams (impacts TypeScript users
        only)
    </li>
    <li>Bugfix: callback processCellForClipboard was not getting used when copying just one cell (ie not a range).</li>
    <li>Bugfix: <i>gridOptions.onItemsRemoved</i> was incorrectly called <i>gridOptions.onItemsRemove</i>.</li>
    <li>Bugfix: Column menu was disappearing while doing vertical scroll. Now it only disappears for horizontal scroll.
        This impacted when filtering changed the v scroll position (eg if everything filtered, scroll set back to top)
    </li>
    <li>Bugfix: api.isAyFilterPresent() was returning true after api.setRowData() was called with new data and
        newRowsAction was not 'keep'.
    </li>
    <li>Bugfix: horizontal scroll was sometimes not possible when no rows, now it is (so you can access column menu on
        RHS even if no rows).
    </li>
    <li>Bugfix: classes ag-row-group-expanded and ag-row-group-contracted were not getting applied as group expanded and
        contracted.
    </li>
    <li>Bugfix: if doing popup editing, and you click outside the grid, the edit is lost, which is different to click on
        another cell, where the edit is kept. Now they are in sync, clicking outside the pop always keeps the edit.
    </li>
    <li>Bugfix: headerCellTemplate had classes in agText element removed. Now they are left alone.</li>
    <li>Bugfix: rowIndex was missing from cellEditor params</li>
    <li>Bugfix: CSS class ag-row-focus class was not getting applied to right row when rows were ordered or filtered
    </li>
    <li>Bugfix: event selectionChanged was not getting fired when you had more than one row selected, then just clicked
        one row (all other rows get deselected).
    </li>
    <li>Bugfix: api.sizeColumnsToFit() was incorrectly working out the vertical scroll value - meant it was out by the
        scroll width sometimes in its calculations.
    </li>

    <h2>Version 7.1.x</h2>

    <li>Enhancement: <a href="../javascript-grid-rtl/">RTL support</a>, so now you can support languages that go
        from right to left.
    </li>
    <li>Enhancement: new events: rowEditingStarted, rowEditingStopped, cellEditingStarted, cellEditingStopped.</li>
    <li>Enhancement: new property <a href="../javascript-grid-cell-editing/#singleClickEditing"><i>suppressClickEdit</i></a>.
    </li>
    <li>Enhancement: added api.clearFocusedCell()</li>
    <li>Enhancement: added <a href="../javascript-grid-clipboard/#sendToClipboard"><i>sendToClipboard</i></a></li>
    <li>Enhancement: added <a href="../javascript-grid-keyboard-navigation/#customNavigation">custom keyboard
            navigation</a></li>

    <li>Bug Fix: Sub menu was not working in Firefox, now fixed.</li>
    <li>Bug Fix: Copy to clipboard was not copying focused cell then range selection was turned off.</li>
    <li>Bug Fix: Pinned right header used to be mis-aligned by the scroll width. Now it's aligned.</li>

    <li>Documentation: Angular 2 Examples Project now has examples for both SystemJS & SystemJS-Builder, Webpack and
        Angular-CLI
    </li>

    <h4>ag-grid-angular-7.1.2</h4>
    <h4>Bug Fixes</h4>
    <ul>
        <li>Bug Fix: TypeScript was incorrectly trying to compile main.ts (when under node_modules) - exclude main.ts
            from npm publish for now
        </li>
        <li>Bug Fix: Unpin versions for Angular and Zone to be more flexible</li>
    </ul>

    <h2>Version 7.0.x</h2>

    <h4>ag-grid-7.0.2, ag-grid-enterprise-7.0.2</h4>

    <h4>Bug Fixes</h4>
    <ul>
        <li>Bug Fix: For virtual pagination row model only, calling api.insertItemsAtIndex() messed up the row indexes,
            now fixed.
        </li>
        <li>Bug Fix: For viewport row model only, selected row was failing when the node ID of the selected row
            changed.
        </li>
        <li>Bug Fix: When animating the rows, the selected cell highlight was getting confused. Now stays with the same
            row index (so if rows move, focus goes to new row in the selected index, the index doesn't move).
        </li>
        <li>Bug Fix: grid event onRowClicked was not working for fullWidth rows (including when fullWidth was used for
            grouping).
        </li>
        <li>Bug Fix: count function was not working when row grouping had 2 or more columns.</li>
        <li>Bug Fix: callbacks getBusinessKeyForNode and checkboxSelection were missing for React. in now.</li>
        <li>Bug Fix: isCancelAfterEnd was getting called even if ESC was pressed, now no longer.</li>
    </ul>
    <h4>Enhancements</h4>
    <ul>
        <li>Enhancement: New api methods <i>api.tabToNextCell()</i> and <i>api.tabToPreviousCell()</i> for navigation.
        </li>
        <li>Enhancement: Filter type 'not equals' now works for empty string values (they should pass the filter).</li>
    </ul>
    <ul>
        <li>Enhancement: <a href="../javascript-grid-value-getters/#headerValueGetter">headerValueGetter</a> now has an
            extra parameter 'location' which is on of {csv, clipboard, toolPanel, columnDrop, header}.
            It allows you to have a different name for the column dependent on where it is.
        </li>
    </ul>

    <h2>Version 7.0.x</h2>

    <h4>Enhancements</h4>
    <ul>
        <li>Enhancement: <a href="../best-aurelia-data-grid/">Aurelia Support</a>.</li>
        <li>Enhancement: <a href="../best-angular-2-data-grid/#aotCompilation">Full Angular 2 AOT Support</a>.</li>
        <li>Enhancement: New option for grouping <a href="../javascript-grid-grouping/#removeSingleChildren">
                Remove Single Children</a>, so groups will only one child are removed.
        </li>
        <li>Enhancement: Now menu's (<a href="../javascript-grid-column-menu/">column menu</a> and
            <a href="../javascript-grid-context-menu/">context menu</a>) can have custom sub menus.
        </li>
        <li>Enhancement: <a href="../javascript-grid-animation/">Animation of Rows</a> - now rows will animate after
            sort, filter and row group open / close.
        </li>
        <li>Enhancement: New API - rowNode.setExpanded(boolean) - To open / close a row group row.</li>
        <li>Enhancement: api.getValue() now works with pivot columns</li>
        <li>Enhancement: <a href="../javascript-grid-row-height/#changingRowHeight">Row height</a> can now be changed
            after the rows are initially set.
        </li>
        <li>Enhancement: New property - <a href="../javascript-grid-selection/#groupSelection">groupSelectsFiltered</a>,
            when set, if you select a group, unfiltered items do not get selected.
        </li>
        <li>Enhancement: Angular 1 - Added $scope to cellEditor params.</li>
        <li>Enhancement: Now when multiple ranges are selected, copy to clipboard copies all ranges, previously only
            first range was copied.
        </li>
    </ul>

    <h4>Bug Fixes</h4>
    <ul>
        <li>Bug Fix: columnApi.setColumnAggFunct() => renamed to columnApi.setColumnAggFunc() (took out the 't' at the
            end, it was a typo)
        </li>
        <li>Bug Fix: paste from clipboard now skips non-editable columns and continues with rest of row (before it
            stopped and didn't complete the row)
        </li>
        <li>Bug Fix: copying selected rows to clipboard was not possible in Viewport. Now is possible.</li>
    </ul>

    <h4>Breaking Change</h4>
    <ul>
        <li>If you are using Angular 2 components inside ag-Gri, due to changes in the Angular 2 library,
            we had to change how Angular 2 cell renderers are configured. Please check the new documentation
            on what to change.
        </li>
    </ul>

    <h2>Version 6.4.x</h2>

    <h4>ag-grid-6.4.2, ag-grid-enterprise-6.4.2</h4>

    <li>Enhancement - column group / pivot panels don't try and do anything if user rearranges, but leaves things in
        same order as the start.
    </li>

    <h4>ag-grid-6.4.0, ag-grid-enterprise-6.4.0, ag-grid-angular-6.4.0, ag-grid-react-6.4.0, </h4>

    <h4>Enhancements</h4>
    <li>Big Enhancement - for grouping, pivoting and values, now you can reorder the columns in the drop zones.</li>
    <li>Small Enhancement - added <a href="../javascript-grid-tool-panel/#stylingToolPanel">toolPanelClass</a> so you
        can style tool panel items.
    </li>
    <li>Small Enhancement - now if you scroll the grid, if a column menu or context menu are open, they will close,
        otherwise the menu gets out of line with the columns & cells.
    </li>

    <h4>Bug Fixes</h4>
    <li>Bugfix - for setFilter, setModel was not updating the 'Select All' button, is now</li>
    <li>Bugfix - when using api.addItems() for standard row model (ie no virtual pagination or viewport) then items were
        added in reverse order.
    </li>
    <li>Bugfix - in IE and Edge, when you edit a cell, then click another cell, the other cell doesn't get focus (eg
        navigation keys don't work) - appears to be a glitch in IE And Edge, this bug fix works around it
    </li>

    <h4>Breaking Change</h4>
    <li>Breaking Change - the following events now have the final list of columns, rather than those added / removed:
        columnRowGroupChanged, columnPivotChanged, columnValueChanged
    </li>

    <h2>Version 6.3.x</h2>

    <h4>Enhancements</h4>

    <ul>
        <li>quick filter - added <a
                    href="../javascript-grid-filtering/#overridingQuickFilter">colDef.getQuickFilterText</a> to allow
            overriding of quick filter text
        </li>
        <li>performance option - added property suppressRowHoverClass, so if you do not require the row hover class,
            it's expensive, set this to true for slight performance tweak
        </li>
        <li>ag-grid-react - now cellRenderers get params.reactContainer so the cell renderer can style the wrapping
            div
        </li>
        <li>ag-grid-react - container for react cells now has css class ag-react-container, to allow CSS selection for
            styling
        </li>
        <li>clipboard - added callback processCellFromClipboard(), to allow you to change data as it's been copied from
            the clipboard.
        </li>
        <li>scrolls - new property 'scrollbarWidth', so you can tell grid how much padding to use for scrollbar. Handy
            if providing non-standard scrolbars to grid and need to provide alterlative padding to use.
        </li>
        <li>grid size - added api.checkGridSize(), so you can force grid to check its size. Handy if you create the grid
            OUT of the dom, then insert it, then you want to tell grid to work out what rows and columns to render.
        </li>
        <li>icons - added customisation of the following icons: menuPin, menuValue, menuAddRowGroup, menuRemoveRowGroup,
            rowGroupPanel, pivotPanel, valuePanel
        </li>
        <li>suppress touch - added property <i>suppressTouch</i> to turn off touch support, if you don't want it.</li>
    </ul>

    <h4>Performance Enhancements</h4>
    <p>
        In our tests the demo page used to take 1600ms to expand a row after grouping, it's now down to 600ms. We
        haven't tested teh other browsers, but you can expect these changes to at least have some positive improvements
        on them also. The changes we made were:
    </p>
    <ul>
        <li>introduced Document Fragment to build DOM offline when building rows</li>
        <li>cells no do not have any events, all event handling done at grid level - means for example, where before was
            adding a keydown event to every cell, not it is added to grid and gri work out which cell, means not
            adding/removing lots of listeners as grid is scrolling rows
        </li>
        <li>took events out of rows (same trick as with taking out cells) with the exception of hover listeners</li>
        <li>icon images are now cloned, rather than creating new ones each time one is needed</li>
    </ul>

    <h4>Bug Fixes</h4>

    <ul>
        <li>groupRowRendererFramework, groupRowInnerRendererFramework and fullWidthRowRendererFramework were getting
            ignored when getting set as properties in Angular 2 and React.
        </li>
        <li>innerRenderer (for group rows) was not getting destroy called, is now.</li>
        <li>when doing full row edit, calling api.stopEditing() fired event rowValueChanged for each row, not it only
            calls it for the editing row.
        </li>
        <li>when using tree data, an there were only groups (all groups were empty), the 'no rows' overlay was showing.
            Not is doesn't sort when only groups.
        </li>
        <li>api.ensureIndexVisible() will now also render the rows in the same action, previously you had to wait for
            the grid to pick up the scroll event (which happened immediatly after) to render the rows. This causes
            problems if you wanted to access the row immediatly after ensuring it was visible (eg to start editing).
        </li>
        <li>Formatted values can now be empty strings, previously empty strings were ignored and the original value was
            presented.
        </li>
        <li>grid options was missing onRowValueChanged property</li>
        <li>fixes <a href="https://www.ag-grid.com/forum/showthread.php?tid=4303">this issue</a>, when left and right
            pinned on IE, left pinned didn't sync scroll with body always.
        </li>
        <li>Set Filter - 'Select All' checkbox was not getting cleared when all items were unchecked.</li>
        <li>Set Filter - When new rows got loaded into the grid, the filter icon was not cleared down if filter was
            reset. Now it is.
        </li>
    </ul>

    <h4>Version 6.2.1</h4>
    <h4>ag-grid 6.2.1, ag-grid-enterprise 6.2.1</h4>

    <li>Bugfix - range select threw error for virtual pagination when drag went below the available rows.</li>
    <li>Bugfix - avg aggregation function was failing when value was undefined or null.</li>
    <li>Bugfix - export to CSV was failing when doing count aggregation on data, now fixed.</li>

    <h2>Version 6.2.x</h2>

    <li>New Feature - <a href="../javascript-grid-touch/">Touch support.</a></li>
    <li>New Feature - <a href="../javascript-grid-column-definitions/#defaultProperties">Default column and column group
            definitions</a>. So instead of declaring common properties in each column, define them once in the default.
    </li>
    <li>New Feature - <a href="../best-angular-2-data-grid/#ng2markup">Angular 2 Grid Creation via Markup</a>. Option to
        create Grids with Markup (declaratively).
    </li>
    <li>Enhancement - When using checkbox selection in groups, the property cellRendererParams.checkbox can be
        a function, so you can be selective on which rows have checkboxes.
    </li>
    <li>Enhancement - <a href="../javascript-grid-viewport/">Viewport</a> row model now works with <i>getRowNodeId()</i>,
        so selection can now work with business keys.
    </li>
    <li>Enhancement - Removed sorting the order of value columns when in pivot mode - now value columns displayed in
        order added.
    </li>
    <li>Enhancement - Added <a href="../javascript-grid-pivoting/#orderingPivotColumns">'pivotComparator'</a> to allow
        defining order of pivot columns.
    </li>
    <li>Enhancement - Added <a href="../javascript-grid-tool-panel/#suppressExample">'suppressToolPanel'</a> to column
        definitions, so suppress columns from appearing in the toolpanel.
    </li>
    <li>Enhancement - headerValueGetter now also works for column groups.</li>
    <li>Enhancement - Added <a href="../javascript-grid-pivoting/#manipulatingSecondaryColumns"> <i>processSecondaryColDef</i>
            and <i>processSecondaryColGroupDef</i></a> for pivoting, to allow modification of the pivot columns.
    </li>
    <li>Enhancement - Added <i>onlySelectedAllPages</i> to CSV export - so if doing pagination, exports selected across
        all pages.
    </li>

    <li>Bugfix - suppressSorting in Set Filter was not getting used, now fixed.</li>
    <li>Bugfix - export to CSV was failing when doing avg aggregation on data, now fixed.</li>
    <li>Bugfix - single click editing was resetting the edit when you clicked on an edited cell. This was introduced in
        the last release with 'fullRowEdit'. Now fixed.
    </li>
    <li>Bugfix - when grouping, full width rows were not getting mouse scroll events processed, noe fixed.</li>
    <li>Bugfix - when pasting, the cells did not get refreshed if first row was not editable.</li>
    <li>Bugfix - when editing, the grid was working on ctrl+v, ctrl+c, ctrl+x, ctrl+d, which messed up the edit. Now the
        grid ignores these if you are editing the cell.
    </li>

    <h2>Version 6.1.1</h2>

    <h4>ag-grid-angular 6.1.1</h4>

    <li><a href="../best-angular-2-data-grid/#aot">AOT support</a> - AOT is now an option when using ag-grid-angular.
    </li>

    <h2>Version 6.1.x</h2>

    <li>New Feature - <a href="../javascript-grid-cell-editing/#fullRowEdit">Full Row Editing</a> - to enable all cells
        in a row to be editable at the same time.
    </li>
    <li>New Property - colDef.suppressNavigable - set to true (or function to return true) to stop the cell getting
        focus when tabbing around.
    </li>
    <li>New Event - <i>rowValueChanged</i> - gets fired after a full row is updated.</li>
    <li>ag-grid-angular - Upgrade to Typescript 2</li>

    <h2>Version 6.0.x</h2>

    <h4>ag-Grid 6.0.1, ag-Grid-Enterprise 6.0.1, ag-Grid-React 6.0.1, , ag-grid-angular 6.0.1</h4>

    <p>
        Version 6.0.x brings the following changes:
    <ol>
        <li>Bug Fixes and Improvements</li>
        <li>Improved React and Angular 2 Support</li>
        <li>Refactored Filters</li>
    </ol>
    Below goes through each of these in turn.
    </p>

    <h3>1 - Bug Fixes and Improvements</h3>

    <li>Breaking Change: React now uses props directly for the init params in filters, cellRenderers and cellEditors.
    </li>
    <li>Breaking Change: Filter interface now called IFilter.</li>
    <li>Breaking Change: api.getFilterApi() is now api.getFilterInstance().</li>
    <li>Breaking Change: setColumnVisible() no longer accepts ColDefs as an argument. colIds or Columns are the
        available options now.
    </li>
    <li>Enhancement: Tooltips now don't show if null or undefined.</li>
    <li>Enhancement: Added api.getFloatingTopRowCount(), api.getFloatingBottomRowCount(), api.getFloatingTopRow(index),
        api.getFloatingBottomRow(index) for accessing pinned rows
    </li>

    <h3>2 - Improved React and Angular 2 Support</h3>

    <p>
        Lots of work has been done to support natively React and Angular 2, to allow you to plug in React
        and Angular 2 cellEditors and cellRenderers simply. Now, instead of using cellRenderer, you use
        cellRendererFramework as follows:
        <snippet>
// when not using React or Angular 2
colDef.cellRenderer = MyCellRenderer;

// in v6, you can use React or Angular 2 components directly
colDef.cellRendererFramework = MyReactCellRenderer; // for React
colDef.cellRendererFramework = MyAngular2CellRenderer; // for Angular</snippet>
        Full details on how get this all working are in the updated React and Angular 2 sections of the docs.
        If you are using Angular 2 or React, it's best you read these sections to see how to do things
        in the new improved way.
    </p>

    <h3>3 - Changes to Filters</h3>

    <p>
        How filters were working were out of line with how cellRenderers and cellEditors were working. This is
        because filters were done as one of the first items in ag-Grid and the interface has not changed. The
        changes in this release bring them in line with the newer 'Component Model' that is in ag-Grid, so they
        now behave in the same way as cellRenderers and cellEditors, including fitting in with React and
        Angular 2 components, the same way the renderers and editors do. The main core changes are as follows:
        <ol>
            <li><b>If you were providing a Filter API</b> then be aware the API is no longer a separate part of the
                component. Instead it is now possible to get a reference
                to the filter component directly via api.getFilterInstance(colKey). From here you can access all
                methods on the filter component. So if you want to add extra items to (what used to be) the API, now
                you just add them directly to your filter component.
                <snippet>
// eg if your filter was like this:
function MyFilter() {}

MyFilter.prototype.getApi = function() {
    return {
        getModel: function() {
            ...
        },
        setModel: function(model) {
            ...
        },
    }
}

// it should now be like this:
function MyFilter() {}

MyFilter.prototype.getModel = function() {
    ...
}

MyFilter.prototype.setModel = function(model) {
    ...
}</snippet>
            </li>
            <li><b>If you were providing custom params to your custom filters</b> then these used to be passed to the
                filter embedded into the filter params.
                Now the custom params are added to the main params.
                <snippet>
// eg when you define this:
colDef = {
    ...
    filter: MyFilter,
    filterParams: {a: 'A', b: 'B'}
}

// the old way resulted in:
params = {
    column: Column,
    ...
    filterParams: {
        a: 'A',
        b: 'B'
    }
}

// but now it results in:
params = {
    column: Column,
    ...
    a: 'A',
    b: 'B'
}</snippet>
            </li>
            <li>
    <p>
        The constants for Number and Text filters are now strings and not numbers. If you were storing
        user preferences for these filters, you need to map the old numbers to the new string values.
    </p>
    <p>
        For Number filter, the mapping is as follows:
    <ul>
        <li>1 => 'equals'</li>
        <li>2 => 'notEqual'</li>
        <li>3 => 'lessThan'</li>
        <li>4 => 'lessThanOrEqual'</li>
        <li>5 => 'greaterThan'</li>
        <li>6 => 'greaterThanOrEqual'</li>
    </ul>
    </p>
    <p>
        For Number filter, the mapping is as follows:
    <ul>
        <li>1 => 'contains'</li>
        <li>2 => 'equals'</li>
        <li>3 => 'notEquals'</li>
        <li>4 => 'startsWith'</li>
        <li>5 => 'endsWith'</li>
    </ul>
    </p>
    </li>
    </ol>
    </p>
    <p>
        All the examples are up to date with the new way of doing things.
    </p>

    <h3>Version 5.4.x</h3>

    <h4>ag-Grid 5.4.0, ag-Grid-Enterprise 5.4.0, ag-Grid-React 5.4.0, , ag-grid-angular 5.4.0</h4>

    <li>Enhancement: added API for startEditing().</li>
    <li>Enhancement: now rememberGroupStateWhenNewData works when inserting/removing rows, ie group open/closed state is
        now kept when updating rows.
    </li>
    <li>Enhancement: added columnKeys to api.copySelectedRowsToClipboard(), so you can choose which columns get used.
    </li>
    <li>Enhancement: columns can now be reordered when in pivot mode (previously they were static).</li>
    <li>Enhancement: ag-grid-react - now you pass in parent component to React cellRenderer - makes cellRenderer work
        with React Router and also should give performance improvements.
    </li>
    <li>Enhancement: export to csv now allows you to specify particular columns.</li>
    <li>Enhancement: export to csv now includes floating top and floating bottom rows.</li>
    <li>Enhancement: toolPanel has lazy intialisation, so now if toolPanel not showing, it doesn't initialise.</li>
    <li>Bugfix: copy range to clipboard was not taking in group values when group key was using valueGetter.</li>
    <li>Bugfix: removed styles from border layout templates, used css classes instead. Fixed bug where chrome complained
        about 'styles violate Content Security Policy #1093'
    </li>
    <li>Bugfix: for menus, sub menu was appearing in wrong place when normal 'display to right' position was off
        screen.
    </li>

    <h3>Version 5.3.x</h3>

    <h4>ag-Grid 5.3.1, ag-Grid-Enterprise 5.3.1</h4>
    <li>Enhancement: added 'Copy with Headers' option to context menu, to copy header values when copying to
        clipboard.
    </li>
    <li>Enhancement: added <a href="../javascript-grid-master-detail/#flowerNodes">'Flower Nodes'</a> concept, to allow
        easy mechanism for providing expandable rows for master / detail and fullWidth.
    </li>
    <li>Bugfix: onDragStopped was getting called on header button clicks, even if not dragging was taking place.</li>

    <h4>ag-Grid 5.3.0, ag-Grid-Enterprise 5.3.0</h4>

    <li>Enhancement: new feature - <a href="../javascript-grid-master-detail">Full Width Rows and Master / Details</a>
    </li>
    <li>Enhancement: setFilter - now the search box is focused when you open setFilter</li>
    <li>Breaking Change: if using groupUseEntireRow=true, you will notice the group row is now a fullWidth row, hence
        will span pinned sections and not scroll horizontally. This is by design. Functionality should be the same,
        just the grid will look a big different.
    </li>
    <li>Bugfix: Aggregation function 'count' was only working with number values. Now works with any value type.</li>
    <li>Bugfix: forPrint was broken with last release, now fixed again.</li>

    <h3>Version 5.2.x</h3>

    <h4>ag-Grid 5.2.0, ag-Grid-Enterprise 5.2.0, ag-grid-angular 5.2.0</h4>

    <h4>Bug Fixes and Angular 2 Cell Rendering</h4>

    <li>Enhancement: Now you can create cellRenderers using Angular 2. See <a href="../best-angular-2-data-grid/">Getting
            Started Angular 2</a></li>
    <li>Enhancement: Now context menu appears when you click outside of the rows, including when no rows present.</li>
    <li>Enhancement: Added columnApi.autoSizeAllColumns().</li>
    <li>Enhancement: Allowed following methods to work with pagination: forEachLeafNode, forEachNodeAfterFilter,
        forEachNodeAfterFilterAndSort.
    </li>
    <li>Enhancement: Callbacks getRowStyle and getRowClass get called after the data is set as well as when the row is
        created.
        Helps viewport and infinite pagination, to add styles and classes after the rows are loaded.
    </li>
    <li>Enhancement: external filter present can not be true when grid initialises</li>
    <li>Enhancement: updated virtual pagination example, to show graceful deletion</li>
    <li>Bugfix: setFilter was not removing entries correctly when other filters were set if filterParams was missing.
    </li>
    <li>Bugfix: when browser was vertically scrolled, the ghost icon while dragging was not positioned correctly.</li>
    <li>Bugfix: when groupSelectsChildren=true, was failing to update top parent rows when 3 or more columns grouped.
    </li>
    <li>Bugfix: api.getVirtualPageState() was returning undefined, now works.</li>
    <li>Bugfix: case issue with iDatasource, it was getting imported as iDataSource in places.</li>

    <h3>Version 5.1.x</h3>

    <h4>ag-Grid 5.1.2, ag-Grid-Enterprise 5.1.2</h4>

    <li>Enhancement: Adding and removing of rows now allowed in normal row model. See new documentation page on 'Insert
        & Remove'.
    </li>
    <li>Enhancement: Virtual Pagination engine is rewritten. New and improved allowing inserting of rows and refreshing
        of the cache and other smaller pieces. See the documentation page on virtual pagination for details.
    </li>
    <li>Breaking Change: Removed datasource properties maxConcurrentDatasourceRequests, maxPagesInCache, overflowSize
        and pageSize.
        Replaced with grid properties maxConcurrentDatasourceRequests, maxPagesInCache, paginationOverflowSize,
        paginationInitialRowCount, paginationPageSize.
    </li>
    <li>Enhancement: node id's are now strings, not numbers. This is to allow you to give nodes the same id's as your
        data store.
    </li>
    <li>Enhancement: new callback getRowNodeId(), for setting node ids to what you want. Useful for pagination and
        virtual pagination
        to allow for selection of rows when doing server side sorting and filtering.
    </li>

    <h3>Version 5.0.x</h3>

    <h4>ag-Grid 5.0.7, ag-Grid-Enterprise 5.0.7</h4>
    <li>Enhancement: cellRenderer for richSelect is no longer mandatory, now default text renderer used in richSelect if
        no cellRenderer specified
    </li>
    <li>Enhancement: renamed all 'aggregation' (eg getAggregationColumns) method to 'value' (eg getValueColumns), the
        documentation was right, methods were out of sync
    </li>
    <li>Enhancement: now colId's can be numbers, not just strings</li>
    <li>Enhancement: added gridOption.autoSizePadding, to allow wider columns after autosize if default is to narrow
    </li>
    <li>Bugfix: api.setHeaderHeight() was not working, now fixed.</li>
    <li>Bugfix: fixed issue where hidden grid (it not visible) was not rendering all rows it should.</li>
    <li>Bugfix: columnApi.getColumnState() was setting aggFunc on columns that were aggregated but then later removed.
    </li>
    <li>Bugfix: largeTextCellEditor - when value was undefined was displaying 'undefined', now displays blank.</li>
    <li>Bugfix: api.deselectAll() was not deselecting groups when gridOptions.groupSelectsChildren=true.</li>
    <li>Bugfix: tab navigation was not working with virtual columns when column been tabbed onto was not visible.</li>

    <h4>ag-Grid 5.0.6, ag-Grid-Enterprise 5.0.6</h4>
    <li>Enhancement: added columnApi.getAllDisplayedVirtualColumns(), so you can check what columns are rendered due to
        column virtualisation.
    </li>
    <li>Bugfix: Angular 1 was compiling row multiple times, meant angular listeners were firing more than once. Now it
        compiles each cell exactly once when cell is created.
    </li>

    <h4>ag-Grid 5.0.4, ag-Grid-Enterprise 5.0.4</h4>
    <li>Bugfix: hitting space sometimes (noticed on firefox) sent grid scrolling down when it should select the row</li>

    <h4>ag-Grid 5.0.3, ag-Grid-Enterprise 5.0.3</h4>
    <li>Bugfix: pivot was not working with groupUseEntireRow=true</li>

    <h4>ag-Grid 5.0.2, ag-Grid-Enterprise 5.0.2</h4>
    <li>Enhancement: changed comparison (or sorting) to use localeCompare for strings</li>
    <li>Enhancement: now pivot shows 'n/a' when no value columns is enabled</li>
    <li>Enhancement: now 'autosize cols' considers the header width, not just the row content</li>
    <li>Bugfix: cellRenderer with text field was not allowing editing in text field</li>

    <h4>ag-Grid 5.0.1, ag-Grid-Enterprise 5.0.1</h4>
    <li>Major Enhancement: Enterprise feature - Pivoting</li>
    <li>Major Enhancement: Free feature - Column Virtualisation</li>
    <li>Breaking Change: colDef.suppressAggregation and colDef.suppressRowGroup are gone, replaced with enableRowGroup,
        enablePivot and enableValue
    </li>
    <li>Enhancement: added events dragStarted and dragStopped</li>
    <li>Enhancement: new property suppressUseColIdForGroups</li>
    <li>Enhancement: Safari now uses animation frames for scrolling (Chrome doesn't need it!!)</li>
    <li>Enhancement: when no using cellRenderer, node.textContent used instead of element.innerHTML, for security
        reasons to prevent malicious injection of Javascript.
    </li>
    <li>Enhancement: new property 'suppressCopyRowsToClipboard' so selected cells will be copied to clipboard and not
        the selected row, if that's what user wants.
    </li>
    <li>Enhancement: popups are restricted to inside the grid when they appear - eg 'richSelect' doesn't appear outside
        of grid
    </li>
    <li>Enhancement: now get/set column state takes into consideration column order</li>
    <li>Enhancement: column virtualisation, with property suppressColumnVirtualisation to turn it off</li>
    <li>Enhancement: eGridCell added to params of cellEditor</li>
    <li>Enhancement: added property layoutInterval, to allow overriding of the layout interval.</li>
    <li>Enhancement: added property 'suppressFocusAfterRefresh', so grid doesn't set focus back on focused cell if not
        required.
    </li>
    <li>Enhancement: added properties toolPanelSuppressRowGroups, toolPanelSuppressValues, toolPanelSuppressPivots,
        toolPanelSuppressPivotMode
    </li>
    <li>Enhancement: pivot panel now on top alongside group panel</li>
    <li>Enhancement: new property colDef.openByDefault - set to true on column groups to have them open be default if
        expandable
    </li>
    <li>Enhancement: new grid property functionsReadOnly - makes the gui for group, pivot and values read only</li>
    <li>Enhancement: added suppressFilter to colDef, to allow turning filtering off for a particular column</li>
    <li>Bugfix: AngularJS 1.x bindings were not getting cells updated when columns added and removed</li>
    <li>Bugfix: Popups were triggering a scrollbar to flicker on and off when showing (eg show column menu, a scrollbar
        appeard and then dissappeared in the grid)
    </li>
    <li>Bugfix: rowSelectionChanged was not firing on shift select</li>
    <li>Bugfix: isCancelBeforeStart and isCancelAfterEnd were not working for popup editors</li>
    <li>Bugfix: virtual pagination was not working when setting datasource as a property (it worked if setting
        datasource via api.setDatasource())
    </li>

    <h3>Version 4.2.x (ag-Grid 4.2.7, ag-Grid-Enterprise 4.2.11)</h3>
    <li>Bugfix: group selection was selecting groups when 'groupSelectsChildren=false' giving strange behaviours</li>

    <h3>Version 4.2.x (ag-Grid-Enterprise 4.2.10)</h3>
    <li>Bugfix: aggregation type 'sum' was giving incorrect results</li>

    <h3>Version 4.2.x (ag-Grid 4.2.6, ag-Grid-Enterprise 4.2.9)</h3>
    <li>Enhancement: For Enterprise, License message no longer printed to screen when license is correct.</li>
    <li>Enhancement: Added colDef.tooltipField, so tooltip can be set on the cell.</li>
    <li>Enhancement: Icons for drag and drop of columns are now all configurable.</li>
    <li>Enhancement: quickFilter is now a property, so can be set during initialisation.</li>
    <li>Enhancement: new API method forEachLeafNode()</li>
    <li>Enhancement: added suppressQuotes option to csv export</li>
    <li>Enhancement: added colDef.keyCreator, to allow grouping and set filter on complex objects</li>
    <li>Enhancement: pagination datasource now gets context as a parameter</li>
    <li>Enhancement: added largeText cell editor as an 'out of the box' editor</li>
    <li>Enhancement: enhancements to Material Design look and feel</li>
    <li>Enhancement: added api.stopEditing()</li>
    <li>Bugfix: SetFilter was failing when you loaded more data into the grid - filter didn't populate with new values
        correctly.
    </li>

    <h3>Version 4.2.x</h3>

    <h4><b>Big Changes</b></h4>
    <li>Enhancement: New theme for Bootstrap</li>
    <li>Enhancement: New theme for Material Design</li>
    <li>Enhancement: Dark theme revised</li>
    <li>Enhancement: you can now move groups of columns (only makes sense when grouping your columns):
        <ul>
            <li>Drag groups of columns from within table to move</li>
            <li>Drag groups of columns from column toolPanel</li>
            <li>Drag groups of columns to 'row group panel' to row group by multiple columns</li>
        </ul>
    </li>
    <li>Enhancement: Shift multi-select - a range of rows can be selected together by holding down shift (does not work
        with virtual pagination or viewport, only normal 'client-side row model').
    </li>

    <h4><b>Breaking Change</b></h4>
    <li>Enhancement: groupAggFunction is gone, replaced with providing your own colDef.aggFunc functions - this was
        needed to pave the way for pivoting functionality. See docs for details on how to use.
    </li>

    <h4><b>Small Changes</b></h4>
    <li>Enhancement: better default icons for row groups and checkbox selection</li>
    <li>Enhancement: row selection 'checked' icons are now icons and not browser checkbox. they are now also
        customisable via changing icons.
    </li>
    <li>Enhancement: changed icons for drag pinning, now when you drag a column to the edge, the drag icon changes to
        'pinned' so use knows the column is about to be pinned.
    </li>
    <li>Enhancement: new property for column group called 'marryChildren', when true then group cannot be split up by
        moving children.
    </li>
    <li>Enhancement: toolpanel now has icon beside column group to show visibility of the group. icon is also clickable
        to set visible / hidden all children of the group
    </li>
    <li>Enhancement: editing now has methods isCancelBeforeStart() and isCancelAfterEnd() to help with lifecycle.</li>
    <li>Enhancement: new property suppressDragLeaveHidesColumns, so when columns dragged out of grid, they are not
        hidden.
    </li>
    <li>Enhancement: new method api.refreshInMemoryRowModel, does a complete refresh of the client-side row model. Useful
        if you need to get the groups worked out again.
    </li>
    <li>Enhancement: default text editor - now 'right' and 'left' key presses do not loose focus on current cell</li>
    <li>Enhancement: added ag-row-hover class for when mouse is over row, so you can highlight rows when mouse is over
        them
    </li>
    <li>Enhancement: new property 'suppressMiddleClickScrolls', so you can listen or 'middle mouse clicks' if you want
        (otherwise middle mouse click is taken by browser to scroll)
    </li>
    <li>Enhancement: new property 'suppressPreventDefaultOnMouseWheel' so you can allow browser to handle mouse wheel
        events - useful if your grid has no vertical scrolls and you want the mouse to scroll the browser page
    </li>
    <li>Enhancement: build in renderer 'animiateShowChange' now highlights changes when values are not numbers (eg
        strings).
    </li>

    <h4><b>Bug Fixes</b></h4>
    <li>Bug fix: when dragging columns out of rowGroupPanel, GUI wasn't redrawing correctly and crashing, causing
        inconsistent state and console error messages
    </li>
    <li>Bug fix: disabled menu items were still allowed to be clicked</li>
    <li>Bug fix: you can now tab into and out of the grid.</li>
    <li>Bug fix: default text editor was displaying 'undefined' when initial value was missing. now showing blank.</li>

    <h3>Version 4.1.x patch (ag-Grid 4.1.5, ag-Grid-Enterprise 4.1.4)</h3>
    <li>Bug fix: when setting columns directly on gridOptions, the groupByPanel was not initialised correctly.</li>
    <li>Bug fix: row group panel was not initialising correctly.</li>

    <h3>Version 4.1.x patch (ag-Grid 4.1.4, ag-Grid-Enterprise 4.1.3)</h3>
    <li>Bug fix: api.deselectAll() was not calling onSelectionChanged, it is now.</li>
    <li>Bug fix: defaultExpanded setting was not been used, it is now.</li>
    <li>Bug fix: popup editor was not working, init() was not called.</li>

    <h3>Version 4.1.x</h3>

    <b>Big changes</b>
    <li>Vamped up Cell Editing and Rendering. See new documentation pages for <a href="../javascript-grid-cell-editing">Cell
            Editing</a> and <a href="../javascript-grid-cell-rendering-components">Cell Rendering</a></li>
    <li>New row model called <a href="../javascript-grid-viewport/">Viewport</a>. Designed for views over large data and
        pushing out updates from server to client.
    </li>

    <b>Breaking Change</b>
    <li>If you are using the built in groupCellRenderer, check the examples on how to configure it. The
        colDef.cellRenderer property is broken up into cellRenderer and cellRendererParams.
    </li>

    <b>Small changes</b>
    <li>Enhancement: New event - viewportChanged - gets called when the rendered rows changes, either
        due to scrolling, new data or grid resize. Using this, you know exactly what divs will be rendered in the DOM.
    </li>
    <li>Navigation: When not editing, tab moves between cells. Shift+tab goes backwards.</li>
    <li>Editing: Hitting any key started editing.</li>
    <li>Enhancement: New api methods: showColumnMenuAfterButtonClick(colKey, buttonElement),
        showColumnMenuAfterMouseClick(colKey, mouseEvent)
    </li>
    <li>Enhancement: new function colDef.valueFormatter - value formatting responsibility used to tie in cellRenderer,
        now it's broken out into valueFormatter, allows reusing cellRenderers against different formats.
    </li>
    <li>Enhancement: added 'destroyFilter' api</li>
    <li>Enhancement: columnApi.addRowGroupColumn() and columnApi.removeRowGroupColumn() now work off colKey and not
        columns, so you can pass in colDefs, colIds or columns (previously was just columns)
    </li>
    <li>Enhancement: New methods: columnApi.addRowGroupColumns(), columnApi.removeRowGroupColumns(),
        columnApi.setRowGroupColumns()
    </li>
    <li>Enhancement: When you refresh the grid, doing a refresh doesn't loose the focused cell if a cell has browser
        focus.
    </li>
    <li>Bugfix: Row grouping was not working when colId was provided.</li>
    <li>Bugfix: api.setFocusedCell() method now sets browser focus (previous was just graphically highlighting the
        cell)
    </li>

    <h3>Version 4.0.x (ag-Grid 4.0.5, ag-Grid-Enterprise 4.0.7)</h3>
    <li>Bugfix: Status bar was not calculating 'min' correctly.</li>
    <li>Enhancement: Now ctrl+d will copy down the selected range, similar to Excel</li>
    <li>Deprecated: cellRendererParams.addRenderedRowListener() is now deprecated. If you want callback methods for
        cellRendering, use the cellRenderer Component pattern.
    </li>

    <h3>Version 4.0.x (ag-Grid 4.0.4)</h3>

    <li>Bugfix: Firefox was showing native context menu on top of grids context menu.</li>
    <li>Bugfix: Drag event is only cancelled if source is image, allows user to implement custom drag event.</li>
    <li>Bugfix: Angular compiling is now done after row is inserted into the DOM.</li>
    <li>Bugfix: Fixed horizontal scroll on trackpads when mouse over pinned column.</li>

    <h3>Version 4.0.x (ag-Grid 4.0.2, ag-Grid-Enterprise 4.0.4)</h3>

    <li>Bugfix: When filter was 'zero' (for number filer) is was not saving correctly when using 'getFilterModel()'.
    </li>
    <li>Bugfix: Event 'gridSizeChanged' was not getting called when width of grid changed, only height.</li>
    <li>Bugfix: Renamed 'PopupService.js' to 'popupService.js -> caused issued for some import styles.</li>
    <li>Bugfix: Bug in virtual pagination, grid was not initialising when datasource set in gridOptions.</li>
    <li>Bugfix: Mouse double click was not working correctly in firefox.</li>
    <li>Bugfix: Enterprise filters were not getting params in the 'afterGuiAttached' method.</li>

    <li>Enhancement: setColumnState() now returns a boolean, false if one or more columns could not be found.</li>
    <li>Enhancement: added API methods copySelectedRowsToClipboard() and copySelectedRangeToClipboard().</li>
    <li>Enhancement: changed how auto-range aggregations work - blank cells not counted in count, and non-number cells
        not used for avg
    </li>

    <h3>Version 4.0.x</h3>

    <!-- NEW FEATURES -->
    <h4>New Features</h4>

    <li>The grid has moved to Enterprise vs Free.</li>

    <li>Enterprise Feature: Enhanced enterprise column menu, in addition to filtering there is now a menu and also
        column management.
    </li>

    <li>Enterprise Feature: Row group panel on top of grid, so you can drag columns to here to group.</li>

    <li>Enterprise Feature: You can now drag columns from the tool panel into the grid to make them visible.</li>

    <li>Enterprise Feature: Row grouping and aggregation are no longer in the tool panel as they can be done
        bia column menu (grouping and aggregation) or dragging to the row group panel (grouping).
    </li>

    <li>Enterprise Feature: Context Menu</li>

    <li>Enterprise Feature: Range Selection</li>
    <li>Enterprise Feature: Enterprise column menu</li>
    <li>Enterprise Feature: Clipboard interaction</li>
    <li>Enterprise Feature: Status bar</li>

    <li>Tool panel, set filter, row grouping and aggregation are now only available in Enterprise version
        of ag-Grid.
    </li>

    <!-- ENHANCEMENTS -->
    <h4>Enhancements & Changes</h4>

    <li>Performance improvements - no longer attaching listeners to each cell, so when scrolling, the dom is not
        been ripped up with adding and removing listeners. Instead the grid has one listener (eg for mouse click),
        and when the click happens, the grid then works out which cell it was for.
    </li>

    <li>rowNode is now a class object with methods (previously it only have properties, a simple data object).
        Methods now include: setSelected(), isSelected(), addEventListener(), removeEventListener(),
        resetQuickFilterAggregateText(), depthFirstSearch(callback).
    </li>

    <li>RowNode now has method 'setSelected'. This should now be used for row selection over the gridApi.selectXXXX()
        methods.
    </li>

    <li>api.getSelectedNodesById gone, use api.getSelectedNodes instead</li>

    <li>Event rowDeselected gone, now event rowSelected gets fired for both selected and deselected. Check node state
        to see if row is selected or not.
    </li>

    <li>Event selectionChanged no longer contains the selected rows or nodes. Use the API to look these up if needed.
        Preparing these lists took CPU time, so it's best they are only prepared if needed.
    </li>

    <li>Concept of 'suppressEvents' was dumped for row selection. No other event event type had this feature, and it
        was out of sync with how web components work in general. If you don't want to be notified of an event, then
        remove
        your event listener.
    </li>

    <li>api.addVirtualRowListener is gone. Instead for row selection/deselection listening, use node.addEventListener(),
        and for virtual row removed, use api.addRenderedRowListener()
    </li>

    <li>New API methods: getFirstRenderedRow() and getLastRenderedRow(), to know the first and last rows in the DOM
        (the grid only renders enough rows (plus a buffer) to show what's visible for performance reasons).
    </li>

    <li>Introduced property modelType, set to 'pagination' or 'virtual' for pagination and virtual pagination.
        This replaces virtualPaging, as virtual was a boolean when in fact we need to distinctly model three modes
        of operation: Normal, Pagination and Virtual Pagination.
    </li>

    <li>rowsAlreadyGrouped replaced with getNodeChildDetails. If you are providing already grouped data to the grid,
        see the new section 'Tree Data' on how this is now done. It had to change because Node is now an object with
        functinality, so you can't just pass in JSON an expect them to be treated like nodes.
    </li>

    <li>Renamed: columnApi.getState()/setState()/resetState() to
        columnApi.getColumnState()/setColumnState()/resetColumnState()
    </li>

    <li>Floating rows can now be selected and navigated.</li>

    <li>processRowPostCreate callback, so you can process the grid row after it is created. Handy for adding attributes
        or other stuff to the row after create.
    </li>

    <li>Now CSV export allows you to format cells on their way out. Handy if you want to import into Excel and need to
        make dates, for example, into Excel formatted dates.
    </li>

    <li>New colDef properties suppressAggregation and suppressRowGroup for suppressing aggregation and row group for
        particular columns
    </li>

    <li>Added new property: suppressFieldDotNotation</li>

    <li>Took out property groupHideGroupColumns, if you don't want a column to be shown, just hide it. This feature was
        not necessary and caused complexity in the design.
    </li>

    <li>Removed api.refreshRowGroup() -> it wasn't documented, and I can't remember why I put it in, refreshing the grid
        has the same effect.
    </li>

    <li>api.getValue(colKey, node) replaces api.getValue(colDef, node, data), the colDef and data were 'old design',
        newer method works much better.
    </li>

    <li>api.getFocusedCell() -> now returns rowIndex and Column (used to return colDef and rowNode, colDef not needed as
        you can get from Column, rowNode not needed as you can lookup using rowIndex)
    </li>

    <li>rowNode attributes floatingTop and floatingBottom removed, now floating is no longer a boolean, it's a string
        that can be 'top' or 'bottom' if floating.
    </li>

    <li>setFocusedCell(rowIndex, colId) is now setFocusedCell(rowIndex, colKey, floating).</li>

    <!-- BUG FIXES -->
    <h4>Bug Fixes</h4>

    <li>Text filter 'ends with' was not working correctly if search string appeared twice in the text.</li>

    <li>forPrint was occasionally given 'Uncaught TypeError: Cannot read property 'appendChild' of undefined'. now
        fixed.
    </li>

    <!-- NO VIRTUAL DOM -->
    <h4>RIP Virtual DOM</h4>

    Took out virtual dom. This was an implementation detail, no change in how you interface with the grid.
    It only made an improvement on IE, and now that we are using delayed scrolling, IE is
    working fast enough now. In addition, I have now tested with Windows 10 and Edge (the IE replacement) and
    it's working very fast. So the virtual DOM was giving very little benefit and was 'getting in the way' of a clean
    design. So I've favored a clean design rather than a more complex design just to get it faster in IE. If
    you want to see how little difference a virtual DOM made, see the Angular Connect 2015 talk I gave.


    <h3>Version 3.3.3</h3>
    <li>Bug fix: Pinned rows were not colored correctly</li>

    <h3>Version 3.3.2</h3>
    <li>Bug fix: Was not exporting initialiseAgGridWithAngular1() and initialiseAgGridWithWebComponents() with
        CommonJS
    </li>
    <li>Buf fix: Period in fields (ie address.line1) was not working for editing.</li>

    <h3>Version 3.3.0</h3>
    <li>Minor: headerClass (column definition) can now be provided for column groups.</li>
    <li>Major: If using Pure JavaScript "new ag.grid.Grid()", it's now "new agGrid.Grid()".</li>
    <li>Major: Event 'ready' is now called 'gridReady'</li>
    <li>Major: Angular 1 - you now need to initialise the grid via agGrid.initialiseAgGridWithAngular1(angular)</li>
    <li>Major: Web Components - you now need to initialise the grid via agGrid.initialiseAgGridWithWebComponents()</li>
    <li>Major: Angular 2 - Dropped support for UMD version of Angular</li>
    <li>Major: Angular 2 - Now supports CommonJS and ECMA 6 module loading</li>
    <li>Minor: BugFix: forPrint was not sizing headers correctly when doing grouped columns.</li>
    <li>Major: Added sorting to groups</li>
    <li>Minor: Added minColWidth and maxColWidth grid properties. Impacts all columns if set.</li>
    <li>Major: Column no longer has 'index' attribute, as the columns moving now has no meaning. Use 'colId' to identify
        columns.
    </li>
    <li>Major: api.ensureColIndexVisible(index) replace with api.ensureColumnVisible(colKey)</li>
    <li>Major: Focused cell not longer has attribute colIndex, instead has attribute colId.</li>
    <li>Major: Movable columns via dragging the column header.</li>

    <li>Major Build Changes:
        <ul>
            <li>CSS now bundled in ag-Grid.js file</li>
            <li>Took out TypeScript internal modules</li>
            <li>Moved to ECMA 6 style imports (instead of require)</li>
            <li>Moved to WebPack for bundling</li>
            <li>Moved Angular 2 component to new project</li>
        </ul>
    </li>

    <h3>Version 3.2.0</h3>
    <li>Minor: New event rowGroupOpened, for when row groups are opened / closed.</li>
    <li>Minor: Bug fix - pinning was not saved during columnApi.getState()</li>
    <li>Minor: Added 'typings' to package.json, so TypeScript can pick up typings from node module</li>
    <li>Minor: groupDefaultExpanded must be number (used to be number or boolean). Set to -1 instead of 'true' for same
        effect.
    </li>
    <li>Minor: addVirtualRowListener - now takes an event type and a function, so has similar pattern to normal event
        listeners.
    </li>
    <li>Minor: New method 'destroy' added to custom filters. If you need to do cleanup, put it in the destroy method.
    </li>
    <li>Minor: Took out 'agGridGlobalFunc()', should use ag.grid.Grid() instead.</li>

    <h3>Version 3.1.2</h3>
    <li>Minor: New column API methods: getLeftDisplayedColumnGroups(), getCenterDisplayedColumnGroups(),
        getRightDisplayedColumnGroups(), getAllDisplayedColumnGroups()
    </li>

    <h3>Version 3.1.1</h3>

    <li>Minor: Added 'columnSeparator' to CSV Export</li>
    <li>Minor: Added starting character of '\ufeff' to CSV Export (for Excel compatibility)</li>
    <li>Minor: Bug fix - gridOptions.isEnableSorting && colDef.suppressSorting were not used in 3.1.0, fixed.</li>

    <h3>Version 3.1.0</h3>

    <li>Minor: New <i>allColumns</i> property for export to csv</li>
    <li>Minor: API method <i>deselectNode()</i> now takes <i>'suppressEvents'</i> parameter.</li>
    <li>Minor: Now <i>colDef.field</i> can had deep references, eg colDef.field = 'owner.firstName'</li>
    <li>Minor: New event <i>gridSizeChanged</i>, gets fired when grid changes size, due to window resize or other
        application state change. Useful if you want to lay out the grid, eg call api.sizeColumnsToFit()
    </li>
    <li>Minor: Bug fix - since v3 columnDefs was mandatory and threw error if missing. Is now optional again.</li>
    <li>Major: Implemented auto-size for column. Now columns can be told to fit their content.</li>
    <li>Minor: New property: suppressParentsInRowNodes - if you don't want parents in the row node tree structure.</li>
    <li>Minor: Fixed up placement of menu icon, it was hitting the header border.</li>
    <li>Major: Rows can have variable heights with new getRowHeight() callback.</li>
    <li>Minor: bugfix - setColState was not restoring 'visible' correctly</li>
    <li>Minor: New APi - columnApi.resetState()</li>
    <li>Major: Implemented column header templates</li>

    <h3>Version 3.0.0</h3>

    <p>
        Version 3 is a major version and has breaking changes. Where possible, the grid will hint if you are using an
        old property.
    </p>

    <ul>
        <li>Major: Grouping of headers is now called 'columnGrouping' and can now take multiple levels of groups.</li>
        <li>Major: Pinning can now be done on the left and right, previously was just the right.</li>
        <li>Major: Row pivoting is now called row grouping. So the two types of grouping are now called Row Grouping and
            Column Grouping. Pivoting was taken out as it wasn't true pivoting. The was done to allow true pivoting to
            happen in a future release and avoid any name clashes.
        </li>
        <li>Major: gridOptions.groupKeys and gridOptions.groupAggFields are now gone. These were duplicated ways of
            setting rowGroups and rowAggregation. The correct (and only non-duplicated way) is to use
            colDef.rowGroupIndex and colDef.aggFunc.
        </li>
        <li>Major: New Column API method setColumnPinned().</li>
        <li>Major: api.refreshPivot() now called api.refreshRowGroup()</li>
        <li>Major: Event EVENT_COLUMN_PINNED_COUNT_CHANGED removed and EVENT_COLUMN_PINNED added.</li>
        <li>Major: Column getState() and setState() now include pinned state.</li>
        <li>Major: Header Height is now height per row, so if 25, and three column groups, total header height is 3x25 =
            75. Before it was total header height (so height was split evenly across the header rows)
        </li>
        <li>Major: gridOptions.groupHeaders is no longer a property, as grouping in the headers is now defined inside
            the column definitions.
        </li>
        <li>Minor: CSS Classes ag-header-cell-grouped and ag-header-cell-not-grouped are no longer used.</li>
        <li>Major: colDef.headerGroupShow is now called colDef.columnGroupShow.</li>
        <li>Major: Icons {headerGroupOpened, headerGroupClosed} now called {columnGroupOpened, columnGroupClosed}</li>
        <li>Major: Column API - columnGroupOpened() renamed to setColumnGroupOpened()</li>
        <li>Major: setColumnVisible(key) now takes a 'key' which can be a colId, field, ColDef object or Column object -
            previously you had to provide a Column object. Also new method setColumnsVisible(listOfKeys) for updating
            batches of columns.
        </li>
        <li>Major: New methods setColumnPinned(key) and setColumnsPinned(listOfKeys) - behave similar to previously
            mentioned 'visible' methods
        </li>
        <li>Major: In get/set column state, pivotIndex is now called rowGroupIndex</li>
        <li>Major: If doing raw Javascript version, then angularGridGlobalFunction() is now deprecated, use "new
            ag.grid.Grid()" method instead.
        </li>
        <li>Major: checkboxSelection (on colDef) can now be a function, so you can use params in the function
            to work out at runtime if the cell should have a checkbox. gridOptions now also has function of the same
            name, so you can configure the grid to have a checkbox in the first column always regardless of the colDef
            (this is what the test drive does).
        </li>
    </ul>

    <h3>Version 2.3.7</h3>
    <li>Minor: Updated AngularJS 1.x 2 to version Beta 0. Example updated to show changes.</li>

    <h3>Version 2.3.5</h3>
    <li>Minor: Overlays can now be disabled via new properties suppressLoadingOverlay and suppressNoRowsOverlay.</li>

    <h3>Version 2.3.4</h3>
    <li>Bug fix: Template cache now working with IE9</li>
    <li>Bug fix: forEachNodeAfterFilter and forEachNodeAfterFilterAndSort were not working properly when grouping.</li>
    <li>Minor: Now set filter can take a comparator.</li>
    <li>Bug fix: Was not possible to add event listeners or set attributes to virtual elements after binding. This is
        now possible.
    </li>

    <h3>Version 2.3.3</h3>
    <li>Bug fix: Setting rowBuffer to zero did not work.</li>
    <li>Bug fix: Export to csv was not managing large exports.</li>
    <li>Minor: Moved Angular 2 examples to alpha 44.</li>

    <h3>Version 2.3.2</h3>
    <li>Bug fix: 'no rows' overlay was blocking column headers, so if showing, couldn't change filter.</li>

    <h3>Version 2.3.1</h3>
    <li>Bug fix: Angular 2 - EventEmitter for rowDeselected was missing.</li>
    <li>Major: Added getBusinessKeyForNode() method, to allow easily identifying of rows for automated testing.</li>
    <li>Minor: Removed declaration of 'module' and 'exports' in main.ts, so no longer clashes with node.ts typics.</li>
    <li>Minor: Fixed headerClass, array of classes was not working</li>

    <h3>Version 2.3.0</h3>
    <li>Major - Introduced 'no rows' message for when grid is empty.</li>
    <li>Major - Introduced custom overlays for 'no rows' and 'loading', so now they can be what you like.</li>
    <li>Major - Moved to AngularJS 1.x 2 alpha 38.</li>
    <li>Major - Took out auto loading of AngularJS 1.x 2 module with JSPM.</li>
    <li>Minor - Exposed global function for initialising Angular 1.x, to use if Angular not available on the global
        scope, eg using JSPM
    </li>
    <li>Minor - Bugfix - rowRenderer was not working when useEntireRow=true</li>

    <h3>Version 2.2.0</h3>
    <li>Major - Implemented 'destroy' API method, to release grids resources. Needed for Web Components and native
        Javascript (AngularJS 1.x lifecycle manages this for you).
    </li>
    <li>Major - Column resize events now have 'finished' flag, so if resizing, you know which event from a stream of
        'dragging' events is the final one.
    </li>
    <li>Major - New event: rowDeselected.</li>
    <li>Major - Now have 'customHeader' and 'customFooter' for export to csv.</li>
    <li>Minor - Now filters are positioned relative to their actual size instead of assuming each filter
        is 200px wide. Now wide filters don't fall off the edge of the grid.
    </li>
    <li>Minor - Bug fix #459 - getTopLevelNodes was called for not reason during filter initialisation which resulted in
        'undefined' error for server side filtering
    </li>

    <h3>Version 2.1.3</h3>
    <li>Minor - Added header to Typescript definitions file and included in Definitely Typed</li>
    <li>Minor - Removed unused 'require' from agList - was conflicting when require defined elsewhere</li>

    <hr/>

    <p>
        <b>23rd Sep</b> ag-Grid 2.0 released - AngularJS 1.x 2 and Web Components supported
    </p>

    <hr/>

    <p>
        <b>13th Sep</b> First pass on AngularJS 1.x 2
    </p>

    <hr/>

    <p>
        <b>6th Sep</b> Floating headers and footers
    </p>

    <hr/>

    <p>
        <b>31th Aug</b> Column API, External Filtering, Excel Like Filtering
    </p>

    <hr/>

    <p>
        <b>16th Aug</b> Master & Slave Grids.
    </p>

    <hr/>

    <p>
        <b>26th July</b> minWidth and maxWidth for columns. Chaining of cell expressions.
    </p>

    <hr/>

    <p>
        <b>18th July</b> Expressions implemented. Grid now works like Excel!!
    </p>

    <hr/>

    <p>
        <b>5th July</b> Typescript, Values on Tool Panel, Column API
    </p>

    <hr/>

    <p>
        <b>21st June</b> First version of Tool Panel, showing / hiding / reordering / grouping columns.
    </p>

    <hr/>

    <p>
        <b>14th June</b> Server side sorting and filtering, headerValueGetter, newRowsAction, suppressUnSort &
        suppressMultiSort'.
    </p>

    <hr/>

    <p>
        <b>7th June</b> New features: Ensure Col Index Visible, No Isolated Scope, API for Sorting,
        API for Saving / Setting Filters
    </p>

    <hr/>

    <p>
        <b>31st May</b> New features: Default aggregation, filtering API, de-selection, foeEachInMemory.
    </p>

    <hr/>

    <p>
        <b>25th May</b> Keyboard Navigation and general improvements
    </p>

    <hr/>

    <p>
        <b>17th May</b> Revamp of Grouping, ensureIndexVisible, ensureNodeVisible, Multi Column Sort (thanks Dylan
        Robinson), Fixed Width Cols.
    </p>

    <hr/>

    <p>
        <b>26 April</b> - Volatile Columns, Soft Refresh, Cell Templates.
    </p>

    <hr/>

    <p>
        <b>25 April</b> - Bug fixes:
        <a href="https://github.com/ag-grid/angular-grid/issues/35">Pinned Blank Space</a>,
        <a href="https://github.com/ag-grid/angular-grid/issues/91">Group Sorting</a>,
        <a href="https://github.com/ag-grid/angular-grid/issues/90">Cell Templates</a>,
        <a href="https://github.com/ag-grid/angular-grid/issues/29">Expand / Collapse</a>
    </p>

    <hr/>

    <p>
        <b>20 April</b> - Value Getters, Context and Expressions. Will be available in 1.3, or take latest.
        All documented in relevant sections.
    </p>

    <hr/>

    <p>
        <b>18 April</b> - Gulp! Thank you Tanner Linsley for implementing Gulp.
    </p>

    <hr/>

    <p>
        <b>16 April</b> - Checked in column opening & closing column Groups. Now you can show and hide columns in
        groups.
        Will be available in 1.3, or take latest. Documentation page 'Grouping Headers' updated.
    </p>

    <hr/>

    <p>
        <b>13 April</b> - Checked in 'tab navigation for editing', so when you hit tab while editing a cell, it goes
        into
        editing the next cell. Will be available in 1.3, or take latest.
    </p>

    <hr/>

    <p>
        <b>12 April</b> - Checked in datasources, pagination, virtual paging, infinite scrolling. Will be available in
        1.3, or take latest. Documentation
        pages 'Datasource', 'Pagination' and 'Virtual Paging' created.
    </p>

    <hr/>

    <p>
        <b>09 April</b> - Checked in support for 'Refresh Aggregate Data'. Will be available in 1.3, or take latest.
        Documentation
        page 'Grouping and Aggregating Rows' updated.
    </p>

    <hr/>

    <p>
        <b>06 April</b> - Checked in support for 'Loading Panel' to show when fetching data. Will be available in 1.3,
        or take latest. Documentation
        page for loading created.
    </p>

    <hr/>

    <p>
        <b>05 April</b> - Checked in support for custom icons in the headers. Will be available in 1.3, or take latest.
        Documentation
        page for icons created.
    </p>

    <hr/>

    <p>
        <b>04 April</b> - Checked in support for footers while grouping. Will be available in 1.3, or take latest.
        Documentation
        for grouping and example in 'test drive' updated to show.
    </p>

    <hr/>

    <p>
        <b>31 March</b> - DailyJS covers launch of Angular Grid.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
