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
        one or more of the below are complete. All of these are being developed out in coordination with
        large ag-Grid clients including one leading investment bank in London and one leading fund
        management company in Canada.
    </p>

    <!--<h2>Work in Progress Movie - Pivoting</h2>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/jCId-Lbg_6k" frameborder="0" allowfullscreen></iframe>
    -->

<!--    <h4>Aurelia Support</h4>

    <p>
        Aurelia is getting bigger - we want to add it to our list of supported frameworks. Right now we know people
        are already using ag-Grid with Aurelia, using either the Web Components or Plain JavaScript versions. We
        want native support for  Aurelia out of the box. This will be in both free and enterprise versions.
    </p>
-->
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

</div>

<?php include '../documentation-main/documentation_footer.php';?>
