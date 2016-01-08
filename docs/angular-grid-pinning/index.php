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
        You can pin columns by setting the pinned attribute on the column definition.
    </p>
    <pre><code>colDef = {
    headerName: "Athlete",
    field: "athlete",
    width: 150,
    pinned: true
}</code></pre>

    <p>Below shows an example with 2 pinned columns.</p>

    <show-example example="example1"></show-example>
</div>

<?php include '../documentation_footer.php';?>
