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
        Enter the number of columns you wish to pin on the left hand side in the Grid Options pinnedColumnCount attribute.
    </p>
    <p>
        Enter the number of columns you wish to pin on the right hand side in the Grid Options pinnedRightColumnCount attribute.
    </p>
    <pre><code>gridOptions.pinnedColumnCount = count;</code></pre>
    <pre><code>gridOptions.pinnedRightColumnCount = count;</code></pre>

    <p>To change the number of columns pinned on the left hand side after grid creation, call:</p>
    <pre><code>gridOptions.columnApi.setPinnedColumnCount(newCount);</code></pre>

    <p>To change the number of columns pinned on the right hand side after grid creation, call:</p>
    <pre><code>gridOptions.columnApi.setPinnedRightColumnCount(newCount);</code></pre>

    <h3>Pinning columns on the left hand side</h3>

    <p>Below shows an example with 2 pinned columns on the left hand side.</p>

    <show-example example="example1"></show-example>

    <h3>Pinning columns on the right hand side</h3>

    <p>Below shows an example with 2 pinned columns on the right hand side.</p>

    <show-example example="example2"></show-example>

    <h3>Pinning columns on both sides</h3>

    <p>Below shows an example with 2 pinned columns on the left hand side and 2 pinned columns on the right hand side.</p>
    <show-example example="example3"></show-example>
</div>

<?php include '../documentation_footer.php';?>
