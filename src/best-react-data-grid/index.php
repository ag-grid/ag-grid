<?php
$pageTitle = "A React Datagrid with 63 Features delivered at speed";
$pageDescription = "ag-Grid is designed for React 16. 63 features with Enterprise grade performance. We ave just lanuched Version 17 and our product is available in two versions. ag-Grid Community is free and open source while ag-Grid Enterprise can be trialled for two months without obligation. We have detailed React tutorials and How To guides and sample code for all of our features.";
$pageKeyboards = "React Data Grid";
$pageGroup = "basics";
include '../landing-pages/header.php';
?>

<div>

    <h1> React Datagrid </h1>
    
    <p class="lead">ag-Grid is designed to integrate deeply into the React framework. 
You can use ag-Grid as a React component to quickly add a datagrid or datatables to your React application. 
All of the examples throughout our documentation contains sample React code which is also viewable on Plunker. 
The <a href="../react-getting-started/">Getting Started section</a> contains a step-by step tutorial on how to integrade ag-Grid in your React project.
</p>

<ul>
    <li>ag-Grid delivers the performance you need in your React application - test it for yourself on <a href="../example.php">our Demo page</a>, select 100,000 rows and watch it fly.</li>
    <li>You can use ag-Grid as a React component to quickly add a datagrid or datatables to your React application. The grid is designed to be highly configurable so you can have the granular level of control required for modern Enterprise applications.</li>
    <li>Browse through <a href="../javascript-grid-features/">our extensive features</a> to select what you need and quickly add these to your application. Every feature has sample code so you can have it up and running quickly.</li>
</ul>

<h2>React Example</h2>
    <?= example('ag-Grid in React', 'full-rich-markup', 'react', array( "enterprise" => 1, "exampleHeight" => 525, "showResult" => true, "extras" => array( "fontawesome" ) )); ?>

<h2>Versions and Features</h2>

<p>ag-Grid comes in two versions. ag-Grid Community Edition is Free and Open Source, we believe it covers all of the requirements of an Open Source Datagrid. 
If this is the right tool for you, we encourage you to use this. Follow <a href="https://medium.com/ag-grid/">our ag-Grid publication in Medium</a> to get updates on our releases and upcoming plans.</p> 

<p>ag-Grid Enterprise builds on ag-Grid Community via a dependency and adds more heavyweight features that we believe separate us from our competitors. 
This version is available under commercial license and comes with 1 Year of Support, Maintenance and Updates.</p>

<p>You can find a full list of all ag-Grid features in our <a href="../javascript-grid-features/">documentation &rt; features section</a>. We have indicated the Enterprise features with the <span class="enterprise-icon">e</span> icon.</p>

<h2>How Do I Get Started?</h2>

<p>We have put together a detailed guide on <a href="../react-getting-started/">Getting Started with React and ag-Grid</a>. This covers getting up and running with ag-Grid Community and then adding ag-Grid Enterprise.</p>

<h2>What About Detailed Guides and Examples?</h2>

<p>We have created a number of more detailed guides as follows:</p>

<ul>
    <li><a href="../react-more-details/">ag-Grid React Overview</a></li>
    <li><a href="../react-redux-integration-pt1/">Redux Integration - Part 1</a></li>
    <li><a href="../react-redux-integration-pt2/">Redux Integration - Part 2</a></li>
</ul>

<p>In addition to the above, you can find a <a href="../example-react-redux/">live example of ag-Grid / Redux integration</a> in our examples section.</p>

</div>

<?php include '../landing-pages/footer.php'; ?>
