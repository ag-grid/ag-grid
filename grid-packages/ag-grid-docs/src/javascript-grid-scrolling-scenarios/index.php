<?php
$pageTitle = "ag-Grid Rows";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers downloading the JavaScript packages for ag-Grid and ag-Grid Enterprise.";
$pageKeyboards = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

    <h1>Scrolling Scenarios</h1>

    <p class="lead">
        Here we show examples of some unusual use cases of scrolling and the grid.
    </p>

    <h2>Make scrollbars always visible</h2>

    <p>
        It is possible to show scrollbars even when there is not enough data to need scrolling.
        This voids visual table 'jumps' when toggling short and long data sets.
        To make that work, override the <code>overflow</code> of the <code>.ag-grid-body-viewport</code>
        to <code>scroll !important</code>. The <code>!important</code> is necessary to override the inline styling.
    </p>

    <?= grid_example('Always visible scrollbars', 'scrollbars', 'vanilla') ?>

    <h2>Auto Height, Full Width & Pagination</h2>

    <p>
        Shows the autoHeight feature working with fullWidth and pagination.
    </p>
    <ul class="content">
        <li>The fullWidth rows are embedded. This means:
            <ul class="content">
                <li>Embedded rows are chopped into the pinned sections.</li>
                <li>Embedded rows scroll horizontally with the other rows.</li>
            </ul>
        </li>
        <li>There are 15 rows and pagination page size is 10, so as you go from
            one page to the other, the grid re-sizes to fit the page (10 rows on the first
            page, 5 rows on the second page).</li>
    </ul>

    <?= grid_example('Auto Height & Full Width', 'auto-height-full-width', 'vanilla', array("enterprise" => 1)) ?>


    <h2>Expanding Groups &amp; Vertical Scroll Location</h2>

    <p>
        Depending on your scroll position the last item's group data may not be visible when
        clicking on the expand icon.
    </p>
    <p>
        You can resolve this by using the function <code>api.ensureIndexVisible()</code>.
        This ensures the index is visible, scrolling the table if needed.
    </p>
    <p>
        In the example below, if you expand a group at the bottom, the grid will scroll so all the
        children of the group are visible.
    </p>

    <?= grid_example('Row Group Scroll', 'row-group-scroll', 'vanilla', array("enterprise" => 1)) ?>




<?php include '../documentation-main/documentation_footer.php'; ?>

