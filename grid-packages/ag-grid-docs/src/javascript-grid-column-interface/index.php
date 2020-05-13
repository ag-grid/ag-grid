<?php
$pageTitle = "ag-Grid - Core Grid Features: Column Interface";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Column Definitions. Columns are configured in the grid by providing a list of Column Definitions. The attributes you set on the column definitions define how the columns behave e.g. title, width etc. Free and Commercial version available.";
$pageKeywords = "ag-Grid Column Interface";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">Column Interface</h1>

<p class="lead">
    Your application interacts with columns through the grid's column interface. The column interface
    is defined as all the public facing parts of the columns that your application interacts with.
    This section list all the column methods, properties, events etc. for interacting with
    the grid's columns.
</p>

<p>
    The column interface is the combination of the following items:
</p>

<ul class="content">
    <li>
        <a href="../javascript-grid-column-properties/">Column Properties</a>:
        Columns are configured through column definitions. A column definition contains the column properties
        e.g. <code>colDef.pinned='left'</code>.
    </li>
    <li>
        <a href="../javascript-grid-column-api/">Column API</a>:
        The column API is similar to the grid API, the difference is that the column API provides methods
        relevant to columns e.g. <code>columnApi.setColumnVisible('country', false)</code>.
    </li>
    <li>
        <a href="../javascript-grid-column/">Column Object</a>:
        Each column in the grid is represented by a Column object, which in turn has a reference to the column
        definition provided by the application. The Column wraps the Column Definition.
        The Column object has attributes, methods and events for interacting
        with the specific column e.g. <code>column.isVisible()</code>.
    </li>
</ul>

<?php include '../documentation-main/documentation_footer.php';?>
