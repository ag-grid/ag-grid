<?php
$pageTitle = "Aligned Grids: A Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions.  One such feature is Aligned Grids. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Aligned Grids";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



    <h1 class="first-h1" id="master-slave">Aligned Grids</h1>

    <p class="lead">
        Aligning two or more grids means columns will be kept aligned in all grids.
        In other words, column changes to one grid (column width, column order, column visibility etc)
        are reflected in the other grid.
        This is useful if you have two grids, one above the other such that their columns are vertically aligned,
        and you want to keep the columns aligned.
    </p>

    <h2>Configuration</h2>

    <p>
        To have one (the first) grid reflect column changes in another (the second), place the
        first grid's options in <code>alignedGrids</code> property of the second grids.
    </p>

    <snippet>
gridOptionsFirst = {
    // some grid options here
        ...
};

gridOptionsSecond = {
    // register first grid to receive events from the second
    alignedGrids: [gridOptionsFirst]

    // other grid options here
    ...
}</snippet>

    <h2 id="demonstration-example">Example - Aligned Grids</h2>

    <p>
        Below shows two grids, both aligned with the other (so any column change to one will be
        reflected in the other). The following should be noted:
</p>
        <ul class="content">
            <li>When either grid is scrolled horizontally, the other grid follows.</li>
            <li>Showing / hiding a column on either grid (via the checkbox) will show / hide the column
                on the other grid, despite the API been called on one grid only.</li>
            <li>When a column is resized on either grid, the other grid follows.</li>
            <li>When a column group is opened on either grid, the other grid follows.</li>
        </ul>
<p>
        The grids don't serve much purpose (why would you show the same grid twice???) however
        it demonstrates the features in an easy to understand way.
    </p>

    <?= example('Aligned Grids', 'aligned-grids', 'multi') ?>

    <h2 id="events">Events</h2>
    <p>
        The events which are fired as part of the grid alignment relationship are as follows:
    </p>
        <ul class="content">
            <li>Horizontal Scroll</li>
            <li>Column Hidden / Shown</li>
            <li>Column Moved</li>
            <li>Column Group Opened / Closed</li>
            <li>Column Resized</li>
            <li>Column Pinned</li>
        </ul>

    <h2 id="pivots">Pivots</h2>

    <p>
        The pivot functionality does not work with aligned grids. This is because pivoting data changes
        the columns, which would make the aligned grids incompatible, as they are no longer sharing
        the same set of columns.
    </p>

    <h2 id="aligned-grid-as-footer">Example - Aligned Grid as Footer</h2>

    <p>
        So why would you want to align grids like this? It's great for aligning grids that have
        different data but similar columns. Maybe you want to include a footer grid with 'summary' data.
        Maybe you have two sets of data, but one is aggregated differently to the other.
    </p>

    <p>
        This example is a bit more useful. In the bottom grid, we show a summary row. Also
        note the following:
        <li>The top grid has no horizontal scroll bar, suppressed via a grid option*.</li>
        <li>The bottom grid has no header, suppressed via a grid option.</li>
        <li>sizeColumnsToFit is only called on the top grid, the bottom grid receives the new column
            widths from the top grid.</li>
    </p>

    <?= example('Aligned Grid as Footer', 'aligned-floating-footer', 'multi') ?>

    <note style="font-style: italic;">
        * The property <code>suppressHorizontalScroll</code> does not work with the browser Edge.
        If you are targeting Edge, then there is no way to hide the scrollbar. Currently there is no
        known way to hide a scroll bar in Edge. The technique ag-Grid uses is to set the CSS overflow
        property to 'hidden' (rather than 'auto'). In all other browsers, this technique works, however
        in Edge it does not. The problem with Edge is demonstrated in the following
        <a href="https://plnkr.co/edit/MHgT6Rrp9LpOu7jddzVr?p=preview">Plunker</a>.
    </note>

    <h2 id="split-column-groups">Example - Align Column Groups</h2>

    <p>
        It is possible that you have column groups that are split because of pinning or the
        order of the columns. The grid below has only two groups that are split, displayed
        as many split groups. The column aligning also works here in that a change to a split
        group will open / close all the instances of that group in both tables.
    </p>

    <?= example('Aligned Column Groups', 'aligned-column-groups', 'multi') ?>

    <h2 id="event-propagation">Event Propagation</h2>

    <p>
        When a grid fires an event, it will be processed to all registered aligned grids. However if
        a grid is processing such an event, it will not fire an event to other aligned grids.
        For example, consider the grids A, B and C where B is aligned to A and C is aligned to B (ie A -> B -> C).
        If A gets a column resized, it will fire the event to B, but B will not fire the event to C. If
        C is also dependent on A, it needs to be set up directly. This stops cyclic dependencies
        between grids causing infinite firing of events if two grids are aligned to each other.
    </p>



<?php include '../documentation-main/documentation_footer.php';?>
