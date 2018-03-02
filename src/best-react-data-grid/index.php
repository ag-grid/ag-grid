<?php
$pageTitle = "A React Datagrid with 63 Features delivered at speed";
$pageDescription = "ag-Grid is designed for React 16. 63 features with Enterprise grade performance. We ave just lanuched Version 17 and our product is available in two versions. ag-Grid Community is free and open source while ag-Grid Enterprise can be trialled for two months without obligation. We have detailed React tutorials and How To guides and sample code for all of our features.";
$pageKeyboards = "React Data Grid";
$pageGroup = "basics";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1> React Datagrid </h1>
    
    <p class="lead">
        ag-Grid is designed to integrate deeply into the React framework. You can use ag-Grid as a React <a href="../javascript-grid-components/">component.</a> Quickly add a datagrid or datatables to your React application.
        Your users can leverage our 63 <a href="/javascript-grid-features/">features</a>. All of he examples throughout our documentation contains sample React code which is also viewable on <a href="https://plnkr.co/"> 
        Plunker</a>. The <a href="/react-getting-started/">Getting Started</a> section contains How To guides and tutorials so you can learn the product step-by-step.
    </p>

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

<?php
$featuresRoot = '../javascript-grid-features';
include '../javascript-grid-features/gridFeatures.php';
?>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
