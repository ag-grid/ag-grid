<?php
$key = "Overview React";
$pageTitle = "Best React Datagrid Overview";
$pageDescription = "A feature rich datagrid designed for Enterprise. Easily integrate with React to deliver filtering, grouping, aggregation, pivoting and much more.";
$pageKeyboards = "React Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>
        <img style="vertical-align: middle" src="/images/react_large.png" height="50px"/>
        Overview
    </h2>

    <p>The React documentation is broken down into the following two sections:</p>

    <div class="list-group">
        <a href="/react-getting-started/" class="list-group-item">
            <div class="float-parent">
                <div class="section-icon-container">
                    <img src="../images/svg/docs/getting_started.svg" width="50" />
                </div>
                <h4 class="list-group-item-heading">Getting Started</h4>
                <p class="list-group-item-text">
                    Learn how to get a simple application working using ag-Grid and ReactJS.
                    Start here to get a simple grid working in your application, then follow on
                    to further sections to understand how particular features work.
                </p>
            </div>
        </a>
        <a href="/react-more-details/" class="list-group-item">
            <div class="float-parent">
                <div class="section-icon-container">
                    <img src="../images/svg/docs/more-details2.svg" width="50" />
                </div>
                <h4 class="list-group-item-heading">More Details</h4>
                <p class="list-group-item-text">
                    Dive deeper in how to use ag-Grid with React, including referencing dependencies,
                    an overview on interfacing, integrating with redux, performance and more.
                </p>
            </div>
        </a>
    </div>
</div>


<?php include '../documentation-main/documentation_footer.php'; ?>
