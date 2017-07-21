<?php
$key = "Pinning";
$pageTitle = "ag-Grid Pinning";
$pageDescription = "ag-Grid Pinning";
$pageKeyboards = "ag-Grid Pinning";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="pinning">Column Pinning</h2>

    <p>
        You can pin columns by setting the pinned attribute on the column definition to either 'left' or 'right'.
    </p>

    <pre><code>colDef = {
    headerName: "Athlete",
    field: "athlete",
    <b>pinned: 'left'</b>
}</code></pre>

    <p>Below shows an example with two pinned columns on the left and one pinned columns on the right.
    The example also demonstrates changing the pinning via the API at runtime.</p>

    <p>
        The grid will reorder the columns so that 'left pinned' columns come first and 'right pinned' columns
        come last. In the example below the state of pinned columns impacts the order of the
        columns such that when 'Country' is pinned, it jumps to the first position.
    </p>

    <h3 id="jump-to-pinning">Jump To & Pinning</h3>

    <p>
        Below shows jumping to rows and cols via the API. Jumping to a pinned col makes no sense, as the pinned
        cols, by definition, are always visible. So below, if you try to jump to a pinned col, the grid will
        print a warning to the console.
    </p>

    <h2>Example Pinning</h2>

    <show-example example="examplePinned"></show-example>

    <note>
        If you pin to many columns, so that the pinned columns take up the whole width of the grid,
        you will not be able to view the non-pinned columns. If this happens for you, please do not
        raise an issue with the ag-Grid team. Instead tell your users to stop pinning so many columns.
        Every month someone raises this with us and asks us to fix - it's like saying when I take the
        wheels off my car it is not possible to steer!
    </note>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
