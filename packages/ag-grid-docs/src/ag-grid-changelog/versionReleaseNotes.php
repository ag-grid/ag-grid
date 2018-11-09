<div class="note" style="display: none" fixVersionNote id="fix_version_19_1_1">
    <p>Release 19.1.1 Overview</p>

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
    <p>Release 19.0.0 Overview</p>

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
    <p>Release 18.0.0 Overview</p>

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
    <p>Release 17.1.0 Overview</p>

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