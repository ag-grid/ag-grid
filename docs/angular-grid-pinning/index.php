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
        Enter the number of columns you wish to pin in the Grid Options pinnedColumnCount attribute.
        The pinned columns are always the columns on the left hand side.
    </p>
    <pre><code>gridOptions.pinnedColumnCount = count;</code></pre>

    <p>To change the number of pinned columns after grid creation, call:</p>
    <pre><code>gridOptions.columnApi.setPinnedColumnCount(newCount);</code></pre>

    <p>Below shows an example with 2 pinned columns.</p>

    <show-example example="example1"></show-example>
</div>

<?php include '../documentation_footer.php';?>
