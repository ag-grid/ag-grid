<?php
$pageTitle = "React Datagrid - Excel-like React Component";
$pageDescription = "Now supporting React 16. A feature-rich React datagrid designed for Enterprise. Easily integrate with React and React Components to deliver all the grid features that you need.";
$pageKeyboards = "React Data Grid";
$pageGroup = "basics";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1> React Datagrid </h1>

    <?= example('ag-Grid in React', 'full-rich-markup', 'react', array( "enterprise" => 1, "exampleHeight" => 525, "showResult" => true, "extras" => array( "fontawesome" ) )); ?>

<div class="docs-homepage-section-preview">
    <div>
    <h2>Getting Started</h2>
    <p>
        Learn how to get a simple application working using ag-Grid and React.
        Start here to get a simple grid working in your application, then follow on
        to further sections to understand how particular features work.
    </p>
    <p> <a href="../react-getting-started/">Go to Getting Started</a> </p>
    </div>
</div>

<div class="docs-homepage-section-preview">
    <div>
    <h2>More Details</h2>
    <p>
        Dive deeper in how to use ag-Grid with React, including referencing dependencies, an overview on interfacing, integrating with redux, performance and more.
    </p>
    <p> <a href="../react-more-details/">Go to More Details</a> </p>
    </div>
</div>

<div class="docs-homepage-section-preview">
    <div>
    <h2>Full Examples with React</h2>
    <p>
        This page features examples of using ag-Grid and React together. It covers more of the features of ag-Grid.
    </p>
    <p> <a href="../example-react/">Go to Full Examples</a> </p>
    </div>
</div>

<?php
$featuresRoot = '../javascript-grid-features';
include '../javascript-grid-features/gridFeatures.php';
?>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
