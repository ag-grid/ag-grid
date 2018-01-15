<?php
$pageTitle = "ag-Grid OpenFin Integration";
$pageDescription = "ag-Grid OpenFin Integration Examples";
$pageKeyboards = "ag-grid openfin examples";
$pageGroup = "thirdparty";
include '../documentation-main/documentation_header.php';
?>
    <h1>ag-Grid <a href="https://openfin.co/">OpenFin</a> Integration</h1>

    <p class="lead"><a href="https://openfin.co/">OpenFin</a> provides runtime technology solutions for financial desktops. Below we document and illustrate how you can use
    ag-Grid within the <a href="https://openfin.co/">OpenFin</a> platform.</p>

    <note>Full working examples can be found <a href="https://github.com/ag-grid/ag-grid-openfin-example"> in GitHub</a></note>

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

    <img src="../images/openfin-simple-grid.png" class="img-fluid" />

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

    <p>Please see the section on <a href="../javascript-grid-openfin-dashboard/">A Trader Dashboard with Tear Out Windows</a> for
    information about the ag-Grid OpenFin Trader Dashboard.</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
