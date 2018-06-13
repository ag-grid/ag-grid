<?php
header("Location: ../javascript-grid-openfin/", true, 301);
exit;
$pageTitle = "ag-Grid Examples: OpenFin Trader Dashboard";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This example demostrates how it can be used within the OpenFin framework. We have built a trader dashboard that you can download and run.";
$pageKeyboards = "ag-grid openfin examples";
$pageGroup = "thirdparty";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

    <h1> ag-Grid <a href="https://openfin.co/">OpenFin</a> Trader Dashboard</h1>

    <note>You can try this example live using the following <a href="https://install.openfin.co/download/?fileName=aggrid_openfin_traderdashboard&config=https://ag-grid.github.io/ag-grid-openfin-example/app-trader-remote.json">Link</a>.
    This will download a Zip file with a Windows executable within - if you run this executable the Trader Dashboard will install and run on your computer.</note>

    <h2>A Trader Dashboard with Tear Out Windows</h2>

    <p>In this example we host the full <a href="../ag-grid-trader-dashboard/">Trader Dashboard</a> within an OpenFin container,
    but also add the ability to <span style="font-style: italic">tear out</span> the Stock Detail panel from the top left.</p>

    <p>The following images show the default state of the application followed by the state of the application with the Detail
    Panel torn out:</p>

    <h3>Default State</h3>
    <img width="100%" src="./trader-default.png" style="padding-bottom: 15px"/>

    <h3>Torn Out State</h3>
    <img width="100%" src="./trader-tearout.png" style="padding-bottom: 15px"/>

    <p>A better illustration of the functionality is shown in the movie below - note how the top grid fills out the remaining space
    when the Detail Panel is torn out. Note too that the Detail Panel could become larger once torn out, perhaps showing
        a more detailed view once torn out:</p>

    <h3>Application in Action</h3>
    <img src="openfin-tearout.gif" width="100%"/>


<?php include '../documentation-main/documentation_footer.php'; ?>
