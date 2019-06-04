<div class="note" style="display: none" fixVersionNote id="fix_version_21_0_0">
    <p>Release 21.0.0 (4th June 2019)</p>

    <p>Feature Highlights:</p>

    <ul>

        <li>
            AG-3008 / AG-3009 - Integrated Charts - a major new component has been added to ag-Grid which provides integrated charting from within the grid (see <a href="/javascript-grid-charts-overview/#user-created-charts">User Created Charts</a> and
            <a href="/javascript-grid-charts-overview/#application-created-charts">Application Created Charts</a>).
        </li>

        <li>
            AG-2946 - Filters Refactor - The simple provided filters (number, text, date) were part of the first
            grid release and the design was built on top of as new requirements were catered for. All the
            additional requirements made the original design difficult to maintain - the old design was
            coming to it's 'end of life'. For that reason the simple provided filters were rewritten from scratch.
            The has the benefits of a) implementing floating filters is now simpler; b) all provided filters
            now work in a more consistent way; c) code is easier to follow for anyone debugging through the
            ag-Grid code. The documentation for column filters was also rewritten from scratch to make it
            easier to follow.
        </li>

        <li>
            AG-2804 - Scroll Performance Improvements - Now when you scroll vertically the performance is vastly
            improved over the previous version of the grid. We make better use of debounced scrolling, animation
            and animation frames.
        </li>

        <li>
            AG-2999 - Change of License Messaging - Now anyone can try out ag-Grid Enterprise without needing
            a license from us. We want everyone to give ag-Grid Enterprise a trial. You only need to get in touch
            with us if you decided to start using ag-Grid inside your project.
        </li>

        <li>
            AG-2983 - Improved customisation for icons (see <a href="/javascript-grid-icons/">Custom Icons</a>).
        </li>

        <li>AG-2663 - React - Declarative Column Definitions Now Reactive.</li>
        <li>AG-2536 - React - Component Container Configurable (see <a href="/react-more-details/#control-react-components-container">Control React Components Container</a>).</li>
        <li>AG-2656 - React - Allow React Change Detection to be Configurable (see <a href="/react-more-details/#react-row-data-control">Row Data Control</a>).</li>
        <li>AG-2257 - All Frameworks - Expand & Improve Testing Documentation (see <a href="/javascript-grid-testing/">ag-Grid Testing</a>).</li>
    </ul>


    <p>Breaking Changes:</p>
    <ul>
        <li>
            AG-2946 - Number and Date Column Filters – Null Comparator is replaced with includeBlanksInEquals, includeBlanksInLessThan and includeBlanksInGreaterThan. (see <a href="/javascript-grid-filter-provided-simple/#blank-cells-date-and-number-filters">Blank Cells - Date and Number Filters</a>).
        </li>

        <li>
            AG-2946 - Floating Filters: floatingFilterParams.debounceMs is no longer a property, instead the floating filter uses the property of the same name form filterParams.
        </li>

        <li>
            AG-2946 - Custom Floating Filters – params.onParentModelChanged() is no longer used -instead you call methods on the parent filter directly. Also IFloatingFilter no longer takes generics. (see
            <a href="/javascript-grid-floating-filter-component/">Custom Floating Filters</a>).
        </li>

        <li>
            AG-2984 - Replaced all SVG icons with a WebFont (see <a href="/javascript-grid-icons/">Custom Icons</a>).
        </li>
    </ul>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_20_2_0">
    <p>Release 20.2.0 (22nd Mar 2019)</p>

    <p>Breaking Changes:</p>
    <ul>
        <li>
            AG-1707 - Change Tree Data filtering to additionally include child nodes when parent node passes filter
            (see <a href="/javascript-grid-tree-data/#tree-data-filtering">Tree Data Filtering</a>).
        </li>
    </ul>

    <p>Feature Highlights:</p>

    <ul>
        <li>AG-2722 - Add ability to create custom filters without input filter fields, ie isNull (see <a href="/javascript-grid-filtering/#adding-custom-filter-options">Custom Filter Options</a>).
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
        <li>AG-1617 - <a href="https://www.ag-grid.com/javascript-grid-tooltip-component">
                Allow for Custom Tooltip Components</a></li>

        <li>AG-2166 - <a href="https://www.ag-grid.com/javascript-grid-filtering/#adding-custom-filter-options">
                Allow for defining Custom Filters that appear in Filter Option List</a></li>

        <li>AG-1049 - <a href="https://www.ag-grid.com/javascript-grid-loading-cell-renderer">
                Allow for Custom Loading Renderer Component
            </a></li>

        <li>AG-2185 - <a href="https://www.ag-grid.com/nodejs-server-side-operations">
                New Server-side Row Model guide for Node.js with MySql</a></li>

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
            See <a href="/javascript-grid-styling/">Themes</a> for more information.
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
            refer to <a href="https://www.ag-grid.com/best-vuejs-data-grid/">Configuring ag-Grid and Vue.js</a>.
        </li>
    </ul>

    <p>Feature Highlights:</p>

    <ul>
        <li>
            AG-1709 Server-side Row Model - Add support for Master / Detail
            <a href="https://www.ag-grid.com/javascript-grid-server-side-model-master-detail">Server-side Master Detail</a>.
        </li>
        <li>
            AG-2448 Add declarative support to vue component (column defs)
            <a href="https://www.ag-grid.com/best-vuejs-data-grid/#declarative_definition">Using Markup to Define Grid Definitions</a>.
        </li>
        <li>
            AG-2280 Allow event handler in Vue too support more idiomatic conventions
            <a href="https://www.ag-grid.com/best-vuejs-data-grid/#configuring-ag-grid-in-vuejs">Configuring ag-Grid in Vue</a>.
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
            AG-904 <a href="https://www.ag-grid.com/best-polymer-data-grid/">Polymer 3 Datagrid</a>.
        </li>
        <li>
            AG-726 <a href="https://www.ag-grid.com/javascript-grid-excel/">Export to XLSX</a>.
        </li>
        <li>
            AG-1591 <a href="https://www.ag-grid.com/javascript-grid-column-definitions/#column-changes/">Allow Delta Changes to Column Definitions</a>.
        </li>
    </ul>

