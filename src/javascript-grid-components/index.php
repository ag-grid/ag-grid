<?php
$pageTitle = "ag-Grid Components";
$pageDescription = "ag-Grid Components";
$pageKeyboards = "ag-Grid Components";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

    <div>

        <h1 class="first-h1" id="Components">
            <img src="../images/svg/docs/components.svg" width="50"/>
            Components
        </h1>

        <p>
            By default, the grid does not need to you to provide any components.
            However to allow you to customise the grid, it allows you to plug
            your own components into the grid.
        </p>

        <p>
            The following sections show how to use your own components inside the grid.
            Each component can be done using plain JavaScript or using one of the
            supported frameworks.
        </p>

        <div class="row">
            <div class="col-md-6">
                <div class="list-group">

                    <a href="../javascript-grid-cell-rendering-components/" class="list-group-item">
                        <div class="float-parent">
                            <div class="section-icon-container">
                                <img src="../images/components.png" width="50" />
                            </div>
                            <h3 class="list-group-item-heading">Cell Renderer</h3>
                            <p class="list-group-item-text">
                                A cell renderer customises the contents of a cell.
                            </p>
                        </div>
                    </a>

                </div>
            </div>

            <div class="col-md-6">
                <div class="list-group">

                    <a href="../javascript-grid-cell-editor/" class="list-group-item">
                        <div class="float-parent">
                            <div class="section-icon-container">
                                <img src="../images/components.png" width="50" />
                            </div>
                            <h3 class="list-group-item-heading">Cell Editor</h3>
                            <p class="list-group-item-text">
                                A cell editor customises the editing of a cell.
                            </p>
                        </div>
                    </a>

                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="list-group">
                    <a href="../javascript-grid-filter-component/" class="list-group-item">
                        <div class="float-parent" style="display: block;">
                            <div class="section-icon-container">
                                <img src="../images/components.png" width="50" />
                            </div>
                            <h3 class="list-group-item-heading">Filter Component</h3>
                            <p class="list-group-item-text">
                                For custom column filter that appears inside the column menu.
                            </p>
                        </div>
                    </a>

                </div>
            </div>

            <div class="col-md-6">
                <div class="list-group">
                    <a href="../javascript-grid-floating-filter-component/" class="list-group-item">
                        <div class="float-parent" style="display: block;">
                            <div class="section-icon-container">
                                <img src="../images/components.png" width="50" />
                            </div>
                            <h3 class="list-group-item-heading">Floating Filter Component</h3>
                            <p class="list-group-item-text">
                                For custom column floating filters that display in the header area.
                            </p>
                        </div>
                    </a>

                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="list-group">

                    <a href="../javascript-grid-date-component/" class="list-group-item">
                        <div class="float-parent">
                            <div class="section-icon-container">
                                <img src="../images/components.png" width="50" />
                            </div>
                            <h3 class="list-group-item-heading">Date Component</h3>
                            <p class="list-group-item-text">
                                To customise the date selection component in the date filter.
                            </p>
                        </div>
                    </a>

                </div>
            </div>

            <div class="col-md-6">
                <div class="list-group">

                    <a href="../javascript-grid-header-rendering/" class="list-group-item">
                        <div class="float-parent">
                            <div class="section-icon-container">
                                <img src="../images/components.png" width="50" />
                            </div>
                            <h3 class="list-group-item-heading">Header Component</h3>
                            <p class="list-group-item-text">
                                To customise column headers, including column groups.
                            </p>
                        </div>
                    </a>

                </div>
            </div>
        </div>

        <h2>JavaScript or Framework</h2>

        <p>
            If you are using a framework, then you have a choice of the following:
            <ol>
                <li>Provide an ag-Grid component in JavaScript.</li>
                <li>Provide an ag-Grid component as a framework component (eg React or Angular).</li>
            </ol>
            For example if you want to build a cell renderer and you are using React, you have the choice
            to build the cell renderer using React or using plain JavaScript.
        </p>

        <p>
            If using a framework, you should first read how to build the component using plain JavaScript.
            This is because the framework specific component builds on what you learn from the JavaScript
            component.
        </p>

    </div>

<?php include '../documentation-main/documentation_footer.php'; ?>