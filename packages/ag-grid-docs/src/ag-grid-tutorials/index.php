<?php
$pageTitle = "ag-Grid Tutorials: Intermediate Level with Examples";
$pageDescription = "We've put together some tutorials so you can get the best from ag-Grid. This page has step by step videos on building up ag-Grid. Follow the videos to learn how the examples are built.";
$pageKeyboards = "ag-Grid tutorials";
$pageGroup = "misc";
include '../getting-started/header.php';
?>
    <h1>ag-Grid Video Tutorial</h1>

    <note>
        These tutorials were created in an older version of ag-Grid. The general principles are all still true,
        however you will find items such as how to do grouping and aggregation have changed in never versions
        of ag-Grid. The features are all still supported (and now better), just configured slightly differently.
        To see how to do things with the latest release, see the documentation. It's easy keep the documentation
        up to date with each release, but not easy to keep videos up to date.
    </note>

    <p>
        This is an intermediate tutorial on how to use the grid. If you are just starting, you might
        find this a bit too difficult to follow. This tutorial introduces expressions, value getters,
        context and cell class rules.
    </p>

    <p>
        The tutorial uses the grid without any dependencies. The concepts can be used with AngularJS 1.x or any
        other framework, you just need to follow the 'getting started' section for the relevant framework.
    </p>

    <p>
        The result of this tutorial will be the grid in the example <a href="../example-expressions-and-context/">
            Expressions and Context
        </a>.
    </p>

    <p>The source code for each step is given below each video.</p>

    <h2>Step 1 - Basic Grid</h2>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/OEy2CL4jQvU" frameborder="0" allowfullscreen></iframe>
    <?= example('Basic Grid', 'start') ?>

    <h2>Step 2 - Loading Data</h2>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/BR-ARyQZm4E" frameborder="0" allowfullscreen></iframe>
    <?= example('Loading Data', 'load-data') ?>

    <h2>Step 3 - Value Getters</h2>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/hZGHoo3RPGI" frameborder="0" allowfullscreen></iframe>
    <?= example('Value Getters', 'value-getters') ?>

    <h2>Step 4 - Cell Class Rules</h2>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/MRDG741Wz0k" frameborder="0" allowfullscreen></iframe>
    <?= example('Cell Class Rules', 'cell-class-rules') ?>

    <h2>Step 5 - Cell Renderer</h2>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/6Ha1pEuYb6w" frameborder="0" allowfullscreen></iframe>

    <?= example('Cell Renderer', 'cell-renderer') ?>

    <h2>Step 6 - Expressions</h2>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/qPKG7KRNbnk" frameborder="0" allowfullscreen></iframe>

    <?= example('Expressions', 'expressions') ?>

<?php include '../getting-started/footer.php';?>
