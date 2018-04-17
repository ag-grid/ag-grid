<?php
$pageTitle = "Column Pinning: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Column Pinning. Use Columm Pinning to pin one or more columns to the left or to the right. Pinned columns are always present and not impacted by horizontal scroll. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Pinning";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



    <h1>Column Pinning</h1>

    <p class="lead">
        You can pin columns by setting the <code>pinned</code> attribute on the column definition to either <code>'left'</code> or <code>'right'</code>.
    </p>

    <snippet>
colDef = {
    headerName: "Athlete",
    field: "athlete",
    pinned: 'left'
}</snippet>

    <p>Below shows an example with two pinned columns on the left and one pinned columns on the right.
    The example also demonstrates changing the pinning via the API at runtime.</p>

    <p>
        The grid will reorder the columns so that 'left pinned' columns come first and 'right pinned' columns
        come last. In the example below the state of pinned columns impacts the order of the
        columns such that when 'Country' is pinned, it jumps to the first position.
    </p>

    <h2>Jump To & Pinning</h2>

    <p>
        Below shows jumping to rows and cols via the API. Jumping to a pinned col makes no sense, as the pinned
        cols, by definition, are always visible. So below, if you try to jump to a pinned col, the grid will
        print a warning to the console.
    </p>

    <h2>Example Pinning</h2>

    <?= example('Column Pinning', 'column-pinning', 'generated') ?>

    <note>
        If you pin too many columns, so that the pinned columns take up the whole width of the grid,
        you will not be able to view the non-pinned columns. If this happens for you, please do not
        raise an issue with the ag-Grid team. Instead tell your users to stop pinning so many columns.
        Every month someone raises this with us and asks us to fix - it's like saying when I take the
        wheels off my car it is not possible to steer!
    </note>

    <h2>Pinning via Column Dragging</h2>

    <p> It is possible to pin a column by moving the column in the following ways: </p>
        <ul class="content">
            <li>
                When other columns are pinned, drag the column to the existing pinned area.
            </li>
            <li>
                When no columns are pinned, drag the column to the edge of the grid and wait
                for approximately one second. The grid will then assume you want to pin and create
                a pinned area and place the column into it.
            </li>
        </ul>

        <img src="../javascript-grid-pinning/pinningByMoving.gif" style="margin: 10px; border: 1px solid #aaa;"/>



    <h2>Lock Pinned</h2>

    <p>
        If you do not want the user to be able to pin using the UI, set the property
        <code>lockPinned=true</code>. This will block the UI in the following way:
    </p>
        <ul class="content">
            <li>Dragging a column to the pinned section will not pin the column.</li>
            <li>For ag-Grid Enterprise, the column menu will not have a pin option.</li>
        </ul>

    <p>
        The example below demonstrates columns with pinning locked. The following can be noted:
    </p>

        <ul class="content">
            <li>
                The column <b>Athlete</b> is pinned via the configuration and has <code>lockPinned=true</code>.
                This means the column will be pinned always, it is not possible to drag the column out
                of the pinned section.
            </li>
            <li>
                The column <b>Age</b> is not pinned and has <code>lockPinned=true</code>.
                This means the column cannot be pinned by dragging the column.
            </li>
            <li>
                All other columns act as normal. They can be added and removed from the pinned
                section by dragging.
            </li>
        </ul>

    <?= example('Lock Pinned', 'lock-pinned', 'generated') ?>



<?php include '../documentation-main/documentation_footer.php';?>
