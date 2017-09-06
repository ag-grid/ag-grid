<?php
$key = "Overview React";
$pageTitle = "React Datagrid";
$pageDescription = "A feature-rich React datagrid designed for Enterprise. Easily integrate with React and React Components to deliver all the grid features that you need.";
$pageKeyboards = "React Data Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1">
        <img style="vertical-align: middle" src="/images/react_large.png" title="React Datagrid" alt="React Datagrid" height="50px"/>
        React Datagrid
    </h1>

    <div class="todo-box" style="height: 400px;">
        Simple ag-Grid with React Plunker Example - enough rows and cols to show scrolling
    </div>

    <div class="list-group" style="margin-top: 20px;">
        <a href="react-getting-started/" class="list-group-item">
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
        <a href="react-more-details/" class="list-group-item">
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
        <a href="example-react/" class="list-group-item">
            <div class="float-parent">
                <div class="section-icon-container">
                    <img src="../images/svg/docs/examples.svg" width="50" />
                </div>
                <h4 class="list-group-item-heading">Full Examples with React</h4>
                <p class="list-group-item-text">
                    This page features examples of using ag-Grid and React together. It covers more of the features of ag-Grid.
                </p>
            </div>
        </a>
    </div>

    <?php include '../home/features.php'; ?>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
