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
            Now possible to switch between <a href="../javascript-grid-width-and-height/#auto-height">Auto Height</a>
            and Normal Height dynamically.
        </li>
        <li>
            AG-678
            <a href="../javascript-grid-grouping/#grouping-footers">Grouping Footers</a> now provides an option for
            a 'grand' total across all groups.
        </li>
        <li>
            AG-1793
            When in pivot mode you can now include <a href="../javascript-grid-pivoting/#pivotRowTotals">Pivot Row Totals</a>
        </li>
        <li>
            AG-1569
            To help clarify Row Model usage, we have renamed as follows:
            <ul>
                <li>In-Memory Row Model -> <a href="../javascript-grid-client-side-model/">Client-side Row Model</a></li>
                <li>Enterprise Row Model -> <a href="../javascript-grid-server-side-model/">Server-side Row Model</a></li>
            </ul>
        </li>
        <li>
            AG-865
            The Server-side Row Model now preserves group state after sorting has been performed.
        </li>
        <li>
            AG-1741
            Allow for both autoHeight to be used when using AngularJS with angularCompileRows.
        </li>
        <li>
            AG-1796
            Ensure "No Rows" Overlay does not overlap headers when using autoHeight when the grid is empty.
        </li>
        <li>
            AG-1771
            Fix memory leak when using AngularJS with angularCompileFilters.
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
            AG-1405 – Support for <a href="../javascript-grid-row-height/#auto-row-height">
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