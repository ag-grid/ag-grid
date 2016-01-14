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
        The grid will reorder the columns so that left pinned columns come first and right pinned columns
        come last. Notice in the example below that the state of pinned columns impacts the order of the
        columns, in particular when 'Country' is pinned, it jumps to the first position.
    </p>

    <show-example example="examplePinned"></show-example>
</div>

<?php include '../documentation_footer.php';?>
