<?php
$key = "RxJS";
$pageTitle = "ag-Grid with RxJS";
$pageDescription = "ag-Grid with RxJS";
$pageKeyboards = "ag-Grid rxjs";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1>ag-Grid with RxJS</h1>

    <p>It is possible to use RxJS with ag-Grid - with the rich <a href="/javascript-grid-api">API</a> and numerous <a
            href="/javascript-grid-data-update">Data Update Options</a> the two can interoperate very well.</p>

    <p>There are many ways you can use RxJS with ag-Grid - below we describe two ways to do updates:
        One that processes updates rows alone, and another that supplies the full Row DataSet but with altered rows within it.</p>

    <h2>Option 1 - Providing Updated Data Alone</h2>
    
    <p>In this example we provide the initial data via a subscription, then provide updates via another.</p>
    
    <p>The second subscription only provides changed rows - it does not provide the full data set once again.</p>
    
    <p>To efficiently process this data we need two things:</p>
    
    <ul>
        <li>A unique key per row - we do this by making use of the <code>getRowNodeId</code> callback</li>
        <pre>
const gridOptions = {
    getRowNodeId: function (data) {
        // the code is unique, so perfect for the id
        return data.code;
    }
    ...rest of the gridOptions
</pre>
        <li>A manner of letting ag-Grid know the type of update we're doing - for this we make use of the <a
                href="../javascript-grid-data-update">Transaction</a> method</li>
<pre>
updates$.subscribe((updates) => {
    gridOptions.api.updateRowData({update: updates}
}));
</pre>
    </ul>

    <p>With these two pieces of code we can supply the updates to ag-Grid and the grid will only re-render the changes rows, resulting
    in much improved performance.</p>

    <show-complex-example example="rxjsExampleUpdatesOnly.html"
                          sources="{
                            [
                                { root: './', files: 'rxjsExampleUpdatesOnly.js,rxjsExampleUpdatesOnly.html,mockServer.js' }
                            ]
                          }">
    </show-complex-example>

    <h2>Option 2 - Providing Full Row Data With Updates Within</h2>

    <p>In this example we provide the initial data via a subscription, then provide updates via another, as above.</p>

    <p>This time however the second subscription the full row data, with altered row data within the full data set.</p>

    <p>To efficiently process this data we need two things:</p>

    <ul>
        <li>A unique key per row - we do this by making use of the <code>getRowNodeId</code> callback</li>
        <li>A manner of letting ag-Grid know that we're supplying the full data again, but with altered data within - for this we make use of the <a
                href="../javascript-grid-data-update">deltaRowDataMode</a> method</li>
    </ul>
    <pre>
const gridOptions = {
    getRowNodeId: function (data) {
        // the code is unique, so perfect for the id
        return data.code;
    },
    deltaRowDataMode:true
    ...rest of the gridOptions
</pre>

    <p>With these configuration we can supply the updates to ag-Grid and the grid will only re-render the changes rows, resulting
        in much improved performance.</p>

    <show-complex-example example="rxjsExampleFullDataSet.html"
                          sources="{
                            [
                                { root: './', files: 'rxjsExampleFullDataSet.js,rxjsExampleFullDataSet.html,mockServer.js' }
                            ]
                          }">
    </show-complex-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
