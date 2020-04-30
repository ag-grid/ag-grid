<?php
$pageTitle = "Use with RxJS";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This reference page covers how to use RxJS with the datagrid.";
$pageKeywords = "ag-Grid rxjs";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Use with RxJS</h1>

<p class="lead">It is possible to use RxJS with ag-Grid - with the rich <a href="/javascript-grid-api">API</a> and numerous <a
        href="/javascript-grid-data-update">Data Update Options</a> the two can interoperate very well.</p>

<p>There are many ways you can use RxJS with ag-Grid. Below we describe two ways to do updates:
    One that processes just updated rows, and another that supplies the full Row Dataset but with altered rows within it.</p>

<h2>Option 1 - Providing Just Updated Data</h2>

<p>In this example we provide the initial data via a subscription, then provide updates via another.</p>

<p>The second subscription only provides changed rows - it does not provide the full dataset once again.</p>

<p>To efficiently process this data we need the following:</p>

<ul>
    <li>
        A unique key per row - we do this by making use of the <code>getRowNodeId</code> callback:

<?= createSnippet(<<<SNIPPET
const gridOptions = {
    getRowNodeId: function(data) {
        // the code is unique, so perfect for the ID
        return data.code;
    }
    ...
};
SNIPPET
) ?>
    </li>
    <li>
        A manner of letting ag-Grid know the type of update we're doing - for this we make use of the
        <a href="../javascript-grid-data-update">Transaction</a> method:

<?= createSnippet(<<<SNIPPET
updates\$.subscribe(updates => gridOptions.api.applyTransaction({ update: updates }));
SNIPPET
) ?>
    </li>
</ul>

<p>With these two pieces of code we can supply the updates to ag-Grid and the grid will only re-render the changes rows, resulting
in much improved performance.</p>

<?= grid_example('RxJS - Row Updates', 'rxjs-updates', 'generated', ['enterprise' => true, 'extras' => ['lodash', 'rxjs', 'bluebirdjs'], 'removeTitles' => ['vanilla']]) ?>

<h2>Option 2 - Providing Full Row Data With Updates Within</h2>

<p>In this example we provide the initial data via a subscription, then provide updates via another, as above.</p>

<p>This time however the second subscription has the full row data, with altered row data within the full dataset.</p>

<p>To efficiently process this data we need two things:</p>

<ul class="content">
    <li>A unique key per row - we do this by making use of the <code>getRowNodeId</code> callback</li>
    <li>A manner of letting ag-Grid know that we're supplying the full data again, but with altered data within - for this we make use of the <a
            href="../javascript-grid-immutable-data/">Immutable Data</a> method</li>
</ul>

<?= createSnippet(<<<SNIPPET
const gridOptions = {
    getRowNodeId: function(data) {
        // the code is unique, so perfect for the ID
        return data.code;
    },
    immutableData: true,
    ...
};
SNIPPET
) ?>

<p>With this configuration we can supply the updates to ag-Grid and the grid will only re-render the changed rows, resulting
    in much improved performance.</p>

<?= grid_example('RxJS - Full Updates', 'rxjs-full', 'generated', ['enterprise' => true, 'extras' => ['lodash', 'rxjs', 'bluebirdjs'], 'removeTitles' => ['vanilla']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
