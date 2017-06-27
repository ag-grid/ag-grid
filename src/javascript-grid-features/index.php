<?php
$key = "Features";
$pageTitle = "ag-Grid Features";
$pageDescription = "ag-Grid Features";
$pageKeyboards = "ag-Grid Features";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="features">
        <img src="../images/svg/docs/features.svg" width="50" />
        Features
    </h2>

    <p>
        The features part of the documentation goes through all the features in detail
        along with examples.
    </p>

    <h2 id="examples">Examples</h2>

    <p>
        Most of the examples are provided in plain JavaScript. Where examples are available
        in your framework of choice, these will also be linked to.
    </p>

    <h2 id="examples">Free vs Enterprise Features</h2>

    <p>
        All enterprise features are marked with the following symbol in the menu:
    </p>
    <div style="margin-top: 10px; margin-bottom: 20px; display: inline-block; padding: 20px; border: 1px solid lightgrey;">
        <img   src="../images/enterprise_50.png"/>
    </div>

    <p>
        When you see this symbol, the feature is only available in ag-Grid Enterprise.
    </p>
</div>

    <h2> Overview of Features </h2>
<div class="row examples">
            <div class="col-md-6 example">
                <h3>Big data & Performance</h3>
                <i class="fa fa-rocket example-icon short" aria-hidden="true"></i>
                <p>ag-Grid is the best performing grid in the world, it can handle large sets of complex data while
                    performing as its best. <a href="/example.php" target="_blank">Watch our main demo</a></p>

            </div>
            <div class="col-md-6 example ">
                <h3>Filter & Search</h3>
                <i class="fa fa-filter example-icon narrow" aria-hidden="true"></i>
                <p>ag-Grid offers the most advanced filtering and search you can imagine, and lets you even create your own filter
                    components using your favourite framework. <a href="/javascript-grid-filter-external/" target="_blank">
                        Bespoke filtering</a>, <a href="/javascript-grid-filtering/" target="_blank">Column filtering</a>,
                    <a href="/javascript-grid-filter-set/" target="_blank">Excel like column filtering</a>,
                    <a href="/javascript-grid-filter-quick/" target="_blank">Search</a></p>
            </div>
        </div>

        <div class="row examples">
            <div class="col-md-6 example">
                <h3>Pivoting</h3>
                <i class="fa fa-microchip example-icon narrow" aria-hidden="true"></i>
                <p>ag-Grid allows the user to slice and dice the data on their end, very similar to the Excel pivoting
                    functionality, it allows the user to transform rows into columns, apply calculations, group data...
                    <a href="/javascript-grid-pivoting/" target="_blank">Check our pivot docs and examples</a></p>

            </div>
            <div class="col-md-6 example ">
                <h3>Live updates</h3>
                <i class="fa fa-bolt example-icon xnarrow" aria-hidden="true"></i>
                <p>ag-Grid lets you update the data in your grid in different fashions depending on your business case so your
                    updates all are always pushed immediately to your user
                    <a href="/javascript-grid-viewport/" target="_blank">Server push - Viewport</a>,
                    <a href="/javascript-grid-refresh/" target="_blank">Local push</a></p>
            </div>
        </div>

        <div class="row examples">
            <div class="col-md-6 example">
                <h3>CRUD</h3>
                <i class="fa fa-pencil-square-o example-icon" aria-hidden="true"></i>
                <p>ag-Grid gives you out of the box all you need to enable your CRUD operations, and if you need to create your
                    own editors, it lets you do so by using your favourite framework
                    <a href="/javascript-grid-cell-editing/" target="_blank">Editing documentation</a>,
                    <a href="/javascript-grid-cell-editor/" target="_blank">Creating your own editors</a></p>

            </div>
            <div class="col-md-6 example ">
                <h3>Excel integration</h3>
                <i class="fa fa-file-excel-o example-icon" aria-hidden="true"></i>
                <p>ag-Grid lets you generate excel files that will look and feel exactly the same as the ones that you
                    provide in your application, all without server interaction.
                    <a href="/javascript-grid-excel/" target="_blank">Excel export docs</a></p>
            </div>
        </div>

        <div class="row examples">
            <div class="col-md-6 example">
                <h3>Clipboard</h3>
                <i class="fa fa-clipboard example-icon" aria-hidden="true"></i>
                <p>ag-Grid gives you the ability to copy and paste between grids, excel or most of the major applications,
                    this works in combination with the ability to select complex ranges in the grid
                    <a href="/javascript-grid-clipboard/" target="_blank">Clipboard</a>,
                    <a href="/javascript-grid-range-selection/" target="_blank">Range selection</a></p>

            </div>
            <div class="col-md-6 example ">
                <h3>Grouping, Pinning and Managing columns</h3>
                <i class="fa fa-arrows-alt example-icon" aria-hidden="true"></i>
                <p>ag-Grid offers all the most advanced features for managing columns, including the ability to drag&drop
                    them, or create your own column header components using your favourite framework.
                    <a href="/javascript-grid-resizing/" target="_blank">Resizing columns</a>,
                    <a href="/javascript-grid-pinning/" target="_blank">Pinning columns</a>,
                    <a href="/javascript-grid-grouping-headers/" target="_blank">Grouping headers</a>,
                    <a href="/javascript-grid-header-rendering/" target="_blank">Creating your own headers</a></p>
            </div>
        </div>

        <div class="row examples">
            <div class="col-md-6 example">
                <h3>Sorting</h3>
                <i class="fa fa-sort example-icon narrow" aria-hidden="true"></i>
                <p>ag-Grid offers out of the box lighting fast sorting, and lets you provide your own sort comparators,
                    sort by many columns, animations...
                    <a href="/javascript-grid-sorting/" target="_blank">Sort documentation</a></p>

            </div>
            <div class="col-md-6 example ">
                <h3>APIs</h3>
                <i class="fa fa-fighter-jet example-icon" aria-hidden="true"></i>
                <p>ag-Grid it's by programmers to programmers, anything you can do through the UI you can do through APIs
                    the number of different options for customisation are endless.
                    <a href="/javascript-grid-properties/" target="_blank">Grid properties</a>,
                    <a href="/javascript-grid-api/" target="_blank">Grid api</a>,
                    <a href="/javascript-grid-column-definitions/" target="_blank">Column properties</a>,
                    <a href="/javascript-grid-column-api/" target="_blank">Column api</a>,
                    <a href="/javascript-grid-events/" target="_blank">Events</a>
                    <a href="/javascript-grid-callbacks/" target="_blank">Callbacks</a>
                </p>
            </div>
        </div>

        <div class="row examples">
            <div class="col-md-6 example">
                <h3>Pagination</h3>
                <i class="fa fa-list-ol example-icon" aria-hidden="true"></i>
                <p>ag-Grid offers you the ability to paginate no matter where your data comes from and all by providing
                    very minimal configuration.
                    <a href="/javascript-grid-pagination/" target="_blank">Pagination docs</a>
                </p>

            </div>
            <div class="col-md-6 example ">
                <h3>Totals, Tree Data and Row Grouping</h3>
                <i class="fa fa-plus-square example-icon" aria-hidden="true"></i>
                <p>ag-Grid lets you group data, rows and provide totals any way you want.
                    <a href="/javascript-grid-tree/" target="_blank">Tree data</a>,
                    <a href="/javascript-grid-floating/" target="_blank">Floating rows</a>,
                    <a href="/javascript-grid-grouping/" target="_blank">Grouping rows</a>,
                    <a href="/javascript-grid-aggregation/" target="_blank">Aggregation</a>,
                    <a href="/javascript-grid-full-width-rows/" target="_blank">Full width rows</a>
                </p>
            </div>
        </div>

        <div class="row examples">
            <div class="col-md-6 example">
                <h3>UI Customisation</h3>
                <i class="fa fa-sliders example-icon" aria-hidden="true"></i>
                <p>ag-Grid lets you configure any UI aspect. Almost everything that you see in the UI it's configurable
                    <a href="/javascript-grid-styling/" target="_blank">Creating your own theme</a>,
                    <a href=/javascript-grid-themes/fresh-theme.php target="_blank">Fresh theme</a>,
                    <a href="/javascript-grid-themes/blue-theme.php" target="_blank">Blue theme</a>,
                    <a href="/javascript-grid-themes/dark-theme.php" target="_blank">Dark theme</a>,
                    <a href="/javascript-grid-themes/material-theme.php" target="_blank">Material theme</a>,
                    <a href="/javascript-grid-themes/bootstrap-theme.php" target="_blank">Bootstrap theme</a>,
                    <a href="/javascript-grid-cell-styling/" target="_blank">Cell Styling</a>
                </p>

            </div>
            <div class="col-md-6 example ">
                <h3>Complex cell content</h3>
                <i class="fa fa-superscript example-icon" aria-hidden="true"></i>
                <p>ag-Grid lets you create complex content going beyond of just rendering some plain data.
                    <a href="/javascript-grid-value-getters/" target="_blank">Formatting your data</a>,
                    <a href=/javascript-grid-cell-expressions/" target="_blank">Computed cells</a>,
                    <a href="/javascript-grid-master-detail/" target="_blank">Nesting grids</a>,
                    <a href="/javascript-grid-cell-rendering/" target="_blank">Cell renderers</a>
                </p>
            </div>
        </div>

        <div class="row examples">
            <div class="col-md-6 example">
                <h3>Charts</h3>
                <i class="fa fa-line-chart example-icon" aria-hidden="true"></i>
                <p>ag-Grid lets you integrate easily thrid party libraries so you can bring charts easily into your grid
                    <a href="/javascript-grid-graphing/" target="_blank">D3 integration example</a>
                </p>

            </div>
            <div class="col-md-6 example ">
                <h3>All the big frameworks</h3>
                <i class="fa fa-magic example-icon" aria-hidden="true"></i>
                <p>ag-Grid lets you work with any of the following frameworks:
                    <a href="/best-angularjs-data-grid/" target="_blank">Angular 1</a>,
                    <a href="/best-angular-2-data-grid/" target="_blank">Angular</a>,
                    <a href="/best-react-data-grid/" target="_blank">React</a>,
                    <a href="/best-vuejs-data-grid/" target="_blank">Vue</a>,
                    <a href="/best-aurelia-data-grid/" target="_blank">Aurelia</a>,
                    <a href="/best-web-component-data-grid/" target="_blank">WebComponents</a>,
                    <a href="/best-javascript-data-grid/" target="_blank">javascript</a>.
                </p>
            </div>
        </div>

<?php include '../documentation-main/documentation_footer.php';?>