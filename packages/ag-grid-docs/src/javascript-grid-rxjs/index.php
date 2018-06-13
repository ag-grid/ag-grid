<?php
$pageTitle = "ag-Grid Reference: Using RxJS with the Datagrid";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This reference page covers how to use RxJS with the datagrid.";
$pageKeyboards = "ag-Grid rxjs";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



    <h1>ag-Grid with RxJS</h1>

    <p class="lead">It is possible to use RxJS with ag-Grid - with the rich <a href="/javascript-grid-api">API</a> and numerous <a
            href="/javascript-grid-data-update">Data Update Options</a> the two can interoperate very well.</p>

    <p>There are many ways you can use RxJS with ag-Grid - below we describe two ways to do updates:
        One that processes updates rows alone, and another that supplies the full Row DataSet but with altered rows within it.</p>

    <h2>Option 1 - Providing Updated Data Alone</h2>

    <p>In this example we provide the initial data via a subscription, then provide updates via another.</p>

    <p>The second subscription only provides changed rows - it does not provide the full data set once again.</p>

    <p>To efficiently process this data we need the following:</p>

<p> - A unique key per row - we do this by making use of the <code>getRowNodeId</code> callback</p>

        <snippet>
const gridOptions = {
    getRowNodeId: function (data) {
        // the code is unique, so perfect for the id
        return data.code;
    }
    ...rest of the gridOptions</snippet>

<p>A manner of letting ag-Grid know the type of update we're doing - for this we make use of the <a href="../javascript-grid-data-update">Transaction</a> method </p>

<snippet>
updates$.subscribe((updates) =&gt; {
    gridOptions.api.updateRowData({update: updates}
}));</snippet>


    <p>With these two pieces of code we can supply the updates to ag-Grid and the grid will only re-render the changes rows, resulting
    in much improved performance.</p>

    <?= example('RxJS - Row Updates', 'rxjs-updates', 'generated', array("enterprise" => 1, "extras" => array("lodash", "rxjs"))) ?>

    <h2>Option 2 - Providing Full Row Data With Updates Within</h2>

    <p>In this example we provide the initial data via a subscription, then provide updates via another, as above.</p>

    <p>This time however the second subscription the full row data, with altered row data within the full data set.</p>

    <p>To efficiently process this data we need two things:</p>

    <ul class="content">
        <li>A unique key per row - we do this by making use of the <code>getRowNodeId</code> callback</li>
        <li>A manner of letting ag-Grid know that we're supplying the full data again, but with altered data within - for this we make use of the <a
                href="../javascript-grid-data-update">deltaRowDataMode</a> method</li>
    </ul>

    <snippet>
const gridOptions = {
    getRowNodeId: function (data) {
        // the code is unique, so perfect for the id
        return data.code;
    },
    deltaRowDataMode:true
    ...rest of the gridOptions</snippet>

    <p>With these configuration we can supply the updates to ag-Grid and the grid will only re-render the changes rows, resulting
        in much improved performance.</p>

    <?= example('RxJS - Full Updates', 'rxjs-full', 'generated', array("enterprise" => 1, "extras" => array("lodash", "rxjs"))) ?>



<?php include '../documentation-main/documentation_footer.php';?>
