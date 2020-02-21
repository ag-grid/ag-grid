<?php
$pageTitle = "ag-Grid Features: Context Object";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. It provides the ability to pass down values to the renderers or use in the rendering process. These are stored in the context in the grid options.";
$pageKeywords = "ag-Grid Context";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Context</h1>

    <p class="lead">
        This sections covers how shared contextual information can be passed around the grid.
    </p>

    <h2>Overview</h2>

    <p>The context object is passed to most of the callbacks used in the grid. The purpose of the context object is to allow the client application to pass details to
       custom callbacks such as the <a href="../javascript-grid-cell-rendering/">Cell Renderers</a> and
        <a href="../javascript-grid-cell-editing/">Cell Editors</a>.
    </p>

    <p>
        Note that the grid does not place anything into the context and it is not used internally by the grid.
    </p>

    <h2>Context Object Example</h2>

    <p>
        The example below demonstrates how the context object can be used. Note the following:
    </p>

    <ul>
        <li>
            Selecting the reporting currency from the drop down places it in the context object.
        </li>
        <li>
            When the reporting currency is changed the cell renderer uses the currency supplied in the
            context object to calculate the value using: <code>params.context.reportingCurrency</code>.
        </li>
        <li>
            The price column header is updated to show the selected currency using a header value getter using:
            <code>ctx.reportingCurrency</code>.
        </li>
    </ul>
    <br/>

    <?= grid_example('Context Object', 'context', 'vanilla') ?>


<?php include '../documentation-main/documentation_footer.php';?>
