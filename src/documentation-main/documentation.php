<?php
$key = "index";
$pageTitle = "ag-Grid JavaScript Grid Documentation";
$pageDescription = "Introduction page of documentation for ag-Grid JavaScript Grid";
$pageKeyboards = "ag-Grid JavaScript Grid Documentation";
include 'documentation_header.php';
?>


<div class="row">
    <div class="col-md-9">
        <div style="padding: 10px;">
            <h2 class="documentationHeader">Documentation</h2>
            ag-Grid is an Enterprise Grade Javascript Data Grid.
            The purpose of ag-Grid is to provide a data grid that enterprise software developers
            can use for building applications such as reporting and data analytics, business workflow
            and data entry. The author, having spent years building applications in C++, Java and
            Javascript, found the choice of grids in JavaScript lacking, especially in comparison
            to what was in other languages frameworks. ag-Grid is the result of turning frustration
            into answers, providing a grid worthy of enterprise development.
        </div>
        <div class="list-group">
            <div class="list-group-item">
                <a href="/javascript-grid-getting-started/" style="color: #555;">
                <div class="float-parent">
                    <div class="section-icon-container">
                        <img src="../images/svg/docs/getting_started.svg" width="50" />
                    </div>
                    <h4 class="list-group-item-heading">Getting Started</h4>
                    <p class="list-group-item-text">
                        Learn how to get a simple
                        application working using ag-Grid with the framework that you have chosen.
                        Start here to get a simple grid working in your application, then follow on
                        to further sections to understand how particular features work.
                    </p>
                </div>
                <div style="display: flex;justify-content: space-between;padding-top: 10px">
                    <a href="../javascript-grid-getting-started?framework=javascript" style="margin-left: -15px;color: #555;"><img style="vertical-align: middle" src="/images/javascript.png"
                                                                                           height="25px"/>JavaScript</a>
                    <a href="../javascript-grid-getting-started?framework=angular" style="color: #555;"><img style="vertical-align: middle" src="/images/angular2_small.png"
                                                                                        height="25px"/>Angular</a>
                    <a href="../javascript-grid-getting-started?framework=react" style="color: #555;"><img style="vertical-align: middle" src="/images/react_small.png"
                                                                                       height="25px"/>React</a>
                    <a href="../javascript-grid-getting-started?framework=vue" style="color: #555;"><img style="vertical-align: middle" src="/images/vue_small.png"
                                                                                     height="25px"/>VueJS</a>
                    <a href="../javascript-grid-getting-started?framework=aurelia" style="color: #555;"><img style="vertical-align: middle" src="/images/aurelia_small.png"
                                                                                         height="25px"/>Aurelia</a>
                    <a href="../javascript-grid-getting-started?framework=webcomponents" style="color: #555;"><img style="vertical-align: middle" src="/images/webComponents_small.png"
                                                                                               height="25px"/>Web Components</a>

                </div>
                </a>
            </div>
            <a href="/javascript-grid-interfacing-overview/" class="list-group-item">
                <div class="float-parent">
                    <div class="section-icon-container">
                        <img src="../images/svg/docs/interfacing.svg" width="50" />
                    </div>
                    <h4 class="list-group-item-heading">Interfacing</h4>
                    <p class="list-group-item-text">

                        Lists all the configuration options (properties, events, api etc) for ag-Grid.
                        Use this as a quick reference to look all available options.
                    </p>
                </div>
            </a>

            <a href="/javascript-grid-features/" class="list-group-item">
                <div class="float-parent">
                    <div class="section-icon-container">
                        <img src="../images/svg/docs/features.svg" width="50" />
                    </div>
                    <h4 class="list-group-item-heading">Features</h4>
                    <p class="list-group-item-text">
                        A detailed look at all the features. Go here for detailed explanations and examples
                        for all features. Items that are only available
                        in ag-Grid Enterprise are marked with the "<img src="../images/enterprise.png"/>" symbol.
                    </p>
                </div>
            </a>

            <a href="/javascript-grid-row-models/" class="list-group-item">
                <div class="float-parent">
                    <div class="section-icon-container">
                        <img src="../images/svg/docs/row_models.svg" width="50" />
                    </div>
                    <h4>Row Models</h4>
                    <p class="list-group-item-text">
                        The grid supports many ways to load the data eg <i>pagination</i> and <i>virtual
                        scrolling</i>. Learn how to apply these techniques to manage large amounts of
                        data.
                    </p>
                </div>
            </a>

            <a href="/javascript-grid-styling/" class="list-group-item">
                <div class="float-parent">
                    <div class="section-icon-container">
                        <img src="../images/svg/docs/themes.svg" width="50" />
                    </div>
                    <h4 class="list-group-item-heading">Themes</h4>
                    <p class="list-group-item-text">
                        The grid comes with many built in themes and also the ability to design
                        your own theme. Get the grid to fit the overall look and feel of your
                        application.
                    </p>
                </div>
            </a>

            <a href="/javascript-grid-components/" class="list-group-item">
                <div class="float-parent">
                    <div class="section-icon-container">
                        <img src="../images/svg/docs/components.svg" width="50" />
                    </div>
                    <h4>Components</h4>
                    <p class="list-group-item-text">
                        Introduce your own behaviours into the grid by providing custom
                        components such as Cell Renderers, Cell Editors, Filters and
                        Header Components. These can be done using plain JavaScript
                        or a framework of your choice eg Angular or React.
                    </p>
                </div>
            </a>

            <a href="/javascript-grid-examples/" class="list-group-item">
                <div class="float-parent">
                    <div class="section-icon-container">
                        <img src="../images/svg/docs/examples.svg" width="50" />
                    </div>
                    <h4>Examples</h4>
                    <p class="list-group-item-text">
                        End to end examples demonstrating many of the features of ag-Grid.
                    </p>
                </div>
            </a>

        </div>

    </div>


    <div class="col-md-3">
        <?php include 'documentation_sidebar.php'; ?>
    </div>

</div>


<?php include 'documentation_footer.php'; ?>
