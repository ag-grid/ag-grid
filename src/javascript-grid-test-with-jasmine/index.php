<?php
$pageTitle = "ag-Grid Reference: JavaScript Datagrid - Test With Jasmine";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers downloading the JavaScript packages for ag-Grid and ag-Grid Enterprise.";
$pageKeyboards = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<h1>Testing ag-Grid Applications with Jasmine</h1>
    <p>In our <a href="https://github.com/ag-grid/ag-grid-seed">Javascript Seed Repo</a> we provide working
        examples of how to test your project with Jasmine (under the <code>javascript</code> project).</p>

    <p>In order to test your application you need to ensure that the Grid API is available - the best way to do this
    is to set a flag when the Grid's <code>gridReady</code> event fires, but this requires an application code change.</p>

    <p>An alternative is to use a utility function that polls until the API has been set on the <code>GridOptions</code>:</p>

    <snippet>
function waitForGridApiToBeAvailable(gridOptions, success) {
    // recursive without a terminating condition, 
    // but jasmines default test timeout will kill it (jasmine.DEFAULT_TIMEOUT_INTERVAL)
    if(gridOptions.api) {
        success()
    } else {
        setTimeout(function () {
            waitForGridApiToBeAvailable(gridOptions, success);
        }, 500);
    }
}   </snippet>

    <p>Once the API is ready, we can then invoke Grid <code>API</code> and <code>ColumnApi</code> methods:</p>

<snippet>
it('select all button selects all rows', () => {
    selectAllRows();                    // selectAllRows is a global function created in the application code 
    expect(gridOptionsUnderTest.api.getSelectedNodes().length).toEqual(3);
});
</snippet>


<?php include '../documentation-main/documentation_footer.php'; ?>

