<?php
$pageTitle = "ag-Grid Examples: OpenFin Integration";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. OpenFin provides runtime technology solutions for financial desktops. in this example, we document and illustrate how you can use ag-Grid within the OpenFin platform.";
$pageKeyboards = "ag-grid openfin examples";
$pageGroup = "thirdparty";
include '../documentation-main/documentation_header.php';
?>
    <h1>ag-Grid <a href="https://openfin.co/">OpenFin</a> Integration</h1>

    <p class="lead"><a href="https://openfin.co/">OpenFin</a> provides runtime technology solutions for financial desktops. Below we document and illustrate how you can use
    ag-Grid within the <a href="https://openfin.co/">OpenFin</a> platform.</p>

    <note>Full working examples can be found <a href="https://github.com/ag-grid/ag-grid-openfin-example"> in GitHub</a>.</note>

    <h2>Installation</h2>

<snippet language="sh">
git clone https://github.com/ag-grid/ag-grid-openfin-example
cd ag-grid-openfin-example
npm install
</snippet>

    <p>Now that the examples and dependencies have been installed, you can run the examples. Open a terminal and run
        the following to serve up the applications:</p>

<snippet language="sh">
npm run server
</snippet>

    <p>Depending on the example you wish you run, you will need to open one or two more terminal windows - see each example for
    more details.</p>

    <h2>A Simple Grid</h2>

    <p>A simple ag-Grid running within the <a href="https://openfin.co/">OpenFin</a> container.</p>

    <p>Open a terminal and run the following command:</p>

<snippet language="sh">
npm run simple-grid
</snippet>

    <img src="../images/seed.png" class="img-fluid" />

    <h2>A Richer Grid</h2>

    <p>A more sophisticated ag-Grid example running within the <a href="https://openfin.co/">OpenFin</a> container.</p>

    <p>Open a terminal and run the following command:</p>

    <snippet language="sh">
npm run rich-grid</snippet>

    <img src="../images/openfin-rich-grid.png" class="img-fluid"/>

    <h2>A Master/Detail Grid - Single Application</h2>

    <p>A MasterDetail example within a single <a href="https://openfin.co/">OpenFin</a> application</p>

    <p>Open a terminal and run the following command:</p>

    <snippet language="sh">
npm run masterdetail-master-single</snippet>

    <img src="../images/openfin-masterdetail-single.png" class="img-fluid"/>

    <h2>A Master/Detail Grid - Multiple Applications</h2>

    <p>A MasterDetail example within seperate <a href="https://openfin.co/">OpenFin</a> applications making use of the <a href="https://openfin.co/">OpenFin</a> <code>InterApplicationBus</code>.</p>

    <p>Here when a row is clicked on in the "master" application, more detailed information is displayed in the "detail" application.</p>

    <p>Open a terminal and run the following command:</p>

    <snippet language="sh">
npm run masterdetail-master</snippet>

    <p>Open another terminal and run the following command:</p>

    <snippet language="sh">
npm run masterdetail-detail</snippet>

    <img class="img-fluid" src="../images/openfin-masterdetail-multi.png"/>


    <h2>A Summary/Graph Grid - Multiple Applications</h2>

    <p>Similar to the Master/Detail example above, this example runs within seperate <a href="https://openfin.co/">OpenFin</a> applications making use
        of the <a href="https://openfin.co/">OpenFin</a> <code>InterApplicationBus</code>.</p>

    <p>Here when a row is clicked on in the "master" application, more detailed information is displayed in the "detail"
        application making use of <code>d3</code> to render the resulting graphs.</p>

    <p>You can switch between metrics (Open, Close, High, Low etc) or on different stocks and with each action the Graph
    application will be updated accordingly.</p>

    <p>Open a terminal and run the following command:</p>

    <snippet language="sh">
npm run stocks-master</snippet>

    <p>Open another terminal and run the following command:</p>

    <snippet language="sh">
npm run stocks-detail</snippet>

    <img class="img-fluid" src="../images/openfin-masterdetail-graph.png"/>

    <h2>A Trader Dashboard with Tear Out Windows</h2>

    <note>You can try this example live using the following <a href="https://install.openfin.co/download/?fileName=aggrid_openfin_traderdashboard&config=https://ag-grid.github.io/ag-grid-openfin-example/app-trader-remote.json">Link</a>.
    This will download a Zip file with a Windows executable within - if you run this executable the Trader Dashboard will install and run on your computer.</note>

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
