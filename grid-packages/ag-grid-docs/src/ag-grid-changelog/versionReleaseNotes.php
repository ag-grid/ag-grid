<div class="note" style="display: none" fixVersionNote id="fix_version_26_1_0">
    <p><b>Release 26.1.0 (1st Oct 2021)</b></p>

     <p><b>Feature Highlights:</b></p>
     <ul>
         <li>
             Sparklines - Introducing our new built-in Sparkline Cell Renderer
             (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.1.0/javascript-data-grid/sparklines-overview/">Sparklines Overview</a>)
         </li>

         <li>Grid UX Enhancements</li>
         <ul>
            <li>
                AG-4139 - Allow drag & drop to reorder columns inside Columns Tool Panel
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.1.0/javascript-data-grid/tool-panel-columns/">Columns Tool Panel</a>)
            </li>
            <li>
                AG-3986 - Entire Row Dragging without the need for a drag handle
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.1.0/javascript-data-grid/row-dragging/#entire-row-dragging">Entire Row Dragging</a>)
            </li>
         </ul>

         <li>Accessibility Improvements</li>
         <ul>
             <li>AG-4661 - Add ARIA form label to checkboxes in column tool panel</li>
             <li>AG-5299 - Allow correct announcements for the column menu tabs</li>
             <li>AG-2932 - Add ARIA label to filter tool panel - filter columns input</li>
             <li>AG-5727 - Allow column menu to indicate to screen readers it's a dialog</li>
             <li>AG-5305 - Allow focus to move from the sidebar button into the active tool panel</li>
             <li>AG-5082 - Allow filter tool panel items to be expanded using the SPACE key and announce their current expanded / collapsed state</li>
             <li>AG-5747 - Allow column tool panel items to be announced with their index in the columns list and provide labels to checkboxes</li>
             <li>AG-5731 - Allow announcing number of matching records after column filtering</li>
             <li>AG-4705 - Allow JAWS screen reader to announce visible records when using pagination after previous/next button clicked</li>
             <li>AG-5246 - Resolve broken ARIA label reference error for column header cell select-all checkbox</li>
             (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.1.0/javascript-data-grid/accessibility/">Accessibility</a>)
         </ul>

         <li>Miscellaneous</li>
         <ul>
             <li>
                 AG-3116 - Add support for Series Highlighting in Charts
                 (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.1.0/javascript-charts/series-highlighting/">Series Highlighting</a>)
             </li>
             <li>
                  AG-5706 - Add support for React-based column header components in ReactUI mode
                  (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.1.0/react-data-grid/reactui/#example-headers">ReactUI - Column Header Components</a>)
             </li>
             <li>
                 AG-3680 - Allow disabling the Fill Handle on a per-column basis
                 (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.1.0/javascript-data-grid/range-selection-fill-handle/#skipping-columns-in-the-fill-operation">Skipping Columns in the Fill Operation</a>)
             </li>
         </ul>
     </ul>

      <p><b>Deprecations:</b></p>

      <p><u>Grid Options</u></p>

      <ul>
          <li><code>enableMultiRowDragging</code> (use <code>rowDragMultiRow</code> instead)</li>
          <li><code>colWidth</code> (use <code>defaultColDef.width</code> instead)</li>
          <li><code>minColWidth</code> (use <code>defaultColDef.minWidth</code> instead)</li>
          <li><code>maxColWidth</code> (use <code>defaultColDef.maxWidth</code> instead)</li>
      </ul>

</div>


<div class="note" style="display: none" fixVersionNote id="fix_version_26_0_0">
    <p><b>Release 26.0.0 (18th Aug 2021)</b></p>

     <p><b>Feature Highlights:</b></p>
     <ul>
         <li>
             React UI - The next generation of AG Grid React with the UI written purely in React
             (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/react-data-grid/reactui/">React UI</a>)
         </li>

         <li>Grid UX Enhancements</li>
         <ul>
            <li>
                AG-3406 - Allow user to resize/collapse the different areas of the Columns Tool Panel
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-data-grid/tool-panel-columns/">Columns Tool Panel</a>)
            </li>
            <li>
                AG-1945 - Allow setting Tool Panel width (current / min / max / initial)
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-data-grid/side-bar/#sidebardef-configuration">Sidebar Configuration</a>)
            </li>
            <li>
                AG-4028 - Allow Set Filter popup to be resized
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-data-grid/filter-set/">Set Filter</a>)
            </li>
         </ul>

         <li>Row Grouping Enhancements</li>
         <ul>
             <li>
                 AG-5484 - Reworked Documentation
                 (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-data-grid/grouping/">Row Grouping</a>)
             </li>
             <li>
                 AG-5524 - Simplified configuration of Row Grouping Display Types
                 (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-data-grid/grouping-display-types/">Row Grouping Display Types</a>)
             </li>
             <li>
                 AG-1153 - Allow sort comparators defined on columns to also sort group columns
                 (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-data-grid/grouping-sorting/#custom-group-sorting">Custom Group Sorting</a>)
             </li>
             <li>
                AG-2139 - Add option to maintain group order when sorting on non-group columns
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-data-grid/grouping-sorting/#maintain-group-order">Maintain Group Order</a>)
             </li>
             <li>
                AG-5582 - Allow custom cell renderers to be used with Group Footer Rows
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-data-grid/grouping-footers/#customising-footer-cells">Customising Footer Cells</a>)
             </li>
          </ul>

        <li>Charts</li>
         <ul>
             <li>
                 AG-4880 - Add series marker labels for Bubble / Scatter charts
                 (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-charts/scatter-series/#example-bubble-chart-labels">Bubble Chart Labels</a>)
             </li>
             <li>
                 AG-3634 - Add support for series marker labels in category series
                 (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-charts/line-series/#example-basic-line-labels">Line Chart Labels</a>)
             </li>
         </ul>

         <li>Miscellaneous</li>
         <ul>
             <li>AG-5569 - Vue 3 Reactivity and Composition API Support, Improved Vue 3 Documentation</li>
             <li>AG-5373 - Add Vue 3 examples to the Example Runner</li>
             <li>
                 AG-5607 - Enhance Row Auto Height Support
                 (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-data-grid/row-height/#auto-row-height">Auto Row Height</a>)
             </li>
             <li>AG-5625 - Update and Improve Types on Angular Interfaces</li>
         </ul>
     </ul>

      <p><b>Breaking Changes:</b></p>

      <p><u>Core Grid</u></p>

      <ul>
          <li>
              AG-5392 - Now when setting / updating Column Definitions, the order of the Columns in the grid will always match the order of the Column Definitions.
              Prior to v26, <code>applyColumnDefOrder</code> was used to achieve this, however this is now the default behaviour. To turn off this behaviour, i.e. to maintain
              the order of Columns between updates to Column Definitions, set the grid property <code>maintainColumnOrder=true</code>
              (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-data-grid/column-updating-definitions/#maintain-column-order">Maintain Column Order</a>)
          </li>
          <li>
              AG-5534 - The <code>AnimationQueueEmptyEvent</code> has been removed, the grid API method <code>isAnimationFrameQueueEmpty()</code> can be used instead.
          </li>
          <li>
              AG-4952 - <code>.cjs</code> are self-contained units preventing LicenseManager from recognizing the license key, these files previously included
              all AG Grid related dependencies. These files now only contain the relevant code for that module, which is the correct behaviour
          </li>
      </ul>

      <p><u>Integrated Charts</u></p>
      <ul>
          <li>
              AG-5605 - The previously deprecated <code>processChartOptions()</code> callback has now been removed. Please use
              <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-data-grid/integrated-charts-customisation/">Theme Based Configuration</a> instead
          </li>
          <li>
              AG-5558 - <code>getChartImageDataURL()</code> has been removed from the <code>ChartModel</code> and it is now available directly through the grid API
              (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-data-grid/integrated-charts-api/#downloading-chart-image">Downloading Chart Image</a>)
          </li>
          <li>
              AG-5447 - The chart instance has been removed from the <code>ChartModel</code> to support serialisation, use <code>gridApi.getChartRef(chartId)</code> instead
              (see <a rel="nofollow" href="https://www.ag-grid.com/archive/26.0.0/javascript-data-grid/integrated-charts-events/#accessing-chart-instance">Accessing Chart Instance</a>)
          </li>
      </ul>

      <p><u>Standalone Charts</u></p>

      <p>The following Standalone Chart options were previously deprecated and have now been removed</p>
      <ul>
         <u>Chart</u>
         <ul>
             <li><code>tooltipTracking</code> (use <code>tooltip.tracking</code> instead)</li>
             <li><code>tooltipClass</code> (use <code>tooltip.class</code> instead)</li>
         </ul>

         <u>Series</u>
         <ul>
             <li><code>tooltipEnabled</code> (use <code>tooltip.enabled</code> instead)</li>
             <li><code>tooltipRenderer</code> (use <code>tooltip.renderer</code> instead)</li>
         </ul>

         <u>Legend</u>
         <ul>
             <li><code>layoutHorizontalSpacing</code> (use <code>item.paddingX</code> instead)</li>
             <li><code>layoutVerticalSpacing</code> (use <code>item.paddingY</code> instead)</li>
             <li><code>itemSpacing</code> (use <code>item.marker.padding</code> instead)</li>
             <li><code>markerShape</code> (use <code>item.marker.shape</code> instead)</li>
             <li><code>markerSize</code> (use <code>item.marker.size</code> instead)</li>
             <li><code>strokeWidth</code> (use <code>item.marker.strokeWidth</code> instead)</li>
             <li><code>color</code> (use <code>item.label.color</code> instead)</li>
             <li><code>fontStyle</code> (use <code>item.label.fontStyle</code> instead)</li>
             <li><code>fontWeight</code> (use <code>item.label.fontWeight</code> instead)</li>
             <li><code>fontSize</code> (use <code>item.label.fontSize</code> instead)</li>
             <li><code>fontFamily</code> (use <code>item.label.fontFamily</code> instead)</li>
         </ul>
      </ul>

      <p><b>Deprecations:</b></p>

      <p><u>Grid Options</u></p>

      <ul>
          <li><code>groupMultiAutoColumn</code> (use <code>groupDisplayType='multipleColumns'</code> instead)</li>
          <li><code>groupUseEntireRow</code> (use <code>groupDisplayType='groupRows'</code> instead)</li>
          <li><code>groupSuppressAutoColumn</code> (use <code>groupDisplayType='custom'</code> instead)</li>
          <li><code>defaultGroupSortComparator</code> (use <code>defaultGroupOrderComparator</code> instead)</li>
      </ul>

      <p><u>Column Properties</u></p>
      <ul>
         <li><code>pinnedRowCellRenderer</code>, <code>pinnedRowCellRendererFramework</code> and <code>pinnedRowCellRendererParams</code>
         (Please use <code>cellRendererSelector</code> instead if you want a different Cell Renderer / Params for Pinned Rows)</li>
      </ul>

</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_25_3_0">
    <p><b>Release 25.3.0 (27th Apr 2021)</b></p>

    <p>Minor release with bug fixes.</p>
</div>


<div class="note" style="display: none" fixVersionNote id="fix_version_25_2_0">
    <p><b>Release 25.2.0 (30th Apr 2021)</b></p>

    <p>Minor release with bug fixes.</p>

    <p><b>Feature Highlights:</b></p>

    <ul>
          <li>Excel Export Enhancements</li>
          <ul>
            <li>AG-2432 - Allow exporting images to Excel in the exported grid data cells</li>
            <li>AG-1504 - Add author value to generated XML Excel to avoid edit error</li>
            <li>AG-2553 - Allow customising of group column headers when exporting to Excel</li>
            <li>AG-2333 - Allow inserting hyperlinks in the cells of the exported Excel file</li>
            <li>AG-2303 - Allow exporting formulas to Excel</li>
            <li>AG-5178 - Allow exporting an image in Excel export above and below the grid</li>
            <li>AG-3439 - Allow carriage-returns / multiple line formatting when exporting to Excel</li>
            <li>AG-3833 - Allow column spanning with Excel export</li>
            <li>AG-5109 - Allow column spanning with ExcelAdd property to change the default font size</li>
            <li>AG-2370 - Allow exporting multiple grids to a single Excel file by supporting multiple sheets</li>
            <li>AG-5179 - Allow setting page size and layout orientation for the Excel export file</li>
            <li>AG-5217 - Add support for Headers and Footers in the Excel export</li>
            <li>AG-4471 - Allow exporting cell date-type values to Excel date format</li>
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/25.2.0/javascript-grid/excel-export/">Excel Export</a>)
          </ul>
        <li>AG-3379 - Logarithmic Charts (see <a rel="nofollow" href="https://www.ag-grid.com/archive/25.2.0/javascript-charts/axes/#log-axis">Log Axis</a>)</li>
    </ul>

   <p><b>Deprecations:</b></p>

    <p><u>ExcelExportParams</u></p>
    <ul>
        <li>columnGroups (use skipColumnGroupHeaders)</li>
        <li>skipGroups (use skipRowGroups)</li>
        <li>skipHeader (use skipColumnHeaders)</li>
        <li>columnGroups (use prependContent)</li>
        <li>customFooter (use appendContent)</li>
    </ul>

   <p><u>Grid Options</u></p>
     <ul>
         <li>suppressColumnStateEvents (no longer required)</li>
     </ul>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_25_1_0">
    <p><b>Release 25.1.0 (19th Feb 2021)</b></p>

    <p>Minor release with bug fixes.</p>

    <p><b>Feature Highlights:</b></p>

    <ul>
        <li>
            AG-3028 - Add Treemap Chart Series (see <a rel="nofollow" href="https://www.ag-grid.com/archive/25.1.0/javascript-charts/treemap-series/">Treemap Series</a>)
        </li>
    </ul>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_25_0_0">
    <p><b>Release 25.0.0 (6th Jan 2021)</b></p>

    <p><b>Feature Highlights:</b></p>

    <ul>
        <li>
            AG-2837 - Major Server-side Row Model enhancements including:
            <ul>
                <li>
                    Full CRUD support via Transactions, including Asynchronous Transactions for
                    High Frequency updates.
                </li>
                <li>
                    Option to turn off Infinite Scrolling and load all rows at a particular level.
                </li>
                <li>
                    Client side Sorting and Filtering.
                </li>
                <li>
                    Silent refreshes (i.e. don't show Loading Spinner).
                </li>
                <li>
                    Preserving Group State during Refresh.
                </li>
                <li>
                    Retry of failed data loads.
                </li>
                <li>
                    Configure different SSRM properties (eg Block Size) for each group level.
                </li>
            </ul>
            As the changes to SSRM are major, we recommend SSRM users to review the
            <a rel="nofollow" href="https://www.ag-grid.com/archive/25.0.0/documentation/javascript/server-side-model/">SSRM documentation</a>.
        </li>
        <li>
            AG-4787 - Integrated Charts Cross Filtering (see <a rel="nofollow" href="https://www.ag-grid.com/archive/25.0.0/documentation/javascript/integrated-charts-cross-filtering/">Cross Filtering</a>)
        </li>
        <li>
            AG-4600 - Clipboard performance improvement, as grid now uses native Clipboard API.
        </li>
        <li>
            AG-4753 - New property <code>showOpenedGroup</code>, to allow showing the name of the open group in the group column.
            See <a rel="nofollow" href="https://www.ag-grid.com/archive/25.0.0/documentation/javascript/grouping/#showing-open-groups">Show Open Groups</a>.
        </li>
    </ul>

    <p><b>Breaking Changes:</b></p>
    <p><u>Server-side Row Model</u></p>
    <ul>
        <li>
            New property <code>serverSideStoreType</code> must be set to <code>partial</code> for backwards
            compatibility. If not set, the default <code>full</code> is used, which turns off Infinite Scrolling.
            Infinite Scrolling is now a feature you must opt into.
        </li>
        <li>
            The undocumented attribute <code>childrenCache</code> property of Row Node has been renamed
            to <code>childStore</code>. The old name didn't make sense with the refactor of how the SSRM works
            with different store types.
        </li>
    </ul>

    <p><b>Deprecations:</b></p>

    <p><u>Server-side Row Model</u></p>
    <ul>
        <li>
            Grid API <code>refreshServerSideStore(params)</code> should now be used instead of <code>purgeServerSideCache()</code>.
        </li>
        <li>
            The success callbacks <code>successCallback</code> and <code>failCallback</code> are replaced with
            the methods <code>success</code> and <code>fail</code>. The new methods serve the same purpose as the
            old methods, however the new 'success' method uses a <code>params</code> object rather than listing
            individual parameters as this is more extensible. The old methods will still work and are left in
            for backwards compatibility, however future releases of AG Grid will deprecated these and then
            remove the old methods.
        </li>
    </ul>

</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_24_1_0">
    <p><b>Release 24.1.0 (12th Sep 2020)</b></p>

    <p>Minor release with bug fixes and small improvements.</p>

    <p><b>Feature Highlights:</b></p>
    <ul>
        <li>
            <code>Vue 3</code> Support.
        </li>
    </ul>

    <p><b>Deprecations:</b></p>

    <ul>
        <li>
            <code>colDef.suppressHeaderKeyboardEvent</code> should now be used instead of <code>gridOptions.suppressKeyboardEvent</code>. Note the methods: <code>navigateToNextHeader</code> and <code>tabToNextHeader</code> have been added to the grid options to allow custom header navigation. For more details see <a rel="nofollow" href="https://www.ag-grid.com/archive/24.1.0/javascript-grid-keyboard-navigation/#custom-navigation">Custom Navigation</a>.
        </li>
    </ul>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_24_0_0">
    <p><b>Release 24.0.0 (9th Sep 2020)</b></p>

    <p><b>Feature Highlights:</b></p>

    <ul>
        <li>
            AG-1873: Allow more combining multiple column filters on one column
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/24.0.0/javascript-grid-filter-multi/">Multi Filter</a>)
        </li>

        <li>
            AG-4291: Reactive Columns - Enhancements to Column Definitions including the following:
            <ul>
                <li>
                    Declarative Column Definitions for React resulting in application code that
                    fits more nicely with the React paradigm.
                </li>
                <li>
                    Revamped <a rel="nofollow" href="https://www.ag-grid.com/archive/24.0.0/javascript-grid-column-updating-definitions/">Updating Column Definitions</a>
                    to make it easier to make changes to columns.
                    For example state items now have 'default' values (defaultWidth, defaultSort etc) which means
                    there is no longer any need for 'Immutable Columns' (which are gone).
                </li>
                <li>
                    Revamped <a rel="nofollow" href="https://www.ag-grid.com/archive/24.0.0/javascript-grid-column-state/">Column State</a> to allow more powerful
                    and fine grained control of Column State without touching the Column Definitions. For example
                    partial state can be applied to impact certain Columns or to impact only certain Attributes,
                    providing fine grained control over Column State.
                </li>
            </ul>
        </li>

        <li>Accessibility Enhancements</li>
        <ul>
            <li>AG-4254 - Allow screen readers to read column names in the column tool panel</li>
            <li>AG-4394 - Add ARIA tags in the paging panel</li>
            <li>AG-4390 - Allow updates to sort order to be announced</li>
            <li>AG-2629 - Allow screen readers/keyboard navigation to access the column headers sort and filtering elements</li>
            <li>AG-4279 - Add ARIA label to row selection checkbox</li>
            <li>AG-4250 - Add role definitions to grouped rows to allow them to be read correctly by screen readers</li>
            <li>AG-4389 - Allow column menu tabs to be announced correctly in JAWS</li>
            <li>AG-4322 - Update ARIA role, label, title, sort tags for column headers</li>
            <li>AG-4314 - Allow passing the WAVE, AXE accessibility audit</li>
            <li>AG-4363 - Add ARIA labels to cell editors</li>
            <li>AG-1967 - Add Accessibility attributes across column header Filter/Sorting elements</li>
            <li>AG-4391 - Add aria-label to provided filter menu inputs</li>
            <li>AG-4393 - Allow using keyboard navigation to navigate to and access the pagination panel</li>
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/24.0.0/javascript-grid-accessibility/">Accessibility</a>)
        </ul>

        <li>
            AG-2821 - Chart Themes (see <a rel="nofollow" href="https://www.ag-grid.com/archive/24.0.0/javascript-charts-themes/">Chart Themes</a>,
            <a rel="nofollow" href="https://www.ag-grid.com/archive/24.0.0/javascript-grid-charts-integrated-customisation/">Integrated Theme Based Customisation</a>)
        </li>

        <li>
            AG-4140 - Allow aggregation without totalling on pivot column groups (see
            <a rel="nofollow" href="https://www.ag-grid.com/archive/24.0.0/javascript-grid-pivoting/#expandable-pivot-column-groups">Expandable Pivot Groups</a>)
        </li>

        <li>
            AG-4266 - Add API methods indicating whether the undo/redo stack is empty (see
            <a rel="nofollow" href="https://www.ag-grid.com/archive/24.0.0/javascript-grid-undo-redo-edits/#example-undo-redo">Undo / Redo</a>)
        </li>
    </ul>

    <p><b>Breaking Changes:</b></p>

    <p><u>Reactive Columns</u></p>

    <ul>
        <li>Column stateful items (width, flex, hide, sort, aggFunc, pivot, pivotIndex, rowGroup, rowGroupIndex, initialPinned) always get re-applied when Column Definitions are updated.</li>
        <li>Grid Property 'immutableColumns' is now gone. Columns are immutable by default.</li>
        <li>Grid Column API 'getColumnState()' now returns back more information about columns. This is only a breaking change if your application isn't able to work with the extra details.</li>
        <li>Grid Column API 'setColumnsState()' is replaced with 'applyColumnState()'. The new method is similar but more powerful / flexible.</li>
        <li>Grid Property 'suppressSetColumnStateEvents' renamed to 'suppressColumnStateEvents'.</li>
        <li>Column Definition property sortedAt replaced with sortIndex.</li>
        <li>Grid API's 'getSortModel()' and 'setSortModel()' are deprecated as sort information is now part of Column State. Use get/applyColumnState() for sort information instead.</li>
    </ul>

    <p>See 'More Info' on AG-4291 for full details, these changes make more sense in context of the wider changes.</p>

    <p><u>Custom Aggregation</u></p>
    <ul>
        <li>
            Custom aggregation functions now take a params object, previously they took a list of values. See 'More Info' on AG-4291 for details.
        </li>
    </ul>

    <p><u>Row Deselection</u></p>
    <ul>
        <li>rowDeselection no longer has any affect as the grid now allows row deselection by default. To block row deselection set suppressRowDeselection to true..</li>
    </ul>

    <p><u>Configuring 'Full Width Group Row Inner Renderer'</u></p>
    <p>
        How <code>innerRenderer</code> was configured as a grid option was wrong and has been corrected to the correct way.
        The old way was using grid properties <code>groupRowInnerRenderer</code> and
        <code>groupRowInnerRendererParams</code>. The new correct way is to use
        <code>groupRowRendererParams.innerRenderer</code> and
        <code>groupRowRendererParams.innerRendererParams</code>.
    </p>

    <p><b>Removed Deprecations:</b></p>

    <p>The following have been deprecated for over a year and have now been removed:</p>

    <p><u>Grid Options</u></p>

    <ul>
        <li>pivotTotals (use pivotColumnGroupTotals = 'before' | 'after')</li>
        <li>gridAutoHeight (use domLayout = 'autoHeight')</li>
        <li>groupSuppressRow (remove row groups and perform custom sorting)</li>
        <li>suppressTabbing (use the grid callback suppressKeyboardEvent(params))</li>
        <li>showToolPanel (use gridOptions.sideBar)</li>
        <li>toolPanelSuppressRowGroups (use toolPanelParams.suppressRowGroups)</li>
        <li>toolPanelSuppressValues (use toolPanelParams.suppressValues)</li>
        <li>toolPanelSuppressPivots (use toolPanelParams.suppressPivots)</li>
        <li>toolPanelSuppressPivotMode (use toolPanelParams.suppressPivotMode)</li>
        <li>toolPanelSuppressColumnFilter (use toolPanelParams.suppressColumnFilter)</li>
        <li>toolPanelSuppressColumnSelectAll (use toolPanelParams.suppressColumnSelectAll)</li>
        <li>toolPanelSuppressSideButtons (use toolPanelParams.suppressSideButtons)</li>
        <li>toolPanelSuppressColumnExpandAll (use toolPanelParams.suppressColumnExpandAll)</li>
        <li>contractColumnSelection (use toolPanelParams.contractColumnSelection)</li>
        <li>enableSorting / enableServerSideSorting (use sortable=true on the column definition)</li>
        <li>enableFilter / enableServerSideFilter (use filter=true on the column definition)</li>
        <li>enableColResize (use resizable = true on the column definition)</li>
        <li>getNodeChildDetails() (use new tree data)</li>
        <li>doesDataFlower() (use new master detail)</li>
        <li>processChartOptions() (use chartThemeOverrides)</li>
    </ul>

    <p><u>Column Definitions</u></p>

    <ul>
        <li>suppressSorting (use colDef.sortable=false)</li>
        <li>suppressFilter (use colDef.filter=false)</li>
        <li>suppressResize (use colDef.resizable=false)</li>
        <li>suppressToolPanel (use coldDef.suppressColumnsToolPanel)</li>
        <li>tooltip (use colDef.tooltipValueGetter)</li>
    </ul>

    <p><u>Row Node</u></p>

    <ul>
        <li>canFlower</li>
        <li>flower</li>
        <li>childFlower</li>
    </ul>

    <p><u>Events</u></p>

    <ul>
        <li>floatingRowDataChanged (use pinnedRowDataChanged)</li>
    </ul>

</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_23_2_0">
    <p>Release 23.2.0 (5th Jun 2020)</p>

    <p>Feature Highlights:</p>

    <ul>
        <li>
            AG-3253: Allow keyboard navigation through all parts of the grid
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.2.0/javascript-grid-keyboard-navigation/">Keyboard Navigation</a>)
        </li>

        <li>
            AG-4227: Add chart navigator to allowing panning and zooming
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.2.0/javascript-charts-navigator/">Chart Navigator</a>)
        </li>

        <li>Filter Enhancements</li>
        <ul>
            <li>
                AG-1594: All row values to be expanded to multiple values in set filter
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.2.0/javascript-grid-filter-set-filter-list/#multiple-values-per-cell">Set Filter - Multiple Values Per Cell</a>)
            </li>

            <li>
                AG-4220: Create Excel mode for set filter
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.2.0/javascript-grid-filter-set-excel-mode/">Set Filter - Excel Mode</a>)
            </li>

            <li>
                AG-1645: When using asynchronous values for set filter, setting filter model should work
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.2.0/javascript-grid-filter-api/">Filter API</a>)
            </li>

            <li>
                <div>
                    AG-2216 - Allow filter values to be loaded every time the user opens the set filter
                </div>
                <div>
                    AG-3089 - Update all asynchronously-loaded set filter values when any filters change
                </div>
                <div>
                    AG-2298 - Allow async set values to be fetched on-demand via an API, not only when filter opened initially
                </div>
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.2.0/javascript-grid-filter-set-filter-list/#refreshing-values">Set Filter - Refreshing Values</a>)
            </li>
        </ul>


        <li>Master Detail Enhancements</li>
        <ul>
            <li>
                AG-2546 - Allow Master / Detail to auto-height as detail data changes
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.2.0/javascript-grid-master-detail-height/#auto-height">Master Detail - Auto Height</a>)
            </li>

            <li>
                AG-2651 - Master/Detail refresh isRowMaster when updating data for a row
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.2.0/javascript-grid-master-detail-master-rows/#dynamic-master-rows">Dynamic Master Rows</a>)
            </li>

            <li>
                AG-3589 - Allow for dynamically changing master rows into leaf nodes
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.2.0/javascript-grid-master-detail-master-rows/#changing-dynamic-master-rows">Changing Dynamic Master Rows</a>)
            </li>

            <li>
                AG-3916 - Allow for the refresh of detail rows when using immutable data
                (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.2.0/javascript-grid-master-detail-refresh/#refresh-rows">Master Detail - Refresh Rows</a>)
            </li>
        </ul>

    </ul>

    <p>Deprecations:</p>

    <ul>
        <li>SetFilter.setLoading() is deprecated. The loading screen is displayed automatically when the set filter is retrieving values</li>
        <li>SetFilter.selectEverything() is deprecated. setModel should be used instead</li>
        <li>SetFilter.selectNothing() is deprecated. setModel should be used instead</li>
        <li>SetFilter.selectValue() is deprecated. setModel should be used instead</li>
        <li>SetFilter.unselectValue() is deprecated. setModel should be used instead</li>
        <li>SetFilter.isValueSelected() is deprecated. getModel should be used instead</li>
        <li>SetFilter.isEverythingSelected() is deprecated. getModel should be used instead</li>
        <li>SetFilter.isNothingSelected() is deprecated. getModel should be used instead</li>
        <li>SetFilter.getUniqueValueCount() is deprecated. getValues should be used instead</li>
        <li>SetFilter.getUniqueValue() is deprecated. getValues should be used instead</li>

        <li>Provided filter filterParams.applyButton has been deprecated. Use filterParams.buttons instead</li>
        <li>Provided filter filterParams.clearButton has been deprecated. Use filterParams.buttons instead</li>
        <li>Provided filter filterParams.resetButton has been deprecated. Use filterParams.buttons instead</li>
    </ul>

</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_23_1_0">
    <p>Release 23.1.0 (1st May 2020)</p>

    <p>Feature Highlights:</p>

    <ul>
        <li>
            AG-3576: Allow dragging multiple columns between grids
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.1.0/javascript-grid-row-dragging-to-grid/#dragging-multiple-records-between-grids">Dragging Multiple Records Between Grids</a>)
        </li>

        <li>
            AG-3625: Allow the grid to respond to DnD data based on the row position
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.1.0/javascript-grid-row-dragging-to-grid/#example-two-grids-with-drop-position">Row Dragging Drop Position</a>)
        </li>

        <li>
            AG-4066: Allow Grid colours to be changed using CSS variables
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.1.0/javascript-grid-themes-customising/#setting-parameters-css-variables">Changing colours with CSS variables</a>)
        </li>

        <li>
            AG-3312: Add Histogram Charts
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.1.0/javascript-charts-histogram-series/">Histogram Series</a>)
        </li>

        <li>
            AG-3472: Add the ability to listen to click events on Charts
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.1.0/javascript-charts-events/">Chart Events</a>)
        </li>

        <li>
            AG-588: Add tooltips to Set Filter List
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.1.0/javascript-grid-filter-set-filter-list/#filter-value-tooltips">Set Filter Tooltips</a>)
        </li>

        <li>AG-2162: Add option to close filter popup when Apply button is clicked
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.1.0/javascript-grid-filter-provided/#providedFilterParams">'closeOnApply' Filter Param</a>)
        </li>

        <li>
            AG-2187: Allow floating filters to be enabled/disabled on a per-column basis
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.1.0/javascript-grid-floating-filters/#floating-filters">Floating Filters on a per-column basis</a>)
        </li>
    </ul>

    <p>Deprecations:</p>

    <ul>
        <li>Grid API updateRowData() deprecated, replaced with applyTransaction()</li>
        <li>Grid API batchUpdateRowData() deprecated, replaced with applyTransactionAsync()</li>
        <li>Grid Property 'batchUpdateWaitMillis' deprecated, replaced with 'asyncTransactionWaitMillis'</li>
        <li>Grid Property 'deltaRowDataMode' deprecated, replaced with 'immutableData'</li>
        <li>Grid Property 'deltaColumnMode' deprecated, replaced with 'immutableColumns'</li>
        <li>RowDataTransaction Property 'addIndex' will be removed in a future major release</li>
        <li>RowDataTransaction Property 'addIndex' will be removed in a future major release</li>
        <li>Set Filter Param 'suppressSyncValuesAfterDataChange' will be removed in a future major release</li>
        <li>Set Filter Param 'suppressRemoveEntries' will be removed in a future major release</li>
        <li>Filter Param 'newRowsAction' will be removed in a future major release (newRowsAction = 'keep' will become the default behaviour)</li>
    </ul>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_23_0_0">
    <p>Release 23.0.0 (17th Mar 2020)</p>

    <p>Feature Highlights:</p>

    <ul>
        <li>
            AG-3110 - Allow charts to be created outside of grid
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.0.0/javascript-charts-overview/">Standalone Charting</a>).
        </li>

        <li>
            AG-2832 - Add new 'Alpine Theme'
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.0.0/javascript-grid-themes-provided/#themes-summary">Themes Summary</a>).
        </li>

        <li>AG-3872 - Improve Server-Side Row Model docs and examples
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.0.0/javascript-grid-server-side-model/">Server-Side Row Model</a>).
        </li>

        <li>
            AG-2025 - Add keyboard navigation to context menu
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.0.0/javascript-grid-context-menu/">Context Menu</a>).

        </li>

        <li>
            AG-3203 - Add API to download charts
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.0.0/javascript-grid-charts-integrated-chart-range-api/#saving-and-restoring-charts">Saving and Restoring Charts</a>).
        </li>

        <li>
            AG-3678 - Add additional chart lifecycle events to aid persisting charts
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/23.0.0/javascript-grid-charts-integrated-chart-events/">Chart Events</a>).
        </li>
    </ul>

    <p>Breaking Changes:</p>

    <ul>
        <li>
            <p>
                AG-3110 - We have undertaken a major rewrite of the Sass code behind our provided themes, with the goal of making it easier to write custom themes.
                See <a rel="nofollow" href="https://www.ag-grid.com/archive/23.0.0/javascript-grid-themes-v23-migration/">Migrating themes to AG Grid 23.x</a> to understand why we've made these changes, and exactly what we've changed.
            </p>
        </li>

        <li>
            <p>
                AG-3802 - Migrate <code>ag-grid-angular</code> & <code>@ag-grid-community/angular</code> to use the Angular CLI to build.
                Angular 6+ is now the minimum supported version of Angular.
            </p>
        </li>

        <li>
            <p>
                AG-3110 - Tooltip renderer params: if a series has no `title` set, the tooltip renderer
                will receive the `title` as it, it won't be set to the value of the `yName` as before.
            </p>
        </li>

        <li>
            AG-3110 - Legend API changes:
            <ul>
                <li>legend.padding -> legend.spacing</li>
                <li>legend.itemPaddingX -> legend.layoutHorizontalSpacing</li>
                <li>legend.itemPaddingY -> legend.layoutVerticalSpacing</li>
                <li>legend.markerPadding -> legend.itemSpacing</li>
                <li>legend.markerStrokeWidth -> legend.strokeWidth</li>
                <li>legend.labelColor -> legend.textColor</li>
                <li>legend.labelFontStyle -> legend.fontStyle</li>
                <li>legend.labelFontWeight -> legend.fontWeight</li>
                <li>legend.labelFontSize -> legend.fontSize</li>
                <li>legend.labelFontFamily -> legend.fontFamily</li>
            </ul>
        </li>
    </ul>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_22_1_0">
    <p>Release 22.1.0 (6th Dec 2019)</p>

    <p>Feature Highlights:</p>

    <ul>
        <li>
            AG-1630 - Add Excel-like Fill Handle
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.1.0/javascript-grid-range-selection-fill-handle/">Fill Handle</a>).
        </li>
        <li>
            AG-2566 - Allow specifying column width as reminder viewport view
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.1.0/javascript-grid-resizing/#column-flex">Column Flex</a>).
        </li>
        <li>
            AG-169 - Allow Undo / Redo of Cell Editing
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.1.0/javascript-grid-undo-redo-edits/">Undo / Redo Edits</a>).
        </li>
        <li>
            AG-3318	- Allow charts to be saved and restored
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.1.0/javascript-grid-charts-chart-range-api/#saving-and-restoring-charts">Saving and Restoring Charts</a>).
        </li>
        <li>
            AG-2819 - Add support for Time Series charts
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.1.0/javascript-grid-charts-customisation-cartesian/#example-time-series-chart">Time Series Charting</a>).
        </li>
        <li>
            AG-332 - Allow exporting Master Detail to Excel
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.1.0/javascript-grid-master-detail/#exporting-master-detail-data">Exporting Master / Detail Data</a>).
        </li>
    </ul>
</div>


<div class="note" style="display: none" fixVersionNote id="fix_version_22_0_0">
    <p>Release 22.0.0 (11th Nov 2019)</p>

    <p>Feature Highlights:</p>

    <ul>
        <li>
            Charts is now out of Beta!
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.0.0/javascript-grid-charts-overview/">Charts</a>).
        </li>

        <li>
            AG-1329 - Modularise Grid Features to reduce grid bundle size
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.0.0/javascript-grid-modules/">Modularisation</a>).
        </li>

        <li>
            AG-3269 - A new pivotChart API has been added to charts.
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.0.0/javascript-grid-charts-chart-range-api/#pivot-charts">Pivot Chart API</a>).
        </li>

        <li>
            AG-2200 - Allow filters to be arranged using column groups in the filters tool panel
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.0.0/javascript-grid-tool-panel-filters/">Filters Tool Panel</a>).
        </li>
        <li>
            AG-2363 - Add filter search to the filters tool panel
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.0.0/javascript-grid-tool-panel-filters/">Filters Tool Panel</a>).
        </li>
        <li>
            AG-1862 - Allow custom column layouts in the Columns Tool Panel
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.0.0/javascript-grid-tool-panel-columns/#custom-column-layout">Custom Column Tool Panel Layout</a>).
        </li>
        <li>
            AG-3131 - Allow custom filter layouts in the Filters Tool Panel
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.0.0/javascript-grid-tool-panel-filters/#custom-filters-layout">Custom Filters Tool Panel Layout</a>).
        </li>
        <li>
            AG-1991 - Allow filters and columns tool panel to have API calls to expand/collapse column groups/filters
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.0.0/javascript-grid-tool-panel-columns/#expand-collapse-column-groups">Expand / Collapse Column Groups</a>)
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.0.0/javascript-grid-tool-panel-filters/#expand-collapse-filter-groups">Expand / Collapse Filter Groups</a>).
        </li>

        <li>
            AG-1026	- Allow sidebar to be placed in the left or right position of the grid
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.0.0/javascript-grid-side-bar/#sidebardef-configuration">Side Bar Configuration</a>).
        </li>
        <li>
            AG-907 - Rollup Support Added
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.0.0/ag-grid-building-rollup/">Rollup</a>).
        </li>
    </ul>

    <p>Breaking Changes:</p>
    <ul>
        <li>
            In taking Charts out of Beta it was necessary to to make numerous interface / chart option changes
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/22.0.0/javascript-grid-charts-chart-range-api/">Chart API</a> and <a rel="nofollow" href="https://www.ag-grid.com/archive/22.0.0/javascript-grid-charts-customisation/">Chart Customisation</a>).
        </li>
        <li>
            AG-3316 - agGridReact needs to be updated to use the updated react lifecycle hooks.
            React 16.3 is now the minimum version supported by AgGridReact.
        </li>
        <li>
            AG-3383 - Property selectAllOnMiniFilter no longer used, its the default behaviour for Set Filter.
        </li>
        <li>
            AG-3369 - syncValuesLikeExcel is enabled by default.
        </li>
        <li>
            AG-3345 / AG-3347 - tool panels are now kept in sync with the column order in the grid. To revert enable the following Tool Panel property: 'suppressSyncLayoutWithGrid'.
        </li>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_21_2_0">
    <p>Release 21.2.0 (30th Aug 2019)</p>

    <p>Feature Highlights:</p>

    <span style="font-weight: bold"></span>
    <ul>
        <li>
            AG-3215 - Add Pivot Chart
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.2.0/javascript-grid-charts-pivot-chart/">Pivot Chart</a>).
        </li>

        <li>
            AG-3036 / AG-3160 - Add Scatter / Bubble Charts
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.2.0/javascript-grid-charts-customisation-scatter/">Scatter Charts</a>).
        </li>

        <li>AG-2762 - Pagination - prevent separation of children from their parent rows with Master Detail and Row Grouping
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.2.0/javascript-grid-pagination/#childRows">Pagination & Child Rows</a>).
        </li>

        <li>AG-1643 - RichSelect - Allow typing to automatically scroll to item</li>

        <li>AG-3165 - Chart API - Add support for extra / custom aggregations
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.2.0/javascript-grid-charts-chart-range-api/#chart-range-api-1">Chart API</a>).
        </li>

        <li>AG-3154 - Charts - Allow user formatting changes to be saved / restored
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.2.0/javascript-grid-charts-customisation/#saving-user-preferences">Saving User Preferences</a>).
        </li>

        <li>AG-3184 - Charts - Add ability to unlink / detach charts from grid data
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.2.0/javascript-grid-charts-chart-toolbar/#unlinking-charts">Unlinking Charts</a>).
        </li>

        <li>AG-2736 - Accessibility - Enhance support for Screen Readers with additional ARIA Roles
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.2.0/javascript-grid-accessibility/">Accessibility</a>).
        </li>

        <li>AG-3196 - Security - Add Section to Docs for OWASP and CSP
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.2.0/javascript-grid-security/">Security</a>).
        </li>
    </ul>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_21_1_0">
    <p>Release 21.1.0 (18th July 2019)</p>

    <p>Feature Highlights:</p>

    <ul>
        <li>
            AG-3002 - Charts: Add Chart Format Panel
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.1.0/javascript-grid-charts-chart-toolbar/#chart-format">Chart Format Panel</a>).
        </li>

        <li>
            AG-2833 - Charts: Add Area Charts
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.1.0/javascript-grid-charts-customisation-area/">Area Charts</a>).
        </li>

        <li>AG-1708 - Row dragging: Allow dragging between grids or between the grid and a external element
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.1.0/javascript-grid-drag-and-drop/">Drag & Drop</a>).
        </li>

        <li>
            AG-3012 - Master/Detail: Detail row state now kept when detail row is closed
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.1.0/javascript-grid-master-detail/#keeping-row-details">Keeping Detail Rows</a>).
        </li>

        <li>AG-2912 - Master/Detail: Keep detail state when scrolled out of view.</li>
    </ul>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_21_0_0">
    <p>Release 21.0.0 (4th June 2019)</p>

    <p>Feature Highlights:</p>

    <ul>

        <li>
            AG-3008 / AG-3009 - Integrated Charts - a major new component has been added to AG Grid which provides integrated charting from within the grid (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.0.0/javascript-grid-charts-overview/#user-created-charts">User Created Charts</a> and
            <a rel="nofollow" href="https://www.ag-grid.com/archive/21.0.0/javascript-grid-charts-overview/#application-created-charts">Application Created Charts</a>).
        </li>

        <li>
            AG-2946 - Filters Refactor - The simple provided filters (number, text, date) were part of the first
            grid release and the design was built on top of as new requirements were catered for. All the
            additional requirements made the original design difficult to maintain - the old design was
            coming to it's 'end of life'. For that reason the simple provided filters were rewritten from scratch.
            The has the benefits of a) implementing floating filters is now simpler; b) all provided filters
            now work in a more consistent way; c) code is easier to follow for anyone debugging through the
            AG Grid code. The documentation for column filters was also rewritten from scratch to make it
            easier to follow.
        </li>

        <li>
            AG-2804 - Scroll Performance Improvements - Now when you scroll vertically the performance is vastly
            improved over the previous version of the grid. We make better use of debounced scrolling, animation
            and animation frames.
        </li>

        <li>
            AG-2999 - Change of License Messaging - Now anyone can try out AG Grid Enterprise without needing
            a license from us. We want everyone to give AG Grid Enterprise a trial. You only need to get in touch
            with us if you decided to start using AG Grid inside your project.
        </li>

        <li>
            AG-2983 - Improved customisation for icons (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.0.0/javascript-grid-icons/">Custom Icons</a>).
        </li>

        <li>AG-2663 - React - Declarative Column Definitions Now Reactive.</li>
        <li>AG-2536 - React - Component Container Configurable (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.0.0/react-more-details/#control-react-components-container">Control React Components Container</a>).</li>
        <li>AG-2656 - React - Allow React Change Detection to be Configurable (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.0.0/react-more-details/#react-row-data-control">Row Data Control</a>).</li>
        <li>AG-2257 - All Frameworks - Expand & Improve Testing Documentation (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.0.0/javascript-grid-testing/">AG Grid Testing</a>).</li>
    </ul>


    <p>Breaking Changes:</p>
    <ul>
        <li>
            AG-2946 - Number and Date Column Filters – Null Comparator is replaced with includeBlanksInEquals, includeBlanksInLessThan and includeBlanksInGreaterThan. (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.0.0/javascript-grid-filter-provided-simple/#blank-cells-date-and-number-filters">Blank Cells - Date and Number Filters</a>).
        </li>

        <li>
            AG-2946 - Floating Filters: floatingFilterParams.debounceMs is no longer a property, instead the floating filter uses the property of the same name form filterParams.
        </li>

        <li>
            AG-2946 - Custom Floating Filters – params.onParentModelChanged() is no longer used -instead you call methods on the parent filter directly. Also IFloatingFilter no longer takes generics. (see
            <a rel="nofollow" href="https://www.ag-grid.com/archive/21.0.0/javascript-grid-floating-filter-component/">Custom Floating Filters</a>).
        </li>

        <li>
            AG-2984 - Replaced all SVG icons with a WebFont (see <a rel="nofollow" href="https://www.ag-grid.com/archive/21.0.0/javascript-grid-icons/">Custom Icons</a>).
        </li>
    </ul>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_20_2_0">
    <p>Release 20.2.0 (22nd Mar 2019)</p>

    <p>Breaking Changes:</p>
    <ul>
        <li>
            AG-1707 - Change Tree Data filtering to additionally include child nodes when parent node passes filter
            (see <a rel="nofollow" href="https://www.ag-grid.com/archive/20.2.0/javascript-grid-tree-data/#tree-data-filtering">Tree Data Filtering</a>).
        </li>
    </ul>

    <p>Feature Highlights:</p>

    <ul>
        <li>AG-2722 - Add ability to create custom filters without input filter fields, ie isNull (see <a rel="nofollow" href="https://www.ag-grid.com/archive/20.2.0/javascript-grid-filtering/#adding-custom-filter-options">Custom Filter Options</a>).
        </li>

        <li>AG-2121 - Allow column-spanning across row header groups when they belong to the same column group</li>

        <li>AG-1936 - Add the ability to change the header checkbox and the drag handle icons</li>

        <li>AG-2143 - Add new property to load the grid with the sidebar hidden</li>
    </ul>
</div>


<div class="note" style="display: none" fixVersionNote id="fix_version_20_1_0">
    <p>Release 20.1.0 (22nd Feb 2019)</p>

    <p>Feature Highlights:</p>

    <ul>
        <li>AG-1617 - <a rel="nofollow" href="https://www.ag-grid.com/archive/20.1.0/javascript-grid-tooltip-component/">
                Allow for Custom Tooltip Components</a></li>

        <li>AG-2166 - <a rel="nofollow" href="https://www.ag-grid.com/archive/20.1.0/javascript-grid-filtering/#adding-custom-filter-options">
                Allow for defining Custom Filters that appear in Filter Option List</a></li>

        <li>AG-1049 - <a rel="nofollow" href="https://www.ag-grid.com/archive/20.1.0/javascript-grid-loading-cell-renderer/">
                Allow for Custom Loading Renderer Component
            </a></li>

        <li>AG-2185 - <a rel="nofollow" href="https://www.ag-grid.com/archive/20.1.0/nodejs-server-side-operations/">
                New Server-Side Row Model guide for Node.js with MySql</a></li>

        <li>AG-1972 - Performance improvements for small changes to large datasets</li>
        <li>AG-2289 - Better management of Column Definitions after grid is created</li>
        <li>AG-2305 - Lazy row height calculation for dynamic row heights</li>
        <li>AG-1485 - Raise events for cellKeyPress and cellKeyDown</li>
        <li>AG-2628 - Provide capability to suppress keyboard actions from the grid</li>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_20_0_0">
    <p>Release 20.0.0 (11th Jan 2019)</p>

    <p>Breaking Changes:</p>

    <ul>
        <li>
            AG-939 - The structure of Containers and Viewports has changed to improve scroll performance, so
            custom themes, will most likely need to be updated to reflect these changes.
            See <a rel="nofollow" href="https://www.ag-grid.com/archive/20.0.0/javascript-grid-styling/">Themes</a> for more information.
        </li>
        <li>
            AG-2235 - We have restructured our themes, so If you create custom themes extending
            our sass files, you will need to update the @import path.<br>
            See how to customise your themes <a href="https://github.com/ag-grid/ag-grid-customise-theme">here</a>
        </li>
        <li>
            <code>ag-grid-vue</code> now has a dependency on <code>vue-property-decorator</code>
        </li>
        <li>
            <code>ag-grid-vue</code>Event bindings are now bound with <code>@</code> instead of <code>:</code>. Please
            refer to <a rel="nofollow" href="https://www.ag-grid.com/archive/20.0.0/best-vuejs-data-grid/">Configuring AG Grid and Vue.js</a>.
        </li>
    </ul>

    <p>Feature Highlights:</p>

    <ul>
        <li>
            AG-1709 Server-Side Row Model - Add support for Master / Detail
            <a rel="nofollow" href="https://www.ag-grid.com/archive/20.0.0/javascript-grid-server-side-model-master-detail/">Server-Side Master Detail</a>.
        </li>
        <li>
            AG-2448 Add declarative support to vue component (column defs)
            <a rel="nofollow" href="https://www.ag-grid.com/archive/20.0.0/best-vuejs-data-grid/#declarative_definition">Using Markup to Define Grid Definitions</a>.
        </li>
        <li>
            AG-2280 Allow event handler in Vue too support more idiomatic conventions
            <a rel="nofollow" href="https://www.ag-grid.com/archive/20.0.0/best-vuejs-data-grid/#configuring-ag-grid-in-vuejs">Configuring AG Grid in Vue</a>.
        </li>
        <li>
            AG-939 Improve horizontal and vertical scrolling in other browsers.
        </li>
    </ul>

    <p>Deprecation:</p>
    <ul>
        <li>AG-644 Refactor of sorting, filtering and resizing properties</li>
    </ul>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_19_1_1">
    <p>Release 19.1.1 (30th Oct 2018)</p>

    <p>Feature Highlights:</p>

    <ul>
        <li>
            AG-904 <a rel="nofollow" href="https://www.ag-grid.com/archive/19.1.4/best-polymer-data-grid/">Polymer 3 Datagrid</a>.
        </li>
        <li>
            AG-726 <a rel="nofollow" href="https://www.ag-grid.com/archive/19.1.4/javascript-grid-excel/">Export to XLSX</a>.
        </li>
        <li>
            AG-1591 <a rel="nofollow" href="https://www.ag-grid.com/archive/19.1.4/javascript-grid-column-definitions/#column-changes/">Allow Delta Changes to Column Definitions</a>.
        </li>
    </ul>

</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_19_0_0">
    <p>Release 19.0.0 (7th Sept 2018)</p>

    <p>Breaking Changes:</p>

    <ul>
        <li>
            The NPM package name for the free module of AG Grid is now <code>ag-grid-community</code>
            instead of <code>ag-grid</code>. This means you install with <code>npm install ag-grid-community</code>
            and then you reference like <code>import {Grid, GridOptions} from "ag-grid-community"</code>.
        </li>
        <li>
            AG Grid received a major overhaul of the Tool Panels in version 19.0.0. The old property 'showToolPanel' is
            no longer used and the Tool Panel is also not included by default. For more details see:
            <a rel="nofollow" href="https://www.ag-grid.com/archive/19.0.0/javascript-grid-side-bar/#configuring-the-side-bar">Configuring the Side Bar</a>.
        </li>
    </ul>

    <p>Feature Highlights:</p>

    <ul>
        <li>
            AG-1201 The Status Bar is now customizable with
            <a rel="nofollow" href="https://www.ag-grid.com/archive/19.0.0/javascript-grid-status-bar-component/">Custom Status Panel Components</a>.
        </li>

        <li>
            AG-1915 The Side Bar is now customizable with
            <a rel="nofollow" href="https://www.ag-grid.com/archive/19.0.0/javascript-grid-tool-panel-component/">Custom Tool Panel Components</a>.
        </li>

        <li>
            AG-1914 A new <a rel="nofollow" href="https://www.ag-grid.com/archive/19.0.0/javascript-grid-tool-panel-filters/">Filters Tool Panel</a>
            has been added to the Side Bar.
        </li>

        <li>
            AG-1881 Lazy load hierarchical data with
            <a rel="nofollow" href="https://www.ag-grid.com/archive/19.0.0/javascript-grid-server-side-model-tree-data/">Server-Side Tree Data</a>.
        </li>

        <li>
            AG-1961 Debounce block loading with Infinite and Server-Side Row Models using the new grid options
            property: 'blockLoadDebounceMillis'.
        </li>

        <li>
            AG-1363 columnApi.resetColumnState() can now optionally raise column based events.
        </li>
    </ul>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_18_0_0">
    <p>Release 18.0.0 (12th Jun 2018)</p>

    <ul>
        <li>
            AG-1844
            Grid is now laid out using CSS Flex. Before this the grid had it's own layout mechanism
            called Border Layout. This had the following disadvantages:
            <ul>
                <li>
                    The grid had a timer (layout interval) where every 500ms it was checking the width and
                    height of the grid and then laying out contents again if the width or height changed.
                </li>
                <li>
                    Extra DIV elements were required for the layout.
                </li>
            </ul>
            The new mechanism no longer uses the layout interval so the grid is no longer polling every 500ms.
            The DOM is also now cleaner as the extra div's associated with the border layout are now gone.
        </li>
        <li>
            AG-1807
            New strategy for <a rel="nofollow" href="https://www.ag-grid.com/archive/18.1.0/javascript-grid-for-print/">Printing</a> using auto-height.
        </li>
        <li>
            AG-1350
            Added support for <a rel="nofollow" href="https://www.ag-grid.com/archive/18.1.0/javascript-grid-row-spanning/">Row Spanning</a>.
        </li>
        <li>
            AG-1768
            Now possible to switch between <a rel="nofollow" href="https://www.ag-grid.com/archive/18.1.0/javascript-grid-width-and-height/#auto-height">Auto Height</a>
            and Normal Height dynamically.
        </li>
        <li>
            AG-678
            <a rel="nofollow" href="https://www.ag-grid.com/archive/18.1.0/javascript-grid-grouping/#grouping-footers">Grouping Footers</a> now provides an option for
            a 'grand' total across all groups.
        </li>
        <li>
            AG-1793
            When in pivot mode you can now include <a rel="nofollow" href="https://www.ag-grid.com/archive/18.1.0/javascript-grid-pivoting/#pivotRowTotals">Pivot Row Totals</a>
        </li>
        <li>
            AG-1569
            To help clarify Row Model usage, we have renamed as follows:
            <ul>
                <li>In-Memory Row Model -> <a rel="nofollow" href="https://www.ag-grid.com/archive/18.1.0/javascript-grid-client-side-model/">Client-Side Row Model</a></li>
                <li>Enterprise Row Model -> <a rel="nofollow" href="https://www.ag-grid.com/archive/18.1.0/javascript-grid-server-side-model/">Server-Side Row Model</a></li>
            </ul>
        </li>
        <li>
            AG-865
            The Server-Side Row Model now preserves group state after sorting has been performed.
        </li>
        <li>
            <p>AG-424
                Text, Number and Date filters now support two filter conditions instead of just one. The user through the UI
                can decide which sort of logic to apply: 'AND'/'OR'</p>

            <p>This also means that the model for the filter changes when two conditions are applied.</p>

            <p>The ability to add an additional filter condition can be suppressed with
                <code>filterParams.suppressAndOrCondition = true</code></p>

            <p>The documentation of each filter has been updated to reflect these changes accordingly:

            <ul>
                <li><a rel="nofollow" href="https://www.ag-grid.com/archive/18.1.0/javascript-grid-filter-text/">text filter</a></li>
                <li><a rel="nofollow" href="https://www.ag-grid.com/archive/18.1.0/javascript-grid-filter-number/">number filter</a></li>
                <li><a rel="nofollow" href="https://www.ag-grid.com/archive/18.1.0/javascript-grid-filter-date/">date filter</a></li>
            </ul></p>
        </li>
    </ul>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_17_1_0">
    <p>Release 17.1.0 (13th Apr 2018)</p>

    <ul>
        <li>
            AG-1730
            Deprecate <a rel="nofollow" href="https://www.ag-grid.com/archive/17.1.1/javascript-grid-for-print/">for print</a>, the same functionality can be achieved with
            <a rel="nofollow" href="https://www.ag-grid.com/archive/17.1.1/javascript-grid-width-and-height/#autoHeight">domLayout: 'autoHeight'</a>
        </li>
        <li>
            AG-1626 – <a rel="nofollow" href="https://www.ag-grid.com/archive/17.1.1/javascript-grid-filter-quick/">Quick filter</a> now filters
            using multiple words, eg search for “Tony Ireland” to bring back all rows with “Tony” in the name column and
            “Ireland” in the country column.
        </li>
        <li>
            AG-1405 – Support for <a rel="nofollow" href="https://www.ag-grid.com/archive/17.1.1/javascript-grid-row-height/#auto-row-height">
                automatic text wrapping</a>.
        </li>
        <li>
            AG-1682 - New guides for connecting
            <a rel="nofollow" href="https://www.ag-grid.com/archive/17.1.1/oracle-server-side-operations/">Enterprise Row Model to Oracle</a> and
            <a rel="nofollow" href="https://www.ag-grid.com/archive/17.1.1/spark-server-side-operations/">Enterprise Row Model to Apache Spark</a>.
        </li>
        <li>
            AG-1675 – BREAKING CHANGE - The
            <a rel="nofollow" href="https://www.ag-grid.com/archive/17.1.1/javascript-grid-filter-set/#set-filter-model">set filter model</a>
            was changed to be consistent with other filter models. For backwards compatibility,
            this change can be toggled off using the grid property
            <code>enableOldSetFilterModel</code>. Both models will be supported for releases for
            the next 6 months. After this one major AG Grid release will have the old model
            deprecated and then the following release will have it dropped.
        </li>
    </ul>
</div>

<!-- For testing purposes only -->
<!--<div class="note" style="display: none" fixVersionNote id="fix_version_16_0_0">
    <p>Release Notes for Version 16.0.0</p>

    <p>Blah blah blah</p>
</div>
<div class="note" style="display: none" fixVersionNote id="fix_version_15_0_0">
    <p>Release Notes for Version 15.0.0</p>

    <p>Blah blah blah</p>
</div>-->