</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_19_0_0">
    <p>Release 19.0.0 (7th Sept 2018)</p>

    <p>Breaking Changes:</p>

    <ul>
        <li>
            The NPM package name for the free module of ag-Grid is now <code>ag-grid-community</code>
            instead of <code>ag-grid</code>. This means you install with <code>npm install ag-grid-community</code>
            and then you reference like <code>import {Grid, GridOptions} from "ag-grid-community"</code>.
        </li>
        <li>
            ag-Grid received a major overhaul of the Tool Panels in version 19.0.0. The old property 'showToolPanel' is
            no longer used and the Tool Panel is also not included by default. For more details see:
            <a href="https://www.ag-grid.com/javascript-grid-side-bar/#configuring-the-side-bar">Configuring the Side Bar</a>.
        </li>
    </ul>

    <p>Feature Highlights:</p>

    <ul>
        <li>
            AG-1201 The Status Bar is now customizable with
            <a href="https://www.ag-grid.com/javascript-grid-status-bar-component/">Custom Status Panel Components</a>.
        </li>

        <li>
            AG-1915 The Side Bar is now customizable with
            <a href="https://www.ag-grid.com/javascript-grid-tool-panel-component/">Custom Tool Panel Components</a>.
        </li>

        <li>
            AG-1914 A new <a href="https://www.ag-grid.com/javascript-grid-tool-panel-filters/">Filters Tool Panel</a>
            has been added to the Side Bar.
        </li>

        <li>
            AG-1881 Lazy load hierarchical data with
            <a href="http://localhost:8080/javascript-grid-server-side-model-tree-data/">Server-side Tree Data</a>.
        </li>

        <li>
            AG-1961 Debounce block loading with Infinite and Server-side Row Models using the new grid options
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
            New strategy for <a href="../javascript-grid-for-print/">Printing</a> using auto-height.
        </li>
        <li>
            AG-1350
            Added support for <a href="../javascript-grid-row-spanning/">Row Spanning</a>.
        </li>
        <li>
            AG-1768
            Now possible to switch between <a href="https://www.ag-grid.com/javascript-grid-width-and-height/#auto-height">Auto Height</a>
            and Normal Height dynamically.
        </li>
        <li>
            AG-678
            <a href="https://www.ag-grid.com/javascript-grid-grouping/#grouping-footers">Grouping Footers</a> now provides an option for
            a 'grand' total across all groups.
        </li>
        <li>
            AG-1793
            When in pivot mode you can now include <a href="https://www.ag-grid.com/javascript-grid-pivoting/#pivotRowTotals">Pivot Row Totals</a>
        </li>
        <li>
            AG-1569
            To help clarify Row Model usage, we have renamed as follows:
            <ul>
                <li>In-Memory Row Model -> <a href="https://www.ag-grid.com/javascript-grid-client-side-model/">Client-side Row Model</a></li>
                <li>Enterprise Row Model -> <a href="https://www.ag-grid.com/javascript-grid-server-side-model/">Server-side Row Model</a></li>
            </ul>
        </li>
        <li>
            AG-865
            The Server-side Row Model now preserves group state after sorting has been performed.
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
                <li><a href="../javascript-grid-filter-text/">text filter</a></li>
                <li><a href="../javascript-grid-filter-number/">number filter</a></li>
                <li><a href="../javascript-grid-filter-date/">date filter</a></li>
            </ul></p>
        </li>
    </ul>
</div>

<div class="note" style="display: none" fixVersionNote id="fix_version_17_1_0">
    <p>Release 17.1.0 (13th Apr 2018)</p>

    <ul>
        <li>
            AG-1730
            Deprecate <a href="../javascript-grid-for-print">for print</a>, the same functionality can be achieved with
            <a href="../javascript-grid-width-and-height/#autoHeight">domLayout: 'autoHeight'</a>
        </li>
        <li>
            AG-1626 – <a href="../javascript-grid-filter-quick/">Quick filter</a> now filters
            using multiple words, eg search for “Tony Ireland” to bring back all rows with “Tony” in the name column and
            “Ireland” in the country column.
        </li>
        <li>
            AG-1405 – Support for <a href="https://www.ag-grid.com/javascript-grid-row-height/#auto-row-height">
                automatic text wrapping</a>.
        </li>
        <li>
            AG-1682 - New guides for connecting
            <a href="../oracle-server-side-operations/">Enterprise Row Model to Oracle</a> and
            <a href="../spark-server-side-operations/">Enterprise Row Model to Apache Spark</a>.
        </li>
        <li>
            AG-1675 – BREAKING CHANGE - The
            <a href="../javascript-grid-filter-set/#set-filter-model">set filter model</a>
            was changed to be consistent with other filter models. For backwards compatibility,
            this change can be toggled off using the grid property
            <code>enableOldSetFilterModel</code>. Both models will be supported for releases for
            the next 6 months. After this one major ag-Grid release will have the old model
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
