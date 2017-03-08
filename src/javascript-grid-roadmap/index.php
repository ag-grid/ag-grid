<?php
$key = "Roadmap";
$pageTitle = "ag-Grid Feature Roadmap";
$pageDescription = "Summary of items we will be implementing into ag-Grid over the new few months and year.";
$pageKeyboards = "ag-Grid Roadmap";
$pageGroup = "misc";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>ag-Grid Feature Roadmap</h2>

    <p>
        Below are listed the 'next big things' on the roadmap for ag-Grid. During the development,
        other smaller items will be included. The next major release of ag-Grid will be released once
        one or more of the below are complete.
    </p>

    <h4>Enterprise Row Model (ag-Grid enterprise)</h4>
    <p>
        Work has started on an Enterprise Row Model which will allow for:
    <ul>
        <li>Server Side Filtering</li>
        <li>Server Side Grouping</li>
        <li>Server Side Pivoting</li>
        <li>Lazy Loading of Groups</li>
    </ul>
    </p>

    <h4>Pinnable Filters in Tool Panel (ag-Grid enterprise)</h4>
    <p>
        Modern reporting tools show filters in a panel, so you can interact with a set of filters
        concurrently. ag-Grid will allow this option by having a 'pinnable' option on the filters, which
        when clicked, will move the filter to the tool panel (the right hand panel that currently has
        column management). This will allow the tool panel to host and display multiple filters concurrently.
    </p>

    <h4>General Cleanup</h4>
    <p>
        We are constantly refactoring and making things better. Expect the whole grid to be face lifted on
        a continued basis.
    </p>

    <p>For a full list of up and coming items please see our <a href="../ag-grid-pipeline/">Pipeline</a> page.</p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
