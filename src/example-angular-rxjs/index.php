<?php
$key = "Angular RxJS";
$pageTitle = "ag-Grid Angular Components with RxJS";
$pageDescription = "Examples of using ag-Grid with Angular and RxJS";
$pageKeyboards = "ag-Grid angular rxjs";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Angular Component using RxJs Example</h2>
    <h3>With updated rows only supplied to the grid.</h3>
    <p>A simple example where the grid receives the initial data from a subscription, and updates via another.</p>
    <p>In this example the grid only receives the updated rows and uses the <a href="../javascript-grid-data-update">Transaction</a> method
        of row updates.</p>

    <show-complex-example example="../ng2-example/index.html?fromDocs=true&example=rxjs-by-row"
                          sources="{
                            [
                                { root: '/ng2-example/app/rxjs-component-example/', files: 'rxjs-by-row.component.ts,rxjs-by-row.component.html,mockServer.service.ts' },
                                { root: '/ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/WhzFdC/">
    </show-complex-example>

    <h2>Angular Component using RxJs Example</h2>
    <h3>With full data set supplied to the grid, with changed data within.</h3>
    <p>A simple example where the grid receives the initial data from a subscription, and updates via another.</p>
    <p>In this example the grid only receives the the full row data via the 2nd subscription but makes uses of the <a href="../javascript-grid-data-update">deltaRowDataMode</a> method
        of row updates for improved performance.</p>

    <show-complex-example example="../ng2-example/index.html?fromDocs=true&example=rxjs-by-dataset"
                          sources="{
                            [
                                { root: '/ng2-example/app/rxjs-component-example/', files: 'rxjs-by-bulk.component.ts,rxjs-by-bulk.component.html,mockServer.service.ts' },
                                { root: '/ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/c43Hkm/">
    </show-complex-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
