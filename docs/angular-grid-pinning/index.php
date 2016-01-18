<?php
$key = "Pinning";
$pageTitle = "AngularJS Angular Grid Pinning";
$pageDescription = "AngularJS Angular Grid Pinning";
$pageKeyboards = "AngularJS Angular Grid Pinning";
include '../documentation_header.php';
?>

<div>

    <h2>Pinning</h2>

    <p>
        You can pin columns by setting the pinned attribute on the column definition to either 'left' or 'right'.
    </p>

    <pre><code>colDef = {
    headerName: "Athlete",
    field: "athlete",
    <b>pinned: 'left'</b>
}</code></pre>

    <p>Below shows an example with 2 pinned columns on the left and one pinned columns on the right.
    The example also demonstrates changing the pinning via the API at runtime.</p>

    <p>
        The grid will reorder the columns so that 'left pinned' columns come first and 'right pinned' columns
        come last. In the example below the state of pinned columns impacts the order of the
        columns such that when 'Country' is pinned, it jumps to the first position.
    </p>

    <h3>Jump To & Pinning</h3>

    <p>
        Below shows jumping to rows and cols via the API. Jumping to a pinned col makes no sense, as the pinned
        cols, by definition, are always visible. So below, if you try to jump to a pinned col, the grid will
        print a warning to the console.
    </p>

    <show-example example="examplePinned"></show-example>
</div>

<?php include '../documentation_footer.php';?>
