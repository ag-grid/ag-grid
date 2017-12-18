<?php
$pageTitle = "ag-Grid OpenFin Trader Dashboard";
$pageDescription = "ag-Grid OpenFin Trader Dashboard Tear Out";
$pageKeyboards = "ag-grid openfin examples";
$pageGroup = "thirdparty";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h3><img src="../images/openfin.png" width="50"  /> ag-Grid <a href="https://openfin.co/">OpenFin</a> Trader Dashboard</h3>

    <note>You can try this example live using the following <a href="https://dl.openfin.co/services/download?fileName=aggrid_openfin_traderdashboard&config=https://ag-grid.github.io/ag-grid-openfin-example/app-trader-remote.json">Link</a>.
    This will download a Zip file with a Windows executable within - if you run this executable the Trader Dashboard will install and run on your computer.</note>

    <h3>A Trader Dashboard with Tear Out Windows</h3>

    <p>In this example we host the full <a href="../ag-grid-trader-dashboard/">Trader Dashboard</a> within an OpenFin container,
    but also add the ability to <span style="font-style: italic">tear out</span> the Stock Detail panel from the top left.</p>

    <p>The following images show the default state of the application followed by the state of the application with the Detail
    Panel torn out:</p>

    <h5>Default State</h5>
    <img width="100%" src="./trader-default.png" style="padding-bottom: 15px"/>

    <h5>Torn Out State</h5>
    <img width="100%" src="./trader-tearout.png" style="padding-bottom: 15px"/>

    <p>A better illustration of the functionality is shown in the movie below - note how the top grid fills out the remaining space
    when the Detail Panel is torn out. Note too that the Detail Panel could become larger once torn out, perhaps showing
        a more detailed view once torn out:</p>

    <h5>Application in Action</h5>
    <img src="openfin-tearout.gif" width="100%"/>



</div>
<?php include '../documentation-main/documentation_footer.php'; ?>
