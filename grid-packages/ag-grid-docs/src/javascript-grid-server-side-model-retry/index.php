<?php
$pageTitle = "Server-Side Row Model - Load Retry";
$pageDescription = "Blocks that failed to load can be retried using the retryServerSideLoads() API";
$pageKeywords = "ag-Grid Server-Side Load Retry";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Load Retry</h1>

<p class="lead">
    When a datasource load fails, it is possible to retry loading the rows again at a later time.
</p>

<p>
    When loading fails, the datasource informs the grid of such using the <code>fail()</code>
    callback instead of using the <code>success()</code> callback.
    Calling <code>fail()</code> puts the loading rows into a Loading Failed state which hides
    the loading spinner. No data is shown in these rows as they are not loaded.
</p>

<p>
    Failed loads can be retried by using the grid API <code>retryServerSideLoads()</code>.
    This will retry all loads that have previously failed.
</p>

<p>
    Below shows two examples demonstrating retrying failed loads. One example uses the
    Full Store while the other uses the Finite Store. Both examples otherwise
    work identically. Note the following:
</p>

<ul>
    <li>
        When the checkbox 'Make Loads Fail' is checked,
        all subsequent loads will fail, i.e. the Datasource will call <code>fail()</code> instead
        of <code>success()</code>.
        Try checking the checkbox and expand a few groups to observe failed loading.
    </li>
    <li>
        When the button 'Retry Failed Loads' is pressed, any loads which were marked as failed
        are retried.
    </li>
    <li>
        When the button 'Reset Entire Grid' is pressed, the grid will reset. This allows you to
        have 'Make Loads Fail' checked while starting from scratch, thus failing loading of
        the top level of rows.
    </li>
</ul>

<p>
    The following is the retry example with Partial Store:
</p>
<?= grid_example('Retry Finite Store', 'retry-infinite', 'generated', ['enterprise' => true, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>


<p>
    The following is the retry example with Full Store:
</p>

<?= grid_example('Retry Full Store', 'retry-full', 'generated', ['enterprise' => true, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn how to set <a href="../javascript-grid-server-side-model-row-height/">Row Height</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
