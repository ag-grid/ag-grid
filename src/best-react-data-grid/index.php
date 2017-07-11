<?php
$key = "Overview React";
$pageTitle = "React Grid";
$pageDescription = "A feature-rich data grid designed for React and Enterprise. Easily integrate with React and React Components to deliver all the grid features that you need.";
$pageKeyboards = "React Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1>
        <img style="vertical-align: middle" src="/images/react_large.png" height="50px"/>
        ag-Grid - the Best React Datagrid for Enterprise
    </h1>

    <p>
        The ag-Grid-React project is used by thousands of enterprises for their data grid needs inside React applications.
    </p>

    <ul>
        <li>Use ag-Grid as a React Component</li>
        <li>Customise your Grid using your own React Components</li>
        <li>Support for Redux data stores</li>
    </ul>

    <h2>
        Full Feature Set
    </h2>
    
    <p>
        All of the extensive features (filtering, sorting, grouping & aggregation, pivoting etc)
        of ag-Grid are available in ag-Grid React.
    </p>

    <div style="text-align: center;">

        <a class="btn btn-primary btn-large" href="../javascript-grid-features/">
            ag-Grid Features
        </a>

        &nbsp;
        &nbsp;
        &nbsp;
        &nbsp;
        &nbsp;

        <a class="btn btn-primary btn-large" href="../example.php">
            ag-Grid Demo
        </a>

    </div>

    <h2>
        Using Our Documentation
    </h2>
    <p>
        The next sections cover how to use our Documentation to implement ag-Grid with React. We suggest you work through the first two in order and then dive into the wider documentation.
        We have also included a section that includes examples of ag-Grid and React.
    </p>

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
        <a href="/example-react/" class="list-group-item">
            <div class="float-parent">
                <div class="section-icon-container">
                    <img src="../images/svg/docs/examples.svg" width="50" />
                </div>
                <h4 class="list-group-item-heading">Examples with React</h4>
                <p class="list-group-item-text">
                    This page features examples of using ag-Grid and React together. It covers more of the features of ag-Grid.
                </p>
            </div>
        </a>
    </div>

</div>


<?php include '../documentation-main/documentation_footer.php'; ?>
